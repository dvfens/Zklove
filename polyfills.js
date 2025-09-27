// React Native Polyfills for Blockchain Functionality
import 'react-native-get-random-values';

// Essential crypto polyfills
if (typeof global.crypto === 'undefined') {
  global.crypto = {};
}

if (typeof global.crypto.getRandomValues === 'undefined') {
  global.crypto.getRandomValues = require('react-native-get-random-values').getRandomValues;
}

// Buffer polyfill for ethers.js
if (typeof global.Buffer === 'undefined') {
  global.Buffer = require('buffer').Buffer;
}

// TextEncoder/TextDecoder polyfill
if (typeof global.TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('text-encoding');
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

// Simple fetch polyfill check
if (typeof global.fetch === 'undefined') {
  // Let React Native handle fetch natively
  console.log('Using React Native fetch');
}

console.log('Essential blockchain polyfills loaded successfully');
