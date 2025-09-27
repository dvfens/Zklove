#!/usr/bin/env node

/**
 * Emergency Build Fix for zkLove
 * Applies aggressive fixes for persistent build failures
 */

const fs = require('fs');
const path = require('path');

console.log('🚨 Emergency Build Fix for zkLove');
console.log('=================================\n');

// 1. Create minimal EAS config
console.log('1. Creating minimal EAS configuration...');
const minimalEasConfig = {
  "cli": {
    "version": ">= 16.0.0"
  },
  "build": {
    "production": {
      "android": {
        "buildType": "apk"
      }
    }
  }
};

fs.writeFileSync('eas-emergency.json', JSON.stringify(minimalEasConfig, null, 2));
console.log('✅ Created eas-emergency.json');

// 2. Check for problematic dependencies
console.log('\n2. Checking for problematic dependencies...');
const packageJsonPath = path.join(__dirname, 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const problematicDeps = [];
  
  // Check for known problematic dependencies
  const knownIssues = [
    'react-native-nfc-manager',
    '@noble/hashes',
    'ethers',
    'snarkjs'
  ];
  
  knownIssues.forEach(dep => {
    if (packageJson.dependencies[dep]) {
      problematicDeps.push(`${dep}@${packageJson.dependencies[dep]}`);
    }
  });
  
  if (problematicDeps.length > 0) {
    console.log('⚠️  Found potentially problematic dependencies:');
    problematicDeps.forEach(dep => console.log(`   - ${dep}`));
  } else {
    console.log('✅ No obvious problematic dependencies found');
  }
}

// 3. Create build commands
console.log('\n3. Build command options:');
console.log('========================');

console.log('\n🔥 Emergency Build Commands (try in order):');
console.log('1. Minimal build:');
console.log('   cp eas-emergency.json eas.json && eas build --platform android --profile production');
console.log('');
console.log('2. Development build (more likely to succeed):');
console.log('   eas build --platform android --profile development');
console.log('');
console.log('3. Build with cache disabled:');
console.log('   eas build --platform android --profile production --clear-cache');
console.log('');
console.log('4. Build with older image:');
console.log('   # Edit eas.json and set "image": "ubuntu-22.04-jdk-17-ndk-r25b"');
console.log('   eas build --platform android --profile production');

// 4. Alternative approaches
console.log('\n💡 Alternative Approaches:');
console.log('=========================');
console.log('1. Expo Go testing:');
console.log('   npx expo start');
console.log('   # Install Expo Go app and scan QR code');
console.log('');
console.log('2. Web build (already working):');
console.log('   npx expo export --platform web');
console.log('');
console.log('3. Local Android build (if you have Android Studio):');
console.log('   npx expo run:android --variant release');

// 5. Troubleshooting steps
console.log('\n🔍 If builds still fail:');
console.log('========================');
console.log('1. Check specific error in build logs');
console.log('2. Try removing complex dependencies temporarily');
console.log('3. Use development profile instead of production');
console.log('4. Consider upgrading Expo SDK version');
console.log('5. Build on a simpler branch without all features');

console.log('\n📱 Quick Success Path:');
console.log('======================');
console.log('For immediate testing:');
console.log('1. Use Expo Go for device testing');
console.log('2. Use web build for browser testing');
console.log('3. Focus on core functionality first');
console.log('4. Add complex features (NFC, crypto) later');

console.log('\n🎯 Most Likely to Work:');
console.log('=======================');
console.log('eas build --platform android --profile development');
console.log('(Development builds are more forgiving)');

console.log('\n🚀 Emergency fixes applied!');
console.log('Try the commands above in order.');
