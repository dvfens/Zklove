#!/usr/bin/env node

/**
 * QR Scanner Fix for zkLove
 * Diagnoses and fixes QR code scanning issues
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 QR Scanner Diagnostic & Fix');
console.log('===============================\n');

// Check QR scanner components
const qrComponents = [
  'components/verification/AadhaarQRScanner.tsx',
  'components/verification/SimpleQRScanner.tsx',
  'components/verification/SelfProtocolQRCode.tsx'
];

console.log('📱 QR Scanner Components Status:');
console.log('================================');

qrComponents.forEach(component => {
  const exists = fs.existsSync(component);
  console.log(`${exists ? '✅' : '❌'} ${component}`);
});

// Check camera permissions
console.log('\n🎥 Camera Permission Configuration:');
console.log('===================================');

const appJsonPath = 'app.json';
if (fs.existsSync(appJsonPath)) {
  const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
  const hasCamera = appJson.expo.android.permissions.includes('android.permission.CAMERA');
  console.log(`${hasCamera ? '✅' : '❌'} Camera permission in app.json`);
  
  const cameraPlugin = appJson.expo.plugins.find(plugin => 
    Array.isArray(plugin) && plugin[0] === 'expo-camera'
  );
  console.log(`${cameraPlugin ? '✅' : '❌'} Expo Camera plugin configured`);
}

// Check package dependencies
console.log('\n📦 QR Scanner Dependencies:');
console.log('============================');

const packageJsonPath = 'package.json';
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const deps = packageJson.dependencies;
  
  const requiredDeps = [
    'expo-camera',
    'expo-barcode-scanner'
  ];
  
  requiredDeps.forEach(dep => {
    const installed = deps[dep];
    console.log(`${installed ? '✅' : '❌'} ${dep}${installed ? ` (${installed})` : ' - MISSING'}`);
  });
}

console.log('\n🔧 Common QR Scanner Issues & Fixes:');
console.log('====================================');

console.log('\n1. 📷 Camera Permission Issues:');
console.log('   Problem: Camera not accessible');
console.log('   Solution: Grant camera permission when prompted');
console.log('   Command: Check device Settings > Apps > zkLove > Permissions');

console.log('\n2. 🌐 Web Environment:');
console.log('   Problem: Camera not available in web browser');
console.log('   Solution: Test on physical device or emulator');
console.log('   Command: npx expo start (then use Expo Go app)');

console.log('\n3. 📱 Device Compatibility:');
console.log('   Problem: Camera not supported on device');
console.log('   Solution: Use manual QR input or different device');

console.log('\n4. 🔍 QR Code Format:');
console.log('   Problem: QR code not recognized');
console.log('   Solution: Ensure QR code is valid Aadhaar format');

console.log('\n🚀 Quick Fixes to Try:');
console.log('======================');

console.log('\n1. Test on Physical Device:');
console.log('   npx expo start');
console.log('   # Install Expo Go app and scan QR code');

console.log('\n2. Grant Camera Permission:');
console.log('   # When app starts, allow camera access');

console.log('\n3. Use Manual QR Input:');
console.log('   # Look for "Manual Input" or "Paste QR Data" option');

console.log('\n4. Test with Demo QR:');
console.log('   # Use the "Load Demo QR" button for testing');

console.log('\n5. Check Console Logs:');
console.log('   # Look for error messages in development console');

console.log('\n💡 Alternative Solutions:');
console.log('=========================');

console.log('\n📋 Manual QR Data Entry:');
console.log('   - Copy QR data from mAadhaar app');
console.log('   - Paste into manual input field');
console.log('   - Process without camera scanning');

console.log('\n🎯 Demo Mode:');
console.log('   - Use built-in demo QR data');
console.log('   - Test verification flow');
console.log('   - Verify app functionality');

console.log('\n📱 Different Verification Methods:');
console.log('   - Face verification');
console.log('   - Document upload');
console.log('   - NFC badge scanning');
console.log('   - Self Protocol verification');

console.log('\n🔍 Debugging Steps:');
console.log('===================');

console.log('\n1. Check if camera permission is granted');
console.log('2. Verify QR scanner component loads');
console.log('3. Test with different QR codes');
console.log('4. Check console for error messages');
console.log('5. Try manual input as fallback');

console.log('\n✅ Most Likely Solutions:');
console.log('=========================');
console.log('1. Run on physical device (not web browser)');
console.log('2. Grant camera permission when prompted');
console.log('3. Use Expo Go app for testing');
console.log('4. Try manual QR input if camera fails');

console.log('\n🎯 Ready to fix QR scanning!');
