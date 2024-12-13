module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    testMatch: ['**/__tests__/**/*.test.[jt]s?(x)'],
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js']
  };