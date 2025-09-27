import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import ETHGlobalNFCService, { ETHGlobalBadgeData, NFCVerificationResult } from '@/services/ETHGlobalNFCService';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface ETHGlobalNFCScannerProps {
  onBadgeVerified: (badgeData: ETHGlobalBadgeData) => void;
  onCancel: () => void;
}

const { width, height } = Dimensions.get('window');

export default function ETHGlobalNFCScanner({ onBadgeVerified, onCancel }: ETHGlobalNFCScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [isNFCAvailable, setIsNFCAvailable] = useState(false);
  const [scanResult, setScanResult] = useState<NFCVerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkNFCAvailability();
  }, []);

  const checkNFCAvailability = async () => {
    const available = ETHGlobalNFCService.isNFCReady();
    setIsNFCAvailable(available);
    
    if (!available) {
      setError('NFC is not available on this device. Please use QR code verification instead.');
    }
  };

  const startNFCScan = async () => {
    if (!isNFCAvailable) {
      Alert.alert(
        'NFC Not Available',
        'NFC is not available on this device. Please use QR code verification instead.',
        [{ text: 'OK' }]
      );
      return;
    }

    setIsScanning(true);
    setError(null);
    setScanResult(null);

    try {
      console.log('Starting NFC scan for ETHGlobal badge...');
      const result = await ETHGlobalNFCService.startNFCScanning();
      
      setScanResult(result);
      
      if (result.success && result.badgeData) {
        // Verify badge with backend
        const isValid = await ETHGlobalNFCService.verifyBadgeWithBackend(result.badgeData);
        
        if (isValid) {
          // Generate ZK proof
          const zkProof = await ETHGlobalNFCService.generateBadgeZKProof(result.badgeData);
          console.log('ZK proof generated for badge verification');
          
          // Call success callback
          onBadgeVerified(result.badgeData);
        } else {
          setError('Badge verification failed. Please try again or contact support.');
        }
      } else {
        setError(result.error || 'Failed to read NFC badge');
      }
    } catch (error) {
      console.error('NFC scan error:', error);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setIsScanning(false);
    }
  };

  const stopNFCScan = async () => {
    setIsScanning(false);
    await ETHGlobalNFCService.stopNFCScanning();
  };

  const renderNFCAvailable = () => (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onCancel}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>ETHGlobal Badge Verification</ThemedText>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <View style={styles.nfcIconContainer}>
          <Ionicons 
            name="card" 
            size={80} 
            color={isScanning ? "#007AFF" : "#666"} 
          />
          <View style={styles.nfcWave}>
            <Ionicons name="radio" size={120} color="rgba(0,122,255,0.3)" />
          </View>
        </View>

        <ThemedText style={styles.title}>
          {isScanning ? 'Scanning ETHGlobal Badge...' : 'Tap to Scan Badge'}
        </ThemedText>

         <ThemedText style={styles.subtitle}>
           {isScanning 
             ? 'Hold your ETHGlobal wristband near the back of your device'
             : 'Place your ETHGlobal wristband near the NFC reader to verify your identity'
           }
         </ThemedText>

        {isScanning && (
          <View style={styles.scanningContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
             <ThemedText style={styles.scanningText}>
               Detecting NFC badge...
             </ThemedText>
          </View>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="warning" size={24} color="#FF3B30" />
            <ThemedText style={styles.errorText}>{error}</ThemedText>
          </View>
        )}

        {scanResult && !scanResult.success && (
          <View style={styles.errorContainer}>
            <Ionicons name="close-circle" size={24} color="#FF3B30" />
            <ThemedText style={styles.errorText}>
              {scanResult.error || 'Failed to read badge'}
            </ThemedText>
          </View>
        )}

        <View style={styles.buttonContainer}>
          {!isScanning ? (
            <TouchableOpacity 
              style={[styles.scanButton, !isNFCAvailable && styles.disabledButton]} 
              onPress={startNFCScan}
              disabled={!isNFCAvailable}
            >
              <Ionicons name="scan" size={24} color="white" />
              <Text style={styles.scanButtonText}>Scan Badge</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.stopButton} onPress={stopNFCScan}>
              <Ionicons name="stop" size={24} color="white" />
              <Text style={styles.stopButtonText}>Stop Scanning</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>

         <View style={styles.instructions}>
           <ThemedText style={styles.instructionsTitle}>Instructions:</ThemedText>
           <ThemedText style={styles.instructionText}>
             • Ensure NFC is enabled on your device{'\n'}
             • Hold your ETHGlobal wristband steady near the device{'\n'}
             • Keep the badge close until scanning completes{'\n'}
             • If scanning fails, try moving the badge slightly
           </ThemedText>
         </View>
      </View>
    </ThemedView>
  );

  const renderNFCNotAvailable = () => (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onCancel}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>NFC Not Available</ThemedText>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <View style={styles.errorIconContainer}>
          <Ionicons name="warning" size={80} color="#FF9500" />
        </View>

        <ThemedText style={styles.title}>NFC Not Supported</ThemedText>
        <ThemedText style={styles.subtitle}>
          Your device doesn't support NFC or NFC is disabled. Please use QR code verification instead.
        </ThemedText>

        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );

  return isNFCAvailable ? renderNFCAvailable() : renderNFCNotAvailable();
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nfcIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    position: 'relative',
  },
  nfcWave: {
    position: 'absolute',
    top: -20,
    left: -20,
    right: -20,
    bottom: -20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  scanningContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  scanningText: {
    fontSize: 16,
    color: '#007AFF',
    marginTop: 10,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,59,48,0.1)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    width: '100%',
  },
  errorText: {
    fontSize: 14,
    color: '#FF3B30',
    marginLeft: 10,
    flex: 1,
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 30,
  },
  scanButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginBottom: 15,
  },
  disabledButton: {
    backgroundColor: '#666',
  },
  scanButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  stopButton: {
    backgroundColor: '#FF3B30',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginBottom: 15,
  },
  stopButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: 15,
  },
  cancelButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
  },
  instructions: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 20,
    borderRadius: 10,
    width: '100%',
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 10,
  },
  instructionText: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 20,
  },
  errorIconContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
});
