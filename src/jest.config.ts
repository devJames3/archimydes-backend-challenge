import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',              // Use ts-jest for TypeScript support
  testEnvironment: 'node',        // Backend project = node env
  roots: ['<rootDir>/src/tests'], // Look for tests here
  transform: {
    '^.+\\.(ts|tsx)?$': 'ts-jest',
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  clearMocks: true,               // Auto-clear mocks between tests
  verbose: true,                  // Detailed test output
  collectCoverage: true,          // Collect test coverage
  collectCoverageFrom: ["src/*.ts", "src/**/*.ts"],
  coverageDirectory: 'coverage',  // Store coverage reports here
  coverageProvider: 'v8',         // Modern coverage engine
};

export default config;
