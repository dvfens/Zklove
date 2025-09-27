# Self Protocol Troubleshooting Guide

## Issue: "Self Protocol is a privacy-first, open-source identity protocol..." Still Appearing

If you're still seeing the Self Protocol description or experiencing issues, here are the most common causes and solutions:

## 1. **Missing Environment Variables**

### Problem

Your Self Protocol service is running in "mock mode" because API credentials aren't configured.

### Solution

Create a `.env` file in your project root with the following content:

```env
# Self Protocol Configuration
SELF_PROTOCOL_API_KEY=your_actual_api_key_here
SELF_PROTOCOL_SECRET_KEY=your_actual_secret_key_here
SELF_PROTOCOL_ENDPOINT=https://api.selfprotocol.com/v1
SELF_PROTOCOL_VERIFICATION_ENDPOINT=https://verification.selfprotocol.com
SELF_PROTOCOL_PRIVACY_LEVEL=enhanced
SELF_PROTOCOL_DATA_RETENTION_DAYS=7
SELF_PROTOCOL_ENABLE_BIOMETRIC_STORAGE=false
```

### How to Get API Keys

1. Visit [Self Protocol](https://selfprotocol.com)
2. Create an account
3. Generate API keys in your dashboard
4. Replace the placeholder values in your `.env` file

## 2. **Configuration Issues**

### Problem

Duplicate or conflicting configuration in `config.js`.

### Solution

I've already fixed the duplicate `selfProtocol` configuration in your `config.js` file. The configuration is now clean and properly structured.

## 3. **Mock Mode Detection**

### Check if you're in mock mode

```typescript
// Add this to your app to check the status
import SelfProtocolService from '@/services/SelfProtocolService';

const selfProtocol = SelfProtocolService.getInstance();
await selfProtocol.initialize();

// Check console logs for:
// "Self Protocol API credentials not configured. Using mock mode."
// OR
// "Self Protocol API connection established"
```

## 4. **Service Initialization**

### Problem

The Self Protocol service isn't being initialized properly.

### Solution

Make sure to initialize the service in your app:

```typescript
// In your main app component or AppInitializationService
import SelfProtocolService from '@/services/SelfProtocolService';

const initializeServices = async () => {
  const selfProtocol = SelfProtocolService.getInstance();
  await selfProtocol.initialize();
};
```

## 5. **API Endpoint Issues**

### Problem

The Self Protocol API endpoints might be incorrect or unavailable.

### Solution

Update your configuration with the correct endpoints:

```javascript
// In config.js, ensure these are correct:
selfProtocol: {
  endpoint: 'https://api.selfprotocol.com/v1',
  verificationEndpoint: 'https://verification.selfprotocol.com',
  // ... other config
}
```

## 6. **Network Connectivity**

### Problem

Your app can't reach the Self Protocol API.

### Solution

1. Check your internet connection
2. Verify the API endpoints are accessible
3. Check for firewall or proxy issues
4. Test with a simple fetch request:

```typescript
const testConnection = async () => {
  try {
    const response = await fetch('https://api.selfprotocol.com/v1/health');
    console.log('API Status:', response.status);
  } catch (error) {
    console.error('Connection failed:', error);
  }
};
```

## 7. **Development vs Production**

### Problem

Different behavior between development and production environments.

### Solution

Ensure your environment variables are properly set for each environment:

```env
# Development
NODE_ENV=development
DEBUG_MODE=true

# Production
NODE_ENV=production
DEBUG_MODE=false
```

## 8. **Verification Flow Issues**

### Problem

The verification process isn't working as expected.

### Solution

Check the verification flow in your `SelfProtocolVerification.tsx`:

```typescript
// Make sure the service is properly initialized
const selfProtocolService = SelfProtocolService.getInstance();

// Check if the verification request is properly formatted
const verificationRequest: SelfVerificationRequest = {
  faceImage,
  documentImage,
  requiredAge,
  allowedCountries,
  requireSanctionsCheck,
  dataRetentionDays: 7,
  allowBiometricStorage: false,
};
```

## 9. **Debug Mode**

### Enable debug logging

```env
DEBUG_MODE=true
NODE_ENV=development
```

### Check console logs for

- "Self Protocol API connection established"
- "Self Protocol verification completed"
- Any error messages

## 10. **Testing the Integration**

### Test the service directly

```typescript
import SelfProtocolService from '@/services/SelfProtocolService';

const testSelfProtocol = async () => {
  const service = SelfProtocolService.getInstance();
  await service.initialize();
  
  // Test with mock data
  const result = await service.verifyIdentity({
    faceImage: 'mock_face_data',
    documentImage: 'mock_document_data',
    requiredAge: 18,
    allowedCountries: ['US'],
    requireSanctionsCheck: false
  });
  
  console.log('Verification result:', result);
};
```

## Common Error Messages and Solutions

### "Self Protocol API credentials not configured. Using mock mode."

- **Solution**: Add your API keys to the `.env` file

### "Self Protocol API connection failed, using mock mode"

- **Solution**: Check your API keys and network connection

### "Verification Failed"

- **Solution**: Check image quality and format requirements

### "Proof generation failed"

- **Solution**: Ensure ZK proof circuits are accessible

## Quick Fix Checklist

1. ✅ Create `.env` file with API credentials
2. ✅ Remove duplicate configuration in `config.js`
3. ✅ Initialize Self Protocol service in your app
4. ✅ Check network connectivity
5. ✅ Verify API endpoints are correct
6. ✅ Test with debug mode enabled

## Still Having Issues?

If you're still experiencing problems:

1. **Check the console logs** for specific error messages
2. **Verify your API credentials** are correct
3. **Test the network connection** to Self Protocol endpoints
4. **Ensure your app is properly initializing** the service
5. **Check if you're in development mode** with mock services enabled

## Support

For additional help:

- Check the [Self Protocol Documentation](https://docs.selfprotocol.com)
- Review the [GitHub Issues](https://github.com/selfprotocol/self-protocol/issues)
- Join the [Community Discord](https://discord.gg/selfprotocol)
