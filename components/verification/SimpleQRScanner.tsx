import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Alert,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

interface SimpleQRScannerProps {
  onQRCodeScanned: (qrData: string) => void;
  onCancel: () => void;
}

export default function SimpleQRScanner({ onQRCodeScanned, onCancel }: SimpleQRScannerProps) {
  const [qrInput, setQrInput] = useState('');

  const handleManualQRInput = () => {
    if (!qrInput.trim()) {
      Alert.alert('Invalid Input', 'Please enter QR code data');
      return;
    }

    // Validate that this is an Aadhaar QR code
    if (isValidAadhaarQR(qrInput)) {
      onQRCodeScanned(qrInput);
    } else {
      Alert.alert(
        'Invalid QR Code',
        'This doesn\'t appear to be a valid Aadhaar QR code. Please check the format.',
        [
          { text: 'Try Again', onPress: () => setQrInput('') },
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

  const loadDemoQR = () => {
    const demoQRData = JSON.stringify({
      uid: "123456789012",
      name: "JOHN DOE",
      gender: "M",
      yob: "1990",
      co: "123 Main Street",
      vtc: "Sample Village",
      po: "Sample Post Office",
      dist: "Sample District",
      state: "Sample State",
      pc: "123456"
    });
    setQrInput(demoQRData);
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onCancel}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Aadhaar QR Input</ThemedText>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="qr-code" size={80} color="#007AFF" />
        </View>

        <ThemedText style={styles.title}>Enter Aadhaar QR Data</ThemedText>
        <ThemedText style={styles.subtitle}>
          Paste the QR code data from your mAadhaar app or UIDAI PDF
        </ThemedText>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Paste QR code data here..."
            value={qrInput}
            onChangeText={setQrInput}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.scanButton}
            onPress={handleManualQRInput}
          >
            <Text style={styles.scanButtonText}>Process QR Data</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.demoButton}
            onPress={loadDemoQR}
          >
            <Text style={styles.demoButtonText}>Load Demo QR</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.instructions}>
          <ThemedText style={styles.instructionsTitle}>How to get QR data:</ThemedText>
          <View style={styles.instructionItem}>
            <Ionicons name="phone-portrait" size={20} color="#007AFF" />
            <ThemedText style={styles.instructionText}>
              Open mAadhaar app → Generate QR → Copy data
            </ThemedText>
          </View>
          <View style={styles.instructionItem}>
            <Ionicons name="document-text" size={20} color="#007AFF" />
            <ThemedText style={styles.instructionText}>
              Open UIDAI PDF → Scan QR with another app → Copy data
            </ThemedText>
          </View>
        </View>
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
    paddingTop: 40,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: 'white',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#ccc',
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: 30,
  },
  textInput: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    padding: 15,
    color: 'white',
    fontSize: 14,
    fontFamily: 'monospace',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  buttonContainer: {
    marginBottom: 30,
  },
  scanButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 15,
  },
  scanButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  demoButton: {
    backgroundColor: '#34C759',
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 15,
  },
  demoButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  instructions: {
    backgroundColor: 'rgba(0,0,0,0.9)',
    padding: 20,
    borderRadius: 15,
  },
  instructionsTitle: {
    fontSize: 16,
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
});
