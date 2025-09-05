module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/packages'],
  transform: {},
  // Restrict to JS tests to avoid needing TS transforms in CI
  testMatch: ['**/tests/**/*.test.js'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json', 'node'],
};
