// Mock InternalBytecode.js to prevent Metro bundler errors
// This file is used as a fallback when the real InternalBytecode.js is not found

module.exports = {
  // Mock implementation to prevent build errors
  default: () => {},
  __esModule: true
};