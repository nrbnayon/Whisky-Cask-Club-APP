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
];

config.resolver.extraNodeModules = {
  "import.meta": { url: "" }, 
};

config.resolver.assetExts = [
  ...config.resolver.assetExts,
  "ttf",
  "woff",
  "woff2",
];

module.exports = withNativeWind(config, { input: "./global.css" });
