export type {
  IAMAuthorizationConfig,
  UserPoolAuthorizationConfig,
  OIDCAuthorizationConfig,
  ApiKeyAuthorizationConfig,
  LambdaAuthorizationConfig,
  AuthorizationConfig,
  AmplifyApiGraphqlSchema,
  AmplifyApiSchemaPreprocessor,
  AmplifyApiSchemaPreprocessorOutput,
  AmplifyGraphqlApiProps,
  AmplifyGraphqlApiResources,
  AmplifyGraphqlApiCfnResources,
  FunctionSlotBase,
  MutationFunctionSlot,
  QueryFunctionSlot,
  SubscriptionFunctionSlot,
  FunctionSlot,
  FunctionSlotOverride,
  ConflictResolution,
  ConflictDetectionType,
  ConflictHandlerType,
  OptimisticConflictResolutionStrategy,
  CustomConflictResolutionStrategy,
  AutomergeConflictResolutionStrategy,
  ConflictResolutionStrategyBase,
  ConflictResolutionStrategy,
  SchemaTranslationBehavior,
} from './types';
export { AmplifyGraphqlApi } from './amplify-graphql-api';

// remove these exports when provided by cli
export { GraphqlOutput, BackendOutputStorageStrategy, BackendOutputEntry, versionedGraphqlOutputSchema } from './graphql-output';
