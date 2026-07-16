// Eigenständige Jest-Konfiguration für den puren TS-Kern der Engine.
// Bewusst OHNE jest-expo/React-Native – die Engine darf keine Plattform-
// Abhängigkeiten haben und läuft daher in einer reinen Node-Umgebung.
const path = require("path");

module.exports = {
  rootDir: path.resolve(__dirname, "../../.."),
  testEnvironment: "node",
  testMatch: ["<rootDir>/src/data/battlebre-engine/**/*.test.ts"],
  transform: {
    "^.+\\.[jt]sx?$": [
      "babel-jest",
      {
        configFile: false,
        babelrc: false,
        presets: ["babel-preset-expo"],
      },
    ],
  },
  transformIgnorePatterns: ["/node_modules/(?!(jszip|fast-xml-parser)/)"],
};
