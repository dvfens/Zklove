# zkLove APK Build Instructions

## 🚀 Quick APK Build (Recommended)

### Method 1: EAS Build (Cloud Build)

1. **Create Expo Account** (if you don't have one):
   - Go to https://expo.dev
   - Sign up for a free account

2. **Login to EAS**:
   ```bash
   eas login
   ```

3. **Build Production APK**:
   ```bash
   eas build --platform android --profile production
   ```

4. **Wait for Build** (5-15 minutes):
   - EAS will provide a URL to monitor build progress
   - You'll receive an email when build completes

5. **Download APK**:
   - Click the download link provided
   - Install on your Android device

### Method 2: Development Build (For Testing)

1. **Install Expo Go** on your Android device from Google Play Store

2. **Start Development Server**:
   ```bash
   npx expo start
   ```

3. **Scan QR Code** with Expo Go app

4. **Test App** directly on your device

## 🔧 Local Build (Advanced)

If you prefer to build locally, you'll need:

### Prerequisites:
- Java JDK 17 or higher
- Android Studio or Android SDK Command Line Tools
- Set environment variables:
  - `ANDROID_HOME` pointing to your Android SDK
  - `JAVA_HOME` pointing to your Java JDK

### Build Commands:
```bash
# Set environment variables (Windows)
set ANDROID_HOME=C:\Users\%USERNAME%\AppData\Local\Android\Sdk
set JAVA_HOME=C:\Program Files\Java\jdk-17

# Build debug APK
cd android
gradlew assembleDebug

# Build release APK
gradlew assembleRelease
```

## 📱 APK Features

Your zkLove APK will include:

### 🔐 Privacy-First Identity Verification
- Self Protocol integration
- Zero-knowledge proof generation
- Local biometric processing
- No data leaves the device

### 📸 Multi-Modal Verification
- Face recognition with liveness detection
- ID document verification and OCR
- NFC badge scanning (ETHGlobal)
- QR code verification
- Aadhaar verification

### ⛓️ Blockchain Integration
- Smart contract interaction
- IPFS decentralized storage
- Web3 wallet integration
- Ethereum/Polygon support

### 🛡️ Security Features
- End-to-end encryption
- Secure key management
- Anti-spoofing measures
- Privacy-preserving proofs

## 🎯 Build Profiles

### Development Profile
- Debug build with logging
- Development certificates
- Fast build time
- For testing only

### Production Profile
- Optimized release build
- Production certificates
- App signing enabled
- Ready for distribution

## 📋 Build Configuration

The `eas.json` file is already configured with:

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

## 🚨 Important Notes

### For Production APK:
- Requires HTTPS for camera/NFC features
- Update environment variables for production APIs
- Test all verification flows thoroughly
- Consider app signing for Google Play Store

### For Development:
- Use development certificates
- Enable debug logging
- Test with mock data when needed

## 📞 Support

If you encounter issues:
1. Check Expo documentation: https://docs.expo.dev
2. Review EAS Build logs for errors
3. Ensure all environment variables are set
4. Verify app.json configuration

## 🎉 Success!

Once built, your zkLove APK will be a fully functional privacy-first identity verification app ready for deployment!
