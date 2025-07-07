const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: "jsdom",
  setupFiles: ["<rootDir>/jest.setup.js"],
  transform: {
    ...tsJestTransformCfg,
  },
  moduleNameMapper: {
    "^src/(.*)$": "<rootDir>/src/$1",
    "^.+\\.css$": "<rootDir>/__mocks__/styleMock.js"
  },
}; 