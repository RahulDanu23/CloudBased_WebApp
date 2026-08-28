module.exports = {
  testEnvironment: 'node',
  clearMocks: true,
  testMatch: [
    "**/tests/**/*.test.js"
  ],
  moduleNameMapper: {
    "^uuid$": "<rootDir>/__mocks__/uuid.js"
  }
};
