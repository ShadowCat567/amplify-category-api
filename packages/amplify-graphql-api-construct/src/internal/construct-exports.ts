import { Template } from '@aws-amplify/graphql-transformer-interfaces';
import { CfnResource } from 'aws-cdk-lib';
import {
  CfnGraphQLApi,
  CfnGraphQLSchema,
  CfnApiKey,
  CfnResolver,
  CfnFunctionConfiguration,
  CfnDataSource,
} from 'aws-cdk-lib/aws-appsync';
import { CfnTable } from 'aws-cdk-lib/aws-dynamodb';
import { CfnRole, CfnPolicy } from 'aws-cdk-lib/aws-iam';
import { CfnInclude } from 'aws-cdk-lib/cloudformation-include';
import { AmplifyGraphqlApiResources } from '../types';

/**
 * Internal type for tracking which underlying nested stack (or root stack)
 * a referenced resource comes from, necessary for when we're generating the
 * L1/L2 constructs that are accessible underneath this construct.
 */
type StackResourceMapping = {
  stackName: string | null; // Null indicates root stack
  id: string;
};

/**
 * Everything below here is intended to help us gather the
 * output values and render out the L1 resources for access.
 *
 * All of this is based on
 * https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.cloudformation_include-readme.html
 *
 * @param rootStack RootStack CFN Template (Unmodified)
 * @param stacks Nested Stack CFN Templates (Unmodified)
 * @param transformerStack CFN Included Stack to Retrieve Resources From
 * @returns a mapping of L1 constructs generated by the Transformer.
 */
export const generateConstructExports = (
  rootStack: Template,
  stacks: Record<string, Template>,
  transformerStack: CfnInclude,
): AmplifyGraphqlApiResources => {
  const singletonReferenceMapping: Record<string, StackResourceMapping> = {};
  const cfnResolverResourceMapping: StackResourceMapping[] = [];
  const cfnAppSyncFunctionResourceMapping: StackResourceMapping[] = [];
  const cfnDataSourceResourceMapping: StackResourceMapping[] = [];
  const cfnTableResourceMapping: StackResourceMapping[] = [];
  const cfnRoleResourceMapping: StackResourceMapping[] = [];
  const cfnPolicyResourceMapping: StackResourceMapping[] = [];
  const additionalResourceMapping: StackResourceMapping[] = [];

  const unreportedResourceTypes = new Set([
    'AWS::CloudFormation::Stack',
  ]);

  const singletonReferenceTypes = new Set([
    'AWS::AppSync::GraphQLApi',
    'AWS::AppSync::GraphQLSchema',
    'AWS::AppSync::ApiKey',
  ]);

  const collectionResourceMapping: { [key: string]: any } = {
    'AWS::AppSync::DataSource': cfnDataSourceResourceMapping,
    'AWS::DynamoDB::Table': cfnTableResourceMapping,
    'AWS::IAM::Role': cfnRoleResourceMapping,
    'AWS::IAM::Policy': cfnPolicyResourceMapping,
    'AWS::AppSync::FunctionConfiguration': cfnAppSyncFunctionResourceMapping,
    'AWS::AppSync::Resolver': cfnResolverResourceMapping,
  };

  const addResourceToMappedResources = (stackName: string | null, id: string, definition: any): void => {
    const resourceMapping = { stackName, id };
    const type = definition.Type;
    if (unreportedResourceTypes.has(type)) {
      return;
    }
    if (singletonReferenceTypes.has(type)) {
      singletonReferenceMapping[type] = resourceMapping;
      return;
    }
    if (type in collectionResourceMapping) {
      collectionResourceMapping[type].push(resourceMapping);
      return;
    }
    additionalResourceMapping.push(resourceMapping);
  };

  Object.entries((rootStack.Resources ?? {})).forEach(([id, definition]) => addResourceToMappedResources(null, id, definition));

  Object.entries(stacks).forEach(([stackName, nestedStack]) => {
    Object.entries((nestedStack.Resources ?? {})).forEach(([id, definition]) => addResourceToMappedResources(stackName, id, definition));
  });

  const apiResourceMapping = singletonReferenceMapping['AWS::AppSync::GraphQLApi'];
  const schemaResourceMapping = singletonReferenceMapping['AWS::AppSync::GraphQLSchema'];
  const apiKeyResourceMapping = singletonReferenceMapping['AWS::AppSync::ApiKey'];

  if (!apiResourceMapping || !schemaResourceMapping) {
    throw new Error('expected an api and schema');
  }

  const getL1Resource = <T extends CfnResource>({ stackName, id }: StackResourceMapping): T => {
    const referencedStack = stackName
      ? transformerStack.getNestedStack(stackName).includedTemplate
      : transformerStack;
    return referencedStack.getResource(id) as T;
  };

  // eslint-disable-next-line arrow-body-style
  const getL1Resources = <T extends CfnResource>(mappings: StackResourceMapping[]): Record<string, T> => {
    return Object.fromEntries(mappings.map((stackResourceMapping) => [stackResourceMapping.id, getL1Resource<T>(stackResourceMapping)]));
  };

  return {
    api: getL1Resource<CfnGraphQLApi>(apiResourceMapping),
    schema: getL1Resource<CfnGraphQLSchema>(schemaResourceMapping),
    apiKey: apiKeyResourceMapping && <CfnApiKey>getL1Resource(apiKeyResourceMapping),
    resolvers: getL1Resources<CfnResolver>(cfnResolverResourceMapping),
    appsyncFunctions: getL1Resources<CfnFunctionConfiguration>(cfnAppSyncFunctionResourceMapping),
    dataSources: getL1Resources<CfnDataSource>(cfnDataSourceResourceMapping),
    tables: getL1Resources<CfnTable>(cfnTableResourceMapping),
    roles: getL1Resources<CfnRole>(cfnRoleResourceMapping),
    policies: getL1Resources<CfnPolicy>(cfnPolicyResourceMapping),
    additionalResources: getL1Resources(additionalResourceMapping),
  };
};
