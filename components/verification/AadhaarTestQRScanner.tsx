import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AadhaarQRTestDataGenerator } from '@/services/AadhaarQRTestData';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';

interface AadhaarTestQRScannerProps {
  onQRCodeScanned: (qrData: string) => void;
  onCancel: () => void;
}

export default function AadhaarTestQRScanner({ onQRCodeScanned, onCancel }: AadhaarTestQRScannerProps) {
  const [selectedFormat, setSelectedFormat] = useState<string>('');

  const testFormats = AadhaarQRTestDataGenerator.getAllTestFormats();

  const handleTestQRSelect = (format: string, data: string) => {
    setSelectedFormat(format);
    onQRCodeScanned(data);
  };

  const renderTestFormat = (format: { format: string; data: string; description: string }) => (
    <TouchableOpacity
      key={format.format}
      style={[
        styles.formatButton,
        selectedFormat === format.format && styles.selectedFormat
      ]}
      onPress={() => handleTestQRSelect(format.format, format.data)}
    >
      <View style={styles.formatHeader}>
        <Ionicons 
          name="qr-code" 
          size={24} 
          color={selectedFormat === format.format ? "#007AFF" : "#666"} 
        />
        <ThemedText style={[
          styles.formatTitle,
          selectedFormat === format.format && styles.selectedText
        ]}>
          {format.format}
        </ThemedText>
      </View>
      <ThemedText style={styles.formatDescription}>
        {format.description}
      </ThemedText>
      <View style={styles.dataPreview}>
        <ThemedText style={styles.dataPreviewText}>
          {format.data.substring(0, 50)}...
        </ThemedText>
      </View>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onCancel}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Test Aadhaar QR Codes</ThemedText>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.instructions}>
          <Ionicons name="information-circle" size={24} color="#007AFF" />
          <ThemedText style={styles.instructionsTitle}>Test QR Code Formats</ThemedText>
          <ThemedText style={styles.instructionsText}>
            Select a test QR code format to simulate different Aadhaar QR code types.
            This is useful for testing the verification flow without scanning real QR codes.
          </ThemedText>
        </View>

        <View style={styles.formatsContainer}>
          {testFormats.map(renderTestFormat)}
        </View>

        <View style={styles.note}>
          <Ionicons name="warning" size={20} color="#FF9500" />
          <ThemedText style={styles.noteText}>
            These are test QR codes for development purposes only. 
            In production, use real mAadhaar app or UIDAI PDF QR codes.
          </ThemedText>
        </View>
      </ScrollView>
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
  },
  instructions: {
    backgroundColor: 'rgba(0,122,255,0.1)',
    padding: 15,
    borderRadius: 10,
    marginVertical: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
    marginLeft: 10,
    flex: 1,
  },
  instructionsText: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 5,
    marginLeft: 34,
    lineHeight: 20,
  },
  formatsContainer: {
    marginBottom: 20,
  },
  formatButton: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  selectedFormat: {
    backgroundColor: 'rgba(0,122,255,0.1)',
    borderColor: '#007AFF',
  },
  formatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  formatTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 10,
  },
  selectedText: {
    color: '#007AFF',
  },
  formatDescription: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 10,
  },
  dataPreview: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 8,
    borderRadius: 5,
  },
  dataPreviewText: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'monospace',
  },
  note: {
    backgroundColor: 'rgba(255,149,0,0.1)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  noteText: {
    fontSize: 14,
    color: '#FF9500',
    marginLeft: 10,
    flex: 1,
    lineHeight: 20,
  },
});
