#!/usr/bin/env node

/**
 * zkLove APK Build Script
 * Alternative methods to build APK without full Android SDK setup
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 zkLove APK Build Script');
console.log('===========================\n');

// Check if we have EAS configured
const easConfigPath = path.join(__dirname, 'eas.json');
const hasEasConfig = fs.existsSync(easConfigPath);

console.log('📱 APK Build Options:');
console.log('=====================\n');

if (hasEasConfig) {
  console.log('✅ Option 1: EAS Build (Recommended)');
  console.log('   - Cloud-based build service');
  console.log('   - No local Android SDK required');
  console.log('   - Professional APK signing');
  console.log('   - Commands:');
  console.log('     1. eas login');
  console.log('     2. eas build --platform android --profile production');
  console.log('');
} else {
  console.log('❌ EAS Build not configured');
  console.log('   Run: eas build:configure');
  console.log('');
}

console.log('🔧 Option 2: Expo Development Build');
console.log('   - For development/testing only');
console.log('   - Commands:');
console.log('     npx create-expo --template');
console.log('');

console.log('🏗️ Option 3: Local Build (Requires Android SDK)');
console.log('   - Need Java JDK 17+');
console.log('   - Need Android SDK');
console.log('   - Need Android Studio or command line tools');
console.log('   - Commands:');
console.log('     1. Set ANDROID_HOME environment variable');
console.log('     2. Set JAVA_HOME environment variable');
console.log('     3. cd android && gradlew assembleRelease');
console.log('');

console.log('📦 Option 4: Expo Go (Testing Only)');
console.log('   - For quick testing');
console.log('   - Cannot build standalone APK');
console.log('   - Commands:');
console.log('     npx expo start');
console.log('');

// Check current environment
console.log('🔍 Current Environment Check:');
console.log('=============================');

// Check if Android directory exists
const androidDir = path.join(__dirname, 'android');
const hasAndroidDir = fs.existsSync(androidDir);
console.log(`Android directory: ${hasAndroidDir ? '✅ Present' : '❌ Missing'}`);

// Check if we have app.json
const appJsonPath = path.join(__dirname, 'app.json');
const hasAppJson = fs.existsSync(appJsonPath);
console.log(`app.json: ${hasAppJson ? '✅ Present' : '❌ Missing'}`);

// Check if we have package.json
const packageJsonPath = path.join(__dirname, 'package.json');
const hasPackageJson = fs.existsSync(packageJsonPath);
console.log(`package.json: ${hasPackageJson ? '✅ Present' : '❌ Missing'}`);

if (hasPackageJson) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  console.log(`App name: ${packageJson.name}`);
  console.log(`Version: ${packageJson.version}`);
}

console.log('');

// Provide specific instructions
console.log('🎯 Recommended Next Steps:');
console.log('==========================');
console.log('1. Create an Expo account at https://expo.dev');
console.log('2. Run: eas login');
console.log('3. Run: eas build --platform android --profile production');
console.log('4. Wait for build to complete (5-15 minutes)');
console.log('5. Download APK from provided URL');
console.log('');

console.log('💡 Alternative for Testing:');
console.log('===========================');
console.log('1. Install Expo Go app on your Android device');
console.log('2. Run: npx expo start');
console.log('3. Scan QR code with Expo Go app');
console.log('4. Test app functionality directly');
console.log('');

console.log('🔐 For Production APK:');
console.log('======================');
console.log('- EAS Build provides signed APKs ready for distribution');
console.log('- Includes proper Android app signing');
console.log('- Optimized builds with proper certificates');
console.log('- Can be uploaded directly to Google Play Store');
console.log('');

console.log('📱 APK will include all zkLove features:');
console.log('=======================================');
console.log('✅ Self Protocol identity verification');
console.log('✅ Face recognition and liveness detection');
console.log('✅ Document verification and OCR');
console.log('✅ NFC badge scanning (ETHGlobal)');
console.log('✅ QR code verification');
console.log('✅ Blockchain integration');
console.log('✅ Zero-knowledge proof generation');
console.log('✅ Privacy-first biometric processing');
console.log('');

console.log('🚀 Ready to build your zkLove APK!');
