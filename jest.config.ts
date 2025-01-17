import { Config } from 'jest';

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.ts'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  verbose: true,
  moduleNameMapper: {
    'src/(.*)$': '<rootDir>/src/$1',
    'test/(.*)$': '<rootDir>/test/$1',
  },
};

export default config;
