export default {
  // This is needed to run Jest with Typescript via ts-jest (library that defines TS adapters for Jest)
  preset: 'ts-jest',

  // Automatically clear mock calls, instances, contexts and results before every test
  clearMocks: true,

  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: true,

  // The directory where Jest should output its coverage files
  coverageDirectory: 'coverage',

  // Indicates which provider should be used to instrument code for coverage
  coverageProvider: 'v8',

  // A map from regular expressions to module names or to arrays of module names that allow to stub out resources with a single module
  // ts-jest will
  //   1. look for every `import` and match against key
  //   2. for each import
  //     1. see if the import is a node_module or a relative path
  //     2. if it's a relative path, see if it's valid
  //     3. if it's valid, then use keys in moduleNameMapper to map to different location if applicable
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
  },

  // The glob patterns Jest uses to detect test files
  testMatch: ['**/tst/*.ts'],
};
