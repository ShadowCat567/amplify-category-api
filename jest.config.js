module.exports = {
  preset: 'ts-jest',
  bail: false,
  verbose: true,
  testRunner: 'jest-circus/runner',
  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
  testPathIgnorePatterns: [
    '**/*.d.ts',
    '**/__e2e__/',
    '**/__integration__/',
    'packages/amplify-e2e-core/',
    'packages/amplify-e2e-tests/',
    'packages/graphql-transformers-e2e-tests/',
    'packages/amplify-graphql-transformer-interfaces/',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'core', 'node'],
  collectCoverage: true,
  collectCoverageFrom: ['src/**/.(ts|tsx|js|jsx)$', '!src/**/*.test.(ts|tsx|js|jsx)$', '!src/**/*.d.ts'],
  coverageDirectory: 'coverage',
  projects: [
    '<rootDir>/packages/amplify-graphql-api-construct',
    '<rootDir>/packages/amplify-graphql-auth-transformer',
    '<rootDir>/packages/amplify-graphql-default-value-transformer',
    '<rootDir>/packages/amplify-graphql-function-transformer',
    '<rootDir>/packages/amplify-graphql-http-transformer',
    '<rootDir>/packages/amplify-graphql-index-transformer',
    // '<rootDir>/packages/amplify-graphql-maps-to-transformer',
    '<rootDir>/packages/amplify-graphql-migration-tests',
    '<rootDir>/packages/amplify-graphql-model-transformer',
    // '<rootDir>/packages/amplify-graphql-name-mapping-transformer',
    '<rootDir>/packages/amplify-graphql-predictions-transformer',
    '<rootDir>/packages/amplify-graphql-relational-transformer',
    // '<rootDir>/packages/amplify-graphql-schema-generator',
    '<rootDir>/packages/amplify-graphql-searchable-transformer',
    '<rootDir>/packages/amplify-graphql-sql-transformer',
    // '<rootDir>/packages/amplify-graphql-transformer',
    '<rootDir>/packages/amplify-graphql-transformer-core',
    // '<rootDir>/packages/amplify-graphql-transformer-migrator',
    '<rootDir>/packages/graphql-auth-transformer',
    '<rootDir>/packages/graphql-connection-transformer',
    '<rootDir>/packages/graphql-dynamodb-transformer',
    '<rootDir>/packages/graphql-elasticsearch-transformer',
    '<rootDir>/packages/graphql-function-transformer',
    '<rootDir>/packages/graphql-http-transformer',
    '<rootDir>/packages/graphql-key-transformer',
    '<rootDir>/packages/graphql-mapping-template',
    '<rootDir>/packages/graphql-predictions-transformer',
    '<rootDir>/packages/graphql-relational-schema-transformer',
    '<rootDir>/packages/graphql-transformer-common',
    '<rootDir>/packages/graphql-transformer-core',
    '<rootDir>/packages/graphql-versioned-transformer',
  ],
};
