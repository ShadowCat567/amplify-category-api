#!/usr/bin/env node
import 'source-map-support/register';
import { App, Stack, Duration, Tags } from 'aws-cdk-lib';
// @ts-ignore
import { AmplifyGraphqlApi, AmplifyGraphqlDefinition } from '@aws-amplify/graphql-api-construct';

const packageJson = require('../package.json');

const app = new App();
const stack = new Stack(app, packageJson.name.replace(/_/g, '-'), {
  env: { region: process.env.CLI_REGION || 'us-west-2' },
});

new AmplifyGraphqlApi(stack, 'GraphqlApi', {
  apiName: 'MyGraphQLApi',
  definition: AmplifyGraphqlDefinition.fromString(
    /* GraphQL */ `
      type Todo @model @auth(rules: [{ allow: public }]) {
        id: ID!
        description: String!
        name: String! @index(name: "byName")
      }
    `,
    {
      dbType: 'DYNAMODB',
      provisionStrategy: 'AMPLIFY_TABLE',
    },
  ),
  authorizationModes: {
    apiKeyConfig: { expires: Duration.days(7) },
  },
});

Tags.of(stack).add('created-by', 'amplify-original');
Tags.of(stack).add('amplify:deployment-type', 'sandbox-original');
Tags.of(stack).add('amplify:friendly-name', 'amplifyData-original');
