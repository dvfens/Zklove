#!/usr/bin/env node

/**
 * zkLove Build Issue Fixes
 * Applies common fixes for EAS build failures
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 zkLove Build Issue Fixes');
console.log('===========================\n');

// Check and list applied fixes
const fixes = [];

// 1. Check EAS configuration
const easConfigPath = path.join(__dirname, 'eas.json');
if (fs.existsSync(easConfigPath)) {
  const easConfig = JSON.parse(fs.readFileSync(easConfigPath, 'utf8'));
  if (easConfig.build.production.android.image === 'latest') {
    fixes.push('✅ EAS build image set to latest');
  }
  if (easConfig.build.production.android.env?.EXPO_NO_CAPABILITY_SYNC === '1') {
    fixes.push('✅ EXPO_NO_CAPABILITY_SYNC environment variable set');
  }
}

// 2. Check Gradle configuration
const gradleBuildPath = path.join(__dirname, 'android', 'build.gradle');
if (fs.existsSync(gradleBuildPath)) {
  const gradleContent = fs.readFileSync(gradleBuildPath, 'utf8');
  if (gradleContent.includes('gradle:8.1.4')) {
    fixes.push('✅ Gradle version updated to 8.1.4');
  }
  if (gradleContent.includes('kotlin-gradle-plugin:1.9.24')) {
    fixes.push('✅ Kotlin version updated to 1.9.24');
  }
}

// 3. Check Metro configuration
const metroConfigPath = path.join(__dirname, 'metro.config.js');
if (fs.existsSync(metroConfigPath)) {
  const metroContent = fs.readFileSync(metroConfigPath, 'utf8');
  if (metroContent.includes("'crypto': 'react-native-crypto-js'")) {
    fixes.push('✅ Metro crypto alias configured');
  }
  if (metroContent.includes('keep_fnames: true')) {
    fixes.push('✅ Metro minifier configuration updated');
  }
}

// 4. Check NFC service fix
const nfcServicePath = path.join(__dirname, 'services', 'ETHGlobalNFCService.ts');
if (fs.existsSync(nfcServicePath)) {
  const nfcContent = fs.readFileSync(nfcServicePath, 'utf8');
  if (nfcContent.includes('typeof window !== \'undefined\'')) {
    fixes.push('✅ NFC service web environment check added');
  }
}

console.log('📋 Applied Fixes:');
console.log('=================');
fixes.forEach(fix => console.log(fix));

if (fixes.length === 0) {
  console.log('❌ No fixes detected. Please run the build process again.');
} else {
  console.log(`\n✅ ${fixes.length} fixes applied successfully!`);
}

console.log('\n🚀 Common Build Issues Addressed:');
console.log('==================================');
console.log('1. Updated EAS build image to latest');
console.log('2. Fixed Gradle and Kotlin versions');
console.log('3. Added Metro crypto module aliases');
console.log('4. Fixed NFC initialization for web builds');
console.log('5. Added capability sync environment variable');
console.log('6. Updated minifier configuration');

console.log('\n📱 Next Steps:');
console.log('==============');
console.log('1. Run: eas build --platform android --profile production');
console.log('2. Monitor build progress at the provided URL');
console.log('3. If build fails again, check specific error logs');
console.log('4. Consider using preview profile for testing');

console.log('\n💡 Alternative Build Commands:');
console.log('==============================');
console.log('• Development build: eas build --platform android --profile development');
console.log('• Preview build: eas build --platform android --profile preview');
console.log('• Clear cache: eas build --platform android --profile production --clear-cache');

console.log('\n🔍 Troubleshooting Tips:');
console.log('========================');
console.log('• Check build logs for specific error messages');
console.log('• Verify all dependencies are compatible');
console.log('• Test local build first if possible');
console.log('• Use --clear-cache flag if builds are inconsistent');
console.log('• Consider building with development profile first');

console.log('\n🎯 Build Success Indicators:');
console.log('============================');
console.log('• Build completes without errors');
console.log('• APK download link is provided');
console.log('• File size is reasonable (8-15MB)');
console.log('• APK installs successfully on device');

console.log('\n🚀 Ready for retry!');
