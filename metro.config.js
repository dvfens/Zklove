const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add support for blockchain and crypto libraries
config.resolver.alias = {
  ...config.resolver.alias,
  'crypto': 'react-native-crypto-js',
  'stream': 'stream-browserify',
  'buffer': 'buffer',
};

// Add crypto and buffer to the list of modules to be resolved
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Handle node modules that need polyfills
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

// Fix for InternalBytecode.js issue
config.resolver.sourceExts = [...config.resolver.sourceExts, 'js', 'jsx', 'ts', 'tsx'];

// Exclude problematic files and directories
config.resolver.blacklistRE = /InternalBytecode\.js$/;

module.exports = config;
