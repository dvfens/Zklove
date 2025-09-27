# QR Scanner Troubleshooting Guide - zkLove App

## 🔍 Common QR Scanner Issues & Solutions

### 1. 📱 **"QR isn't working" - Camera Issues**

#### **Symptoms:**
- Camera doesn't open
- Black screen when trying to scan
- Permission denied errors

#### **Solutions:**

**A. Grant Camera Permission:**
```
1. When app asks for camera permission → Tap "Allow"
2. If missed: Go to device Settings → Apps → zkLove → Permissions → Camera → Allow
3. Restart the app after granting permission
```

**B. Test on Physical Device:**
```bash
# QR scanning requires physical device (not web browser)
npx expo start
# Install Expo Go app on your phone
# Scan the QR code to open zkLove app
```

**C. Check Device Compatibility:**
- Ensure device has a working camera
- Test camera in other apps first
- Some emulators don't support camera

### 2. 🌐 **Web Browser Limitations**

#### **Problem:** QR scanner doesn't work in web browser

#### **Solution:**
```
✅ Use physical Android/iOS device
✅ Use Android emulator with camera support
❌ Web browser (camera access limited)
```

### 3. 📄 **QR Code Format Issues**

#### **Supported QR Code Types:**
- ✅ **mAadhaar App QR** (JSON format)
- ✅ **UIDAI PDF QR** (Base64 encoded)
- ✅ **Self Protocol QR** (Custom format)
- ❌ Physical Aadhaar card QR (encrypted)

#### **QR Code Validation:**
```javascript
// Valid mAadhaar QR format:
{
  "uid": "123456789012",
  "name": "JOHN DOE",
  "gender": "M",
  "yob": "1990",
  "co": "Address",
  // ... other fields
}
```

### 4. 🔧 **Manual QR Input Alternative**

If camera scanning fails, use manual input:

```
1. Open mAadhaar app
2. Generate QR code
3. Screenshot the QR code
4. Use QR reader app to extract text
5. Copy the text data
6. In zkLove app → Choose "Manual Input"
7. Paste the QR data
8. Process verification
```

### 5. 🎯 **Testing & Debugging**

#### **Test with Demo Data:**
```
1. In QR scanner → Look for "Load Demo QR" button
2. This loads sample Aadhaar data for testing
3. Verify the app processes QR data correctly
```

#### **Check Console Logs:**
```bash
# Look for these messages in development console:
✅ "Camera is ready for scanning"
✅ "QR Code scanned: ..."
❌ "Camera permission denied"
❌ "QR Code Processing Error"
```

## 🚀 Quick Fix Checklist

### **Step 1: Environment Check**
- [ ] Using physical device (not web browser)
- [ ] Camera permission granted
- [ ] App has latest updates
- [ ] Device camera works in other apps

### **Step 2: Scanner Check**
- [ ] QR scanner screen opens
- [ ] Camera preview is visible
- [ ] No error messages shown
- [ ] Scanner overlay visible

### **Step 3: QR Code Check**
- [ ] Using supported QR format (mAadhaar/UIDAI)
- [ ] QR code is clear and not damaged
- [ ] Adequate lighting for scanning
- [ ] QR code fills the scan area

### **Step 4: Fallback Options**
- [ ] Try manual QR input
- [ ] Use demo QR data
- [ ] Try different verification method
- [ ] Check app logs for errors

## 💡 Alternative Verification Methods

If QR scanning continues to fail:

### **1. Face Verification**
```
✅ Uses device camera for face capture
✅ Liveness detection included
✅ Works on most devices
```

### **2. Document Upload**
```
✅ Take photo of ID document
✅ OCR text extraction
✅ No QR code required
```

### **3. NFC Badge Scanning**
```
✅ For ETHGlobal participants
✅ Uses NFC (if supported)
✅ Alternative identity method
```

### **4. Self Protocol Verification**
```
✅ Privacy-first verification
✅ Zero-knowledge proofs
✅ Multiple verification options
```

## 🔍 Advanced Troubleshooting

### **Camera Configuration Issues:**
```typescript
// Check these camera settings in code:
- facing: "back" (rear camera)
- barcodeTypes: ['qr', 'pdf417', 'datamatrix']
- onCameraReady callback working
- Permission handling correct
```

### **QR Processing Issues:**
```typescript
// Debug QR data processing:
console.log('QR Data length:', data.length);
console.log('QR Data preview:', data.substring(0, 100));
console.log('Is valid format:', isValidAadhaarQR(data));
```

### **Performance Issues:**
```
- Close other camera apps
- Restart zkLove app
- Clear app cache
- Ensure good lighting
- Hold device steady
```

## 📞 **Still Having Issues?**

### **Immediate Solutions:**
1. **Use Manual Input:** Copy-paste QR data directly
2. **Try Demo Mode:** Use built-in test data
3. **Alternative Verification:** Use face/document verification
4. **Device Testing:** Try on different device

### **Development Testing:**
```bash
# Test app functionality
npx expo start

# Check for errors
# Look at console output
# Test on multiple devices
```

### **Contact Support:**
- Provide device model and OS version
- Share error messages from console
- Describe exact steps that fail
- Include screenshot if helpful

## ✅ **Success Indicators**

When QR scanning works correctly:
- Camera opens immediately
- Scanner overlay visible
- QR codes detected quickly
- Processing happens smoothly
- Verification completes successfully

Your zkLove QR scanner should now work perfectly! 🎉
