const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 zkLove Local Build Script');
console.log('============================');

async function localBuild() {
  try {
    const platform = process.argv[2] || 'android';
    const buildType = process.argv[3] || 'debug';
    
    console.log(`📱 Building for ${platform} (${buildType})`);
    
    // Set production environment
    process.env.NODE_ENV = 'production';
    
    // Step 1: Clean previous builds
    console.log('🧹 Cleaning previous builds...');
    if (fs.existsSync('dist')) {
      if (process.platform === 'win32') {
        execSync('rmdir /s /q dist', { stdio: 'inherit' });
      } else {
        execSync('rm -rf dist', { stdio: 'inherit' });
      }
    }
    if (fs.existsSync('www')) {
      if (process.platform === 'win32') {
        execSync('rmdir /s /q www', { stdio: 'inherit' });
      } else {
        execSync('rm -rf www', { stdio: 'inherit' });
      }
    }
    
    // Step 2: Build web version
    console.log('🌐 Building web version...');
    execSync('npx expo export --platform web', { stdio: 'inherit' });
    
    // Step 3: Copy to Capacitor
    console.log('📦 Copying to Capacitor...');
    execSync('npx cap copy', { stdio: 'inherit' });
    
    if (platform === 'android') {
      // Step 4: Build Android APK
      console.log('🤖 Building Android APK...');
      
      if (buildType === 'release') {
        execSync('npx cap build android --prod', { stdio: 'inherit' });
      } else {
        execSync('npx cap run android', { stdio: 'inherit' });
      }
      
      // Find the APK
      const apkPath = findAPK();
      if (apkPath) {
        console.log(`✅ APK created: ${apkPath}`);
      }
      
    } else if (platform === 'ios') {
      // Step 4: Build iOS
      console.log('🍎 Building iOS...');
      execSync('npx cap run ios', { stdio: 'inherit' });
      
    } else if (platform === 'web') {
      console.log('✅ Web build completed in dist/ folder');
    }
    
    console.log('🎉 Build completed successfully!');
    
  } catch (error) {
    console.error('💥 Build failed:', error.message);
    process.exit(1);
  }
}

function findAPK() {
  const possiblePaths = [
    'android/app/build/outputs/apk/debug/app-debug.apk',
    'android/app/build/outputs/apk/release/app-release.apk',
    'android/app/build/outputs/apk/development/app-development.apk'
  ];
  
  for (const apkPath of possiblePaths) {
    if (fs.existsSync(apkPath)) {
      return apkPath;
    }
  }
  
  return null;
}

if (require.main === module) {
  localBuild().catch(console.error);
}

module.exports = { localBuild };
