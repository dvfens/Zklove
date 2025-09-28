const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add support for blockchain and crypto libraries
config.resolver.alias = {
  ...config.resolver.alias,
  'crypto': 'react-native-crypto-js',
  'stream': 'stream-browserify',
  'buffer': 'buffer'
};

// Handle node modules that need polyfills
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

// Add crypto and buffer to the list of modules to be resolved
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Fix for InternalBytecode.js issue - exclude it completely
config.resolver.blacklistRE = /InternalBytecode\.js$/;

// Add transformer configuration to handle problematic files
config.transformer = {
  ...config.transformer,
  minifierConfig: {
    ...config.transformer.minifierConfig,
    // Configure minifier for production builds
    keep_fnames: true,
    mangle: {
      keep_fnames: true
    }
  }
};

module.exports = config;