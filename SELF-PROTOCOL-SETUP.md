# Self Protocol Integration Guide

## Overview

Self Protocol is a privacy-first, open-source identity protocol powered by zero-knowledge proofs. It allows developers to verify users' identity and humanity (including sybil resistance, age, country, and sanctions checks) without exposing private data.

## Features

- **Privacy-First**: All credentials and sensitive data are kept in environment variables
- **Zero-Knowledge Proofs**: Verify identity without revealing private information
- **Sybil Resistance**: Prevent duplicate identities using nullifier hashes
- **Age Verification**: Verify user age without exposing birth date
- **Country Verification**: Check nationality without revealing specific location
- **Sanctions Screening**: Screen against sanctions lists privately
- **Biometric Processing**: Local face and document processing
- **Blockchain Integration**: Store verification results on-chain

## Setup Instructions

### 1. Environment Configuration

Copy the example environment file and configure your credentials:

```bash
cp env.example .env
```

### 2. Self Protocol API Keys

Get your Self Protocol API credentials:

1. Visit [Self Protocol](https://selfprotocol.com)
2. Create an account and generate API keys
3. Add your credentials to `.env`:

```env
# Self Protocol Configuration
SELF_PROTOCOL_API_KEY=your_self_protocol_api_key_here
SELF_PROTOCOL_SECRET_KEY=your_self_protocol_secret_key_here
SELF_PROTOCOL_ENDPOINT=https://api.selfprotocol.com/v1
SELF_PROTOCOL_VERIFICATION_ENDPOINT=https://verification.selfprotocol.com
```

### 3. Zero-Knowledge Proof Circuits

Configure the ZK proof circuits:

```env
# Self Protocol Zero-Knowledge Proof Configuration
SELF_PROTOCOL_CIRCUIT_URL=https://circuits.selfprotocol.com/identity_verification.wasm
SELF_PROTOCOL_ZKEY_URL=https://circuits.selfprotocol.com/identity_verification_final.zkey
SELF_PROTOCOL_VERIFICATION_KEY_URL=https://circuits.selfprotocol.com/verification_key.json
```

### 4. Privacy Settings

Configure privacy and data retention:

```env
# Self Protocol Privacy Settings
SELF_PROTOCOL_DATA_RETENTION_DAYS=7
SELF_PROTOCOL_ENABLE_BIOMETRIC_STORAGE=false
SELF_PROTOCOL_PRIVACY_LEVEL=enhanced
```

## Usage

### Basic Identity Verification

```typescript
import SelfProtocolService from './services/SelfProtocolService';

const selfProtocol = SelfProtocolService.getInstance();

// Initialize the service
await selfProtocol.initialize();

// Verify identity
const verificationRequest = {
  faceImage: 'base64_encoded_face_image',
  documentImage: 'base64_encoded_document_image',
  requiredAge: 18,
  allowedCountries: ['US', 'CA', 'GB'],
  requireSanctionsCheck: true,
  dataRetentionDays: 7,
  allowBiometricStorage: false
};

const result = await selfProtocol.verifyIdentity(verificationRequest);

console.log('Verification Result:', {
  isHuman: result.isHuman,
  isUnique: result.isUnique,
  ageVerified: result.ageVerified,
  countryVerified: result.countryVerified,
  sanctionsCleared: result.sanctionsCleared,
  confidenceScore: result.confidenceScore,
  riskScore: result.riskScore
});
```

### Advanced Verification with Custom Settings

```typescript
// Enhanced verification with custom privacy settings
const enhancedRequest = {
  faceImage: faceImageData,
  documentImage: documentImageData,
  requiredAge: 21,
  allowedCountries: ['US'],
  requireSanctionsCheck: true,
  dataRetentionDays: 30,
  allowBiometricStorage: false
};

const enhancedResult = await selfProtocol.verifyIdentity(enhancedRequest);
```

### Verification Status Checking

```typescript
// Check verification status
const status = await selfProtocol.checkVerificationStatus(verificationId);

if (status.isValid && !status.isExpired) {
  console.log('Verification is valid');
} else {
  console.log('Verification expired or invalid');
}
```

### API Integration

```typescript
// Get status from Self Protocol API
const apiStatus = await selfProtocol.getVerificationStatusFromAPI(verificationId);

console.log('API Status:', apiStatus);
```

## Privacy Features

### 1. Zero-Knowledge Proofs

Self Protocol uses zero-knowledge proofs to verify identity without revealing private data:

- **Identity Commitment**: Privacy-preserving commitment to user identity
- **Nullifier Hash**: Prevents double-spending and sybil attacks
- **Proof Verification**: Cryptographic proof of verification without revealing details

### 2. Local Processing

All biometric data is processed locally:

- Face feature extraction happens on-device
- Document processing uses local ML models
- No biometric data is sent to external servers
- Only privacy-preserving hashes are transmitted

### 3. Data Retention

Configurable data retention policies:

- Set `SELF_PROTOCOL_DATA_RETENTION_DAYS` for automatic cleanup
- Biometric data can be stored locally or not at all
- Verification results expire automatically

### 4. Sybil Resistance

Built-in protection against duplicate identities:

- Nullifier hashes prevent identity reuse
- Unique verification per identity
- Blockchain-based uniqueness verification

## Security Considerations

### 1. API Key Security

- Store API keys in environment variables only
- Never commit `.env` files to version control
- Use different keys for development and production
- Rotate keys regularly

### 2. Data Encryption

- All sensitive data is encrypted at rest
- Zero-knowledge proofs protect privacy
- Biometric data is hashed, not stored in plain text

### 3. Network Security

- All API calls use HTTPS
- Authentication tokens are required
- Rate limiting prevents abuse

## Configuration Options

### Privacy Levels

- **Basic**: Minimal verification, maximum privacy
- **Enhanced**: Standard verification with privacy protection
- **Premium**: Full verification with advanced privacy features

### Verification Features

```typescript
// Enable/disable specific verification features
const privacyConfig = {
  enableSybilResistance: true,
  enableAgeVerification: true,
  enableCountryVerification: true,
  enableSanctionsCheck: true,
  enableLivenessDetection: true
};
```

### Circuit Configuration

```typescript
// Configure ZK proof circuits
const circuitConfig = {
  wasmUrl: 'https://circuits.selfprotocol.com/identity_verification.wasm',
  zkeyUrl: 'https://circuits.selfprotocol.com/identity_verification_final.zkey',
  verificationKeyUrl: 'https://circuits.selfprotocol.com/verification_key.json'
};
```

## Troubleshooting

### Common Issues

1. **API Connection Failed**
   - Check your API keys in `.env`
   - Verify network connectivity
   - Ensure Self Protocol service is available

2. **Verification Failed**
   - Check image quality and format
   - Ensure proper lighting for face capture
   - Verify document is clear and readable

3. **Proof Generation Failed**
   - Check circuit file URLs
   - Verify ZK proof configuration
   - Ensure sufficient device resources

### Debug Mode

Enable debug logging:

```env
DEBUG_MODE=true
NODE_ENV=development
```

### Mock Mode

If API credentials are not configured, the service will run in mock mode for development:

```typescript
// Mock mode automatically enabled when API keys are missing
const result = await selfProtocol.verifyIdentity(request);
// Returns mock verification results
```

## Best Practices

### 1. Privacy by Design

- Always use the highest privacy level appropriate
- Minimize data retention periods
- Disable biometric storage when possible
- Use local processing for sensitive data

### 2. Security

- Rotate API keys regularly
- Monitor verification attempts
- Implement rate limiting
- Use HTTPS for all communications

### 3. User Experience

- Provide clear privacy notices
- Explain verification requirements
- Offer fallback options
- Handle errors gracefully

## Support

For technical support and questions:

- [Self Protocol Documentation](https://docs.selfprotocol.com)
- [GitHub Issues](https://github.com/selfprotocol/self-protocol/issues)
- [Community Discord](https://discord.gg/selfprotocol)

## License

This integration follows the Self Protocol open-source license. See the [Self Protocol License](https://github.com/selfprotocol/self-protocol/blob/main/LICENSE) for details.
