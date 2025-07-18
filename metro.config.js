// metro.config.js
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Add platform-specific extensions
config.resolver.platforms = ["web", "native", "ios", "android"];

// Add platform-specific file extensions
config.resolver.sourceExts = [
  ...config.resolver.sourceExts,
  "web.js",
  "web.jsx",
  "web.ts",
  "web.tsx",
  "svg", // Add SVG support
];

// Configure SVG transformer
config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve("react-native-svg-transformer"),
};

// Remove SVG from asset extensions and add it to source extensions
config.resolver.assetExts = config.resolver.assetExts.filter(
  (ext) => ext !== "svg"
);
config.resolver.assetExts = [
  ...config.resolver.assetExts,
  "ttf",
  "woff",
  "woff2",
];

config.resolver.extraNodeModules = {
  "import.meta": { url: "" },
};

module.exports = withNativeWind(config, { input: "./global.css" });
