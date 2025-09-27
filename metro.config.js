const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

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

// Create a mock InternalBytecode.js to prevent errors
config.resolver.alias = {
  ...config.resolver.alias,
  'InternalBytecode.js': path.resolve(__dirname, 'mock-internal-bytecode.js'),
  // Fix React 19 compiler runtime import
  'react/compiler-runtime': path.resolve(__dirname, 'react-compiler-runtime-shim.js')
};

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

// Add resolver configuration to ignore problematic files
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

module.exports = config;
