# 🚀 zkLove Local Build Guide (No EAS Required)

This guide shows you how to build your zkLove app locally without using EAS (Expo Application Services).

## 📋 Prerequisites

- Node.js (v18 or higher)
- Android Studio (for Android builds)
- Xcode (for iOS builds, macOS only)
- Java Development Kit (JDK 11 or higher)

## 🛠️ Build Methods

### Method 1: Expo Development Build (Fastest)

```bash
# Install dependencies
npm install

# Build and run on Android device/emulator
npm run android

# Build and run on iOS device/simulator (macOS only)
npm run ios

# Start web development server
npm run web
```

### Method 2: Capacitor Build (Recommended for Production)

```bash
# Build web version first
npm run build:production

# Copy to Capacitor and build APK
npm run build:local:android

# For release APK
npm run build:local:android:release
```

### Method 3: Direct Gradle Build

```bash
# Build debug APK
npm run build:gradle:debug

# Build release APK
npm run build:gradle:release

# APK location: android/app/build/outputs/apk/
```

### Method 4: Custom Local Build Script

```bash
# Build for Android (debug)
node local-build.js android

# Build for Android (release)
node local-build.js android release

# Build for iOS
node local-build.js ios

# Build for web only
node local-build.js web
```

## 📱 Platform-Specific Instructions

### Android Build

1. **Using Expo CLI:**
   ```bash
   npx expo run:android
   ```

2. **Using Capacitor:**
   ```bash
   npx expo export --platform web
   npx cap copy
   npx cap run android
   ```

3. **Using Gradle directly:**
   ```bash
   cd android
   ./gradlew assembleDebug
   ```

### iOS Build (macOS only)

1. **Using Expo CLI:**
   ```bash
   npx expo run:ios
   ```

2. **Using Capacitor:**
   ```bash
   npx expo export --platform web
   npx cap copy
   npx cap run ios
   ```

### Web Build

```bash
# Development server
npm run web

# Production build
npm run build:production
# Output: dist/ folder
```

## 🔧 Build Configuration

### Environment Variables

Create a `.env.local` file for local builds:

```env
NODE_ENV=production
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_BLOCKCHAIN_NETWORK=localhost
```

### Android Configuration

Your Android project is already configured in `android/` folder with:
- Package name: `com.zklove.app`
- Target SDK: 34
- Compile SDK: 34
- All required permissions

### Capacitor Configuration

Capacitor is configured in `capacitor.config.json`:
- App ID: `com.zklove.app`
- Web directory: `www`
- Android scheme: `https`

## 📦 Output Locations

- **Android APK (Debug):** `android/app/build/outputs/apk/debug/app-debug.apk`
- **Android APK (Release):** `android/app/build/outputs/apk/release/app-release.apk`
- **Web Build:** `dist/` folder
- **iOS Build:** Xcode project in `ios/` folder

## 🚀 Quick Start Commands

```bash
# Install dependencies
npm install

# Build for Android (debug)
npm run build:local:android

# Build for Android (release)
npm run build:local:android:release

# Build for web
npm run build:local:web

# Start development server
npm start
```

## 🔍 Troubleshooting

### Common Issues

1. **Metro bundler issues:**
   ```bash
   npm run clear-cache
   npx expo start --clear
   ```

2. **Android build fails:**
   ```bash
   cd android
   ./gradlew clean
   ./gradlew assembleDebug
   ```

3. **Capacitor sync issues:**
   ```bash
   npx cap sync
   npx cap copy
   ```

4. **Permission issues (Windows):**
   ```bash
   # Run PowerShell as Administrator
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

### Build Optimization

For production builds, ensure:
- Set `NODE_ENV=production`
- Use `--minify` flag for smaller bundles
- Enable ProGuard for Android release builds

## 📋 Build Checklist

- [ ] Dependencies installed (`npm install`)
- [ ] Environment variables set
- [ ] Android Studio installed (for Android)
- [ ] Xcode installed (for iOS, macOS only)
- [ ] Device/emulator connected
- [ ] Build command executed
- [ ] APK/app installed and tested

## 🎯 Production Deployment

1. **Test locally first:**
   ```bash
   npm run build:local:android:release
   ```

2. **Sign APK for distribution:**
   - Use Android Studio to sign the APK
   - Or use `jarsigner` command line tool

3. **Upload to Google Play Store:**
   - Create developer account
   - Upload signed APK
   - Fill store listing details

## 💡 Tips

- Use `npm run build:local:android` for quick testing
- Use `npm run build:gradle:release` for production APKs
- Always test on real devices before publishing
- Keep your dependencies updated
- Use version control for build configurations

Your zkLove app is ready for local building! 🎉
