import {
  DirectiveWrapper,
  generateGetArgumentsInput,
  InvalidDirectiveError,
  MappingTemplate,
  TransformerPluginBase,
} from '@aws-amplify/graphql-transformer-core';
import { TransformerContextProvider, TransformerSchemaVisitStepContextProvider } from '@aws-amplify/graphql-transformer-interfaces';
import * as cdk from 'aws-cdk-lib';
import { obj, str, ref, printBlock, compoundExpression, Expression, set, methodCall, ifElse, toJson } from 'graphql-mapping-template';
import { ResolverResourceIDs, ResourceConstants } from 'graphql-transformer-common';
import { DirectiveNode, ObjectTypeDefinitionNode, InterfaceTypeDefinitionNode, FieldDefinitionNode } from 'graphql';

type SqlDirectiveConfiguration = {
  statement: string | undefined;
  reference: string | undefined;
  resolverTypeName: string;
  resolverFieldName: string;
};

const SQL_DIRECTIVE_STACK = 'CustomSQLStack';
const directiveDefinition = /* GraphQL */ `
  directive @sql(statement: String, reference: String) on FIELD_DEFINITION
`;

export class SqlTransformer extends TransformerPluginBase {
  private sqlDirectiveFields: Map<FieldDefinitionNode, SqlDirectiveConfiguration[]> = new Map();

  constructor() {
    super('amplify-sql-transformer', directiveDefinition);
  }

  field = (
    parent: ObjectTypeDefinitionNode | InterfaceTypeDefinitionNode,
    definition: FieldDefinitionNode,
    directive: DirectiveNode,
    ctx: TransformerSchemaVisitStepContextProvider,
  ): void => {
    if (parent.name.value !== 'Query' && parent.name.value !== 'Mutation') {
      throw new InvalidDirectiveError(
        `@sql directive can only be used on Query or Mutation types. Check type "${parent.name.value}" and field "${definition.name.value}".`,
      );
    }

    const directiveWrapped = new DirectiveWrapper(directive);
    if (
      !directive?.arguments?.find((arg) => arg.name.value === 'statement') &&
      !directive?.arguments?.find((arg) => arg.name.value === 'reference')
    ) {
      throw new InvalidDirectiveError(
        `@sql directive must have either a 'statement' or 'reference' argument. Check type "${parent.name.value}" and field "${definition.name.value}".`,
      );
    }

    const args = directiveWrapped.getArguments(
      {
        resolverTypeName: parent.name.value,
        resolverFieldName: definition.name.value,
      } as SqlDirectiveConfiguration,
      generateGetArgumentsInput(ctx.transformParameters),
    );
    let resolver = this.sqlDirectiveFields.get(definition);

    if (resolver === undefined) {
      resolver = [];
      this.sqlDirectiveFields.set(definition, resolver);
    }

    resolver.push(args);
  };

  generateResolvers = (context: TransformerContextProvider): void => {
    if (this.sqlDirectiveFields.size === 0) {
      return;
    }

    const stack: cdk.Stack = context.stackManager.createStack(SQL_DIRECTIVE_STACK);
    const env = context.synthParameters.amplifyEnvironmentName;

    stack.templateOptions.templateFormatVersion = '2010-09-09';
    stack.templateOptions.description = 'An auto-generated nested stack for the @sql directive.';

    new cdk.CfnCondition(stack, ResourceConstants.CONDITIONS.HasEnvironmentParameter, {
      expression: cdk.Fn.conditionNot(cdk.Fn.conditionEquals(env, ResourceConstants.NONE)),
    });

    this.sqlDirectiveFields.forEach((resolverFns) => {
      resolverFns.forEach((config) => {
        const { RDSLambdaDataSourceLogicalID: dataSourceId } = ResourceConstants.RESOURCES;
        const dataSource = context.api.host.getDataSource(dataSourceId);
        const MISSING_QUERY_STATEMENT = 'MISSING_CUSTOM_QUERY';
        if (config.reference && !context.customQueries.has(config.reference)) {
          throw new InvalidDirectiveError(
            `@sql directive 'reference' argument must be a valid custom query name. Check type "${config.resolverTypeName}" and field "${config.resolverFieldName}". The custom query "${config.reference}" does not exist in "sql-statements" directory.`,
          );
        }

        const statement = config.statement ?? (config.reference ? context.customQueries.get(config.reference) : MISSING_QUERY_STATEMENT);
        const resolverResourceId = ResolverResourceIDs.ResolverResourceID(config.resolverTypeName, config.resolverFieldName);
        const resolver = context.resolvers.generateQueryResolver(
          config.resolverTypeName,
          config.resolverFieldName,
          resolverResourceId,
          dataSource as any,
          MappingTemplate.s3MappingTemplateFromString(
            generateSqlLambdaRequestTemplate(statement ?? MISSING_QUERY_STATEMENT, 'RAW_SQL', config.resolverFieldName),
            `${config.resolverTypeName}.${config.resolverFieldName}.req.vtl`,
          ),
          MappingTemplate.s3MappingTemplateFromString(
            generateSqlLambdaResponseMappingTemplate(),
            `${config.resolverTypeName}.${config.resolverFieldName}.res.vtl`,
          ),
        );

        resolver.setScope(context.stackManager.getScopeFor(resolverResourceId, SQL_DIRECTIVE_STACK));
        context.resolvers.addResolver(config.resolverTypeName, config.resolverFieldName, resolver);
      });
    });
  };
}

export const generateSqlLambdaRequestTemplate = (statement: string, operation: string, operationName: string): string => {
  return printBlock('Invoke RDS Lambda data source')(
    compoundExpression([
      set(ref('lambdaInput'), obj({})),
      set(ref('lambdaInput.parameters'), obj({})),
      set(ref('lambdaInput.statement'), str(statement)),
      set(ref('lambdaInput.operation'), str(operation)),
      set(ref('lambdaInput.operationName'), str(operationName)),
      set(ref('lambdaInput.parameters'), methodCall(ref('util.defaultIfNull'), ref('context.arguments'), obj({}))),
      obj({
        version: str('2018-05-29'),
        operation: str('Invoke'),
        payload: methodCall(ref('util.toJson'), ref('lambdaInput')),
      }),
    ]),
  );
};

export const generateSqlLambdaResponseMappingTemplate = (): string => {
  const statements: Expression[] = [];

  statements.push(
    ifElse(ref('ctx.error'), methodCall(ref('util.error'), ref('ctx.error.message'), ref('ctx.error.type')), toJson(ref('ctx.result'))),
  );

  return printBlock('ResponseTemplate')(compoundExpression(statements));
};
