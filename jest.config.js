module.exports = {
  preset: "@shelf/jest-mongodb",
  roots: ["<rootDir>/src"],
  coverageDirectory: "coverage",
  coverageProvider: "v8",
  testEnvironment: "node",
  transform: { ".+\\.ts$": "ts-jest" },
};
