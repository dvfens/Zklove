const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 zkLove APK Creator');
console.log('====================');

async function createAPK() {
  try {
    console.log('📱 Creating Android APK...');
    
    // Step 1: Build web version if not exists
    if (!fs.existsSync('dist')) {
      console.log('🌐 Building web version...');
      execSync('npx expo export --platform web', { stdio: 'inherit' });
      console.log('✅ Web build completed');
    } else {
      console.log('✅ Web build already exists');
    }
    
    // Step 2: Create Capacitor config
    console.log('⚙️ Creating Capacitor configuration...');
    
    const capacitorConfig = {
      appId: 'com.zklove.app',
      appName: 'zkLove',
      webDir: 'dist',
      bundledWebRuntime: false,
      server: {
        androidScheme: 'https'
      },
      plugins: {
        SplashScreen: {
          launchShowDuration: 2000,
          backgroundColor: '#1a1a2e',
          androidSplashResourceName: 'splash',
          androidScaleType: 'CENTER_CROP'
        }
      }
    };
    
    fs.writeFileSync('capacitor.config.json', JSON.stringify(capacitorConfig, null, 2));
    console.log('✅ Capacitor config created');
    
    // Step 3: Add Android platform
    console.log('📱 Adding Android platform...');
    try {
      execSync('npx cap add android', { stdio: 'inherit' });
      console.log('✅ Android platform added');
    } catch (error) {
      console.log('⚠️ Android platform might already exist, continuing...');
    }
    
    // Step 4: Copy web assets
    console.log('📁 Copying web assets to Android...');
    execSync('npx cap copy', { stdio: 'inherit' });
    console.log('✅ Assets copied');
    
    // Step 5: Sync project
    console.log('🔄 Syncing Capacitor project...');
    execSync('npx cap sync', { stdio: 'inherit' });
    console.log('✅ Project synced');
    
    console.log('\n🎉 APK Setup Complete!');
    console.log('======================');
    console.log('📂 Android project created in: android/');
    console.log('');
    console.log('🔧 Next Steps:');
    console.log('1. Install Android Studio: https://developer.android.com/studio');
    console.log('2. Open Android project: npx cap open android');
    console.log('3. In Android Studio:');
    console.log('   - Build → Generate Signed Bundle/APK');
    console.log('   - Choose APK');
    console.log('   - Create new keystore or use existing');
    console.log('   - Build APK');
    console.log('');
    console.log('🚀 Alternative - Command Line Build:');
    console.log('cd android && ./gradlew assembleDebug');
    console.log('');
    console.log('📱 Your zkLove APK will be ready for installation!');
    
    // Create build script
    const buildScript = `@echo off
echo Building zkLove APK...
cd android
echo Running Gradle build...
gradlew.bat assembleDebug
echo.
echo ✅ APK created in: android\\app\\build\\outputs\\apk\\debug\\
echo 📱 Install on device: adb install app-debug.apk
pause
`;
    
    fs.writeFileSync('build-apk.bat', buildScript);
    console.log('📝 Created build-apk.bat script for easy building');
    
  } catch (error) {
    console.error('💥 Error:', error.message);
    console.log('\n🔧 Manual Alternative:');
    console.log('1. Use online APK builder with the dist/ folder');
    console.log('2. Services: AppsGeyser.com, Appy Pie, BuildFire');
    console.log('3. Upload dist.zip and create APK online');
  }
}

if (require.main === module) {
  createAPK().catch(console.error);
}

module.exports = { createAPK };
