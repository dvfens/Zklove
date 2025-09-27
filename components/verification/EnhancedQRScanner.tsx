import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Dimensions,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

interface EnhancedQRScannerProps {
  onQRCodeScanned: (qrData: string) => void;
  onCancel: () => void;
  title?: string;
  subtitle?: string;
}

const { width, height } = Dimensions.get('window');

export default function EnhancedQRScanner({ 
  onQRCodeScanned, 
  onCancel, 
  title = "Scan QR Code",
  subtitle = "Position the QR code within the frame"
}: EnhancedQRScannerProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [isScanning, setIsScanning] = useState(true);
  const [cameraReady, setCameraReady] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [scanCount, setScanCount] = useState(0);

  // Auto-fallback to manual input on web
  useEffect(() => {
    if (Platform.OS === 'web') {
      setShowManualInput(true);
    }
  }, []);

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    if (scanned) return;
    
    setScanned(true);
    setIsScanning(false);
    setScanCount(prev => prev + 1);
    
    console.log('🔍 QR Code scanned:', { 
      type, 
      dataLength: data.length, 
      preview: data.substring(0, 50) + '...',
      scanAttempt: scanCount + 1
    });
    
    try {
      onQRCodeScanned(data);
    } catch (error) {
      console.error('QR processing error:', error);
      Alert.alert(
        'QR Code Error',
        'Failed to process the QR code. Would you like to try manual input instead?',
        [
          { 
            text: 'Try Again', 
            onPress: () => {
              setScanned(false);
              setIsScanning(true);
            }
          },
          { 
            text: 'Manual Input', 
            onPress: () => setShowManualInput(true)
          },
          { text: 'Cancel', onPress: onCancel }
        ]
      );
    }
  };

  const handleManualSubmit = () => {
    if (!manualInput.trim()) {
      Alert.alert('Invalid Input', 'Please enter QR code data');
      return;
    }

    console.log('📝 Manual QR input:', {
      dataLength: manualInput.length,
      preview: manualInput.substring(0, 50) + '...'
    });

    try {
      onQRCodeScanned(manualInput);
    } catch (error) {
      Alert.alert('Invalid Data', 'The entered data is not valid. Please check and try again.');
    }
  };

  const loadDemoData = () => {
    const demoQR = JSON.stringify({
      uid: "123456789012",
      name: "DEMO USER",
      gender: "M",
      yob: "1990",
      co: "Demo Address",
      vtc: "Demo Village",
      po: "Demo Post Office",
      dist: "Demo District",
      state: "Demo State",
      pc: "123456"
    });
    setManualInput(demoQR);
  };

  const resetScanner = () => {
    setScanned(false);
    setIsScanning(true);
    setCameraReady(false);
    setScanCount(0);
  };

  // Manual input interface
  if (showManualInput) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onCancel}>
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Manual QR Input</ThemedText>
          <TouchableOpacity 
            style={styles.cameraButton} 
            onPress={() => setShowManualInput(false)}
          >
            <Ionicons name="camera" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons name="document-text" size={80} color="#007AFF" />
          </View>

          <ThemedText style={styles.title}>Enter QR Code Data</ThemedText>
          <ThemedText style={styles.subtitle}>
            Copy and paste the QR code data from your source
          </ThemedText>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Paste QR code data here..."
              value={manualInput}
              onChangeText={setManualInput}
              multiline
              numberOfLines={8}
              textAlignVertical="top"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.primaryButton]}
              onPress={handleManualSubmit}
              disabled={!manualInput.trim()}
            >
              <Ionicons name="checkmark" size={20} color="white" />
              <Text style={styles.primaryButtonText}>Process QR Data</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.secondaryButton]}
              onPress={loadDemoData}
            >
              <Ionicons name="flask" size={20} color="#007AFF" />
              <Text style={styles.secondaryButtonText}>Load Demo Data</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ThemedView>
    );
  }

  // Camera permission handling
  if (!permission) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Ionicons name="camera" size={60} color="#666" />
          <ThemedText style={styles.permissionText}>Initializing camera...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (!permission.granted) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Ionicons name="camera" size={60} color="#FF3B30" />
          <ThemedText style={styles.permissionTitle}>Camera Permission Required</ThemedText>
          <ThemedText style={styles.permissionText}>
            We need camera access to scan QR codes. This enables quick and accurate verification.
          </ThemedText>
          
          <View style={styles.permissionButtons}>
            <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
              <Ionicons name="camera" size={20} color="white" />
              <Text style={styles.permissionButtonText}>Grant Permission</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.manualButton} 
              onPress={() => setShowManualInput(true)}
            >
              <Ionicons name="create" size={20} color="#007AFF" />
              <Text style={styles.manualButtonText}>Manual Input</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ThemedView>
    );
  }

  // Camera scanner interface
  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onCancel}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>{title}</ThemedText>
        <TouchableOpacity 
          style={styles.manualButton} 
          onPress={() => setShowManualInput(true)}
        >
          <Ionicons name="create" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.scannerContainer}>
        <CameraView
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ['qr', 'pdf417', 'datamatrix', 'code128', 'code39'],
          }}
          style={styles.scanner}
          facing="back"
          onCameraReady={() => {
            console.log('📷 Camera ready for scanning');
            setCameraReady(true);
          }}
        />
        
        {/* Scanner overlay */}
        <View style={styles.overlay}>
          <View style={styles.scanArea}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
          
          {/* Scan line animation */}
          {isScanning && (
            <View style={styles.scanLine} />
          )}
        </View>

        {/* Status indicators */}
        <View style={styles.statusContainer}>
          {!cameraReady && (
            <View style={styles.statusItem}>
              <Ionicons name="hourglass" size={20} color="#FF9500" />
              <ThemedText style={styles.statusText}>Initializing camera...</ThemedText>
            </View>
          )}
          
          {cameraReady && isScanning && (
            <View style={styles.statusItem}>
              <Ionicons name="scan" size={20} color="#007AFF" />
              <ThemedText style={styles.statusText}>Ready to scan</ThemedText>
            </View>
          )}
          
          {scanned && (
            <View style={styles.statusItem}>
              <Ionicons name="checkmark-circle" size={20} color="#34C759" />
              <ThemedText style={styles.statusText}>QR code detected!</ThemedText>
            </View>
          )}
        </View>
      </View>

      <View style={styles.instructions}>
        <ThemedText style={styles.instructionsTitle}>{subtitle}</ThemedText>
        <View style={styles.instructionsList}>
          <View style={styles.instructionItem}>
            <Ionicons name="scan" size={16} color="#007AFF" />
            <ThemedText style={styles.instructionText}>
              Position QR code within the frame
            </ThemedText>
          </View>
          <View style={styles.instructionItem}>
            <Ionicons name="sunny" size={16} color="#007AFF" />
            <ThemedText style={styles.instructionText}>
              Ensure good lighting
            </ThemedText>
          </View>
          <View style={styles.instructionItem}>
            <Ionicons name="hand-left" size={16} color="#007AFF" />
            <ThemedText style={styles.instructionText}>
              Hold device steady
            </ThemedText>
          </View>
        </View>
      </View>

      {/* Action buttons */}
      <View style={styles.actionContainer}>
        {scanned ? (
          <TouchableOpacity style={styles.resetButton} onPress={resetScanner}>
            <Ionicons name="refresh" size={20} color="white" />
            <Text style={styles.resetButtonText}>Scan Again</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={styles.manualInputButton} 
            onPress={() => setShowManualInput(true)}
          >
            <Ionicons name="create" size={20} color="#007AFF" />
            <Text style={styles.manualInputButtonText}>Manual Input</Text>
          </TouchableOpacity>
        )}
      </View>
    </ThemedView>
  );
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
  cameraButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 30,
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
    marginBottom: 30,
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanArea: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#007AFF',
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },
  scanLine: {
    position: 'absolute',
    width: 250,
    height: 2,
    backgroundColor: '#007AFF',
    opacity: 0.8,
  },
  statusContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 10,
    borderRadius: 20,
  },
  statusText: {
    color: 'white',
    marginLeft: 8,
    fontSize: 14,
  },
  instructions: {
    padding: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 10,
  },
  instructionsList: {
    gap: 8,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 14,
    color: '#ccc',
    marginLeft: 10,
  },
  actionContainer: {
    padding: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginBottom: 15,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 30,
  },
  textInput: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    color: 'white',
    padding: 15,
    borderRadius: 10,
    minHeight: 120,
    fontSize: 14,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    width: '100%',
  },
  permissionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  permissionText: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  permissionButtons: {
    width: '100%',
    gap: 15,
  },
  permissionButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 25,
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  manualButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 25,
  },
  manualButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  resetButton: {
    backgroundColor: '#34C759',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 25,
  },
  resetButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  manualInputButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 25,
  },
  manualInputButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
