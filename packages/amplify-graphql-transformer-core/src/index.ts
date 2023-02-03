import { print } from 'graphql';
import { EXTRA_DIRECTIVES_DOCUMENT } from './transformation/validation';

export {
  GraphQLTransform,
  GraphQLTransformOptions,
  SyncUtils,
} from './transformation';
export {
  DeploymentResources,
  OverrideConfig,
  default as Template,
  UserDefinedSlot,
  UserDefinedResolver,
} from './transformation/types';
export { validateModelSchema } from './transformation/validation';
export {
  ConflictDetectionType,
  ConflictHandlerType,
  ResolverConfig,
  SyncConfig,
  SyncConfigOptimistic,
  SyncConfigServer,
  SyncConfigLambda,
  TransformConfig,
  TransformerProjectConfig,
  DatasourceType,
} from './config/index';
export {
  constructDefaultGlobalAmplifyInput,
  constructRDSGlobalAmplifyInput,
  GetArgumentsOptions,
  generateGetArgumentsInput,
  getTable,
  getKeySchema,
  getSortKeyFieldNames,
  getParameterStoreSecretPath,
  getRDSDBConfigFromAmplifyInput,
  collectDirectives,
  collectDirectivesByTypeNames,
  DirectiveWrapper,
  IAM_AUTH_ROLE_PARAMETER,
  IAM_UNAUTH_ROLE_PARAMETER,
  getRDSGlobalAmplifyInput,
  readRDSGlobalAmplifyInput,
  RDSDBConfig,
} from './utils';
export * from './utils/operation-names';
export * from './errors';
export {
  TransformerModelBase,
  TransformerModelEnhancerBase,
  TransformerPluginBase,
  TransformerAuthBase,
} from './transformation/transformer-plugin-base';
export { TransformerResolver, StackManager } from './transformer-context';
export {
  ImportAppSyncAPIInputs,
  ImportedDataSourceType,
  ImportedRDSType,
  RDS_SCHEMA_FILE_NAME,
  RDSConnectionSecrets,
} from './types';
/**
 * Returns the extra set of directives that are supported by AppSync service.
 */
export const getAppSyncServiceExtraDirectives = (): string => {
  return print(EXTRA_DIRECTIVES_DOCUMENT);
};

export { MappingTemplate, TransformerNestedStack } from './cdk-compat';
export {
  EnumWrapper,
  FieldWrapper,
  InputFieldWrapper,
  InputObjectDefinitionWrapper,
  ObjectDefinitionWrapper,
} from './wrappers/object-definition-wrapper';

export { AmplifyApiGraphQlResourceStackTemplate } from './types/amplify-api-resource-stack-types';
