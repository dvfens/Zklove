import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Ionicons } from '@expo/vector-icons';
import { BarCodeScanner } from 'expo-barcode-scanner';
import React, { useState, useEffect } from 'react';
import {
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Dimensions
} from 'react-native';

interface AadhaarQRScannerProps {
  onQRCodeScanned: (qrData: string) => void;
  onCancel: () => void;
}

const { width, height } = Dimensions.get('window');

export default function AadhaarQRScanner({ onQRCodeScanned, onCancel }: AadhaarQRScannerProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [isScanning, setIsScanning] = useState(true);

  useEffect(() => {
    getCameraPermissions();
  }, []);

  const getCameraPermissions = async () => {
    const { status } = await BarCodeScanner.requestPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    if (scanned) return;
    
    setScanned(true);
    setIsScanning(false);
    
    // Validate that this is an Aadhaar QR code
    if (isValidAadhaarQR(data)) {
      onQRCodeScanned(data);
    } else {
      Alert.alert(
        'Invalid QR Code',
        'This doesn\'t appear to be a valid Aadhaar QR code. Please scan the QR code from your mAadhaar app or UIDAI PDF.',
        [
          { text: 'Try Again', onPress: () => {
            setScanned(false);
            setIsScanning(true);
          }},
          { text: 'Cancel', onPress: onCancel }
        ]
      );
    }
  };

  const isValidAadhaarQR = (data: string): boolean => {
    try {
      // Check if it's a valid Aadhaar QR format
      const parsed = JSON.parse(data);
      return parsed.uid && parsed.name && parsed.gender && parsed.yob;
    } catch {
      // Check for UIDAI PDF QR format (base64 encoded)
      try {
        const decoded = atob(data);
        return decoded.includes('uid') && decoded.includes('name');
      } catch {
        return false;
      }
    }
  };

  const resetScanner = () => {
    setScanned(false);
    setIsScanning(true);
  };

  if (hasPermission === null) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Ionicons name="camera" size={60} color="#666" />
          <ThemedText style={styles.permissionText}>Requesting camera permission...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (hasPermission === false) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Ionicons name="camera-off" size={60} color="#FF3B30" />
          <ThemedText style={styles.permissionTitle}>Camera Permission Required</ThemedText>
          <ThemedText style={styles.permissionText}>
            We need camera access to scan your Aadhaar QR code. Please enable camera permissions in your device settings.
          </ThemedText>
          <TouchableOpacity style={styles.settingsButton} onPress={onCancel}>
            <Text style={styles.settingsButtonText}>Go to Settings</Text>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onCancel}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Scan Aadhaar QR</ThemedText>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.scannerContainer}>
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={styles.scanner}
        />
        
        {/* Scanner overlay */}
        <View style={styles.overlay}>
          <View style={styles.scanArea}>
            <View style={styles.corner} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
        </View>

        {isScanning && (
          <View style={styles.scanningIndicator}>
            <Ionicons name="scan" size={24} color="#007AFF" />
            <ThemedText style={styles.scanningText}>Scanning...</ThemedText>
          </View>
        )}
      </View>

      <View style={styles.instructions}>
        <ThemedText style={styles.instructionsTitle}>How to scan:</ThemedText>
        <View style={styles.instructionItem}>
          <Ionicons name="phone-portrait" size={20} color="#007AFF" />
          <ThemedText style={styles.instructionText}>
            Open your mAadhaar app and display the QR code
          </ThemedText>
        </View>
        <View style={styles.instructionItem}>
          <Ionicons name="document-text" size={20} color="#007AFF" />
          <ThemedText style={styles.instructionText}>
            Or scan the QR code from your UIDAI PDF
          </ThemedText>
        </View>
        <View style={styles.instructionItem}>
          <Ionicons name="qr-code" size={20} color="#007AFF" />
          <ThemedText style={styles.instructionText}>
            Position the QR code within the frame above
          </ThemedText>
        </View>
      </View>

      {scanned && (
        <View style={styles.resultContainer}>
          <Ionicons name="checkmark-circle" size={40} color="#34C759" />
          <ThemedText style={styles.resultText}>QR Code Scanned Successfully!</ThemedText>
          <TouchableOpacity style={styles.scanAgainButton} onPress={resetScanner}>
            <Text style={styles.scanAgainButtonText}>Scan Another QR Code</Text>
          </TouchableOpacity>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10,
    color: '#FF3B30',
  },
  permissionText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
    color: '#666',
  },
  settingsButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  settingsButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
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
  scannerContainer: {
    flex: 1,
    position: 'relative',
  },
  scanner: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: width * 0.7,
    height: width * 0.7,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#007AFF',
    borderWidth: 3,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderTopWidth: 0,
    borderRightWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderTopWidth: 0,
    borderLeftWidth: 0,
  },
  scanningIndicator: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 25,
  },
  scanningText: {
    color: '#007AFF',
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  instructions: {
    backgroundColor: 'rgba(0,0,0,0.9)',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  instructionText: {
    color: 'white',
    marginLeft: 10,
    fontSize: 14,
    flex: 1,
  },
  resultContainer: {
    position: 'absolute',
    top: '50%',
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.9)',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    transform: [{ translateY: -50 }],
  },
  resultText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 15,
  },
  scanAgainButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  scanAgainButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});
