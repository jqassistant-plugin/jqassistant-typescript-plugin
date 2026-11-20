/** @type {import("ts-jest").JestConfigWithTsJest} */
module.exports = {
    preset: "ts-jest/presets/js-with-ts",
    // commander is an ES module only, Jest can only load it when it is transformed to CommonJS
    transformIgnorePatterns: ["/node_modules/(?!commander/)"],
    testEnvironment: "node",
    moduleDirectories: ["node_modules", "src", "test"],
    modulePathIgnorePatterns: ["/sample-projects/"],
    maxWorkers: 1,
    roots: ["<rootDir>/test"],
};
