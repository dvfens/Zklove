import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
  Dimensions,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import VerificationService, { IDVerificationResult } from '@/services/VerificationService';

const { width, height } = Dimensions.get('window');

interface IDCaptureProps {
  onIDCapture: (result: IDVerificationResult) => void;
  onCancel: () => void;
}

export default function IDCapture({ onIDCapture, onCancel }: IDCaptureProps) {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [isProcessing, setIsProcessing] = useState(false);
  const [captureMode, setCaptureMode] = useState<'camera' | 'gallery'>('camera');
  const cameraRef = useRef<CameraView>(null);
  const verificationService = VerificationService.getInstance();

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <ThemedView style={styles.container}>
        <ThemedView style={styles.permissionContainer}>
          <Ionicons name="document-outline" size={64} color="#666" />
          <ThemedText style={styles.permissionTitle}>Camera Permission Required</ThemedText>
          <ThemedText style={styles.permissionText}>
            We need access to your camera to capture your ID document.
          </ThemedText>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>
    );
  }

  const capturePhoto = async () => {
    if (!cameraRef.current || isProcessing) return;

    setIsProcessing(true);

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.9,
        base64: false,
        skipProcessing: false,
      });

      if (photo) {
        await processDocument(photo.uri);
      }
    } catch (error) {
      console.error('Error capturing photo:', error);
      Alert.alert(
        'Capture Failed',
        'Failed to capture photo. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const pickFromGallery = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'image/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        setIsProcessing(true);
        await processDocument(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to pick document from gallery.');
    } finally {
      setIsProcessing(false);
    }
  };

  const processDocument = async (imageUri: string) => {
    try {
      const result = await verificationService.verifyIDDocument(imageUri);
      
      if (result.confidence < 0.5) {
        Alert.alert(
          'Document Quality Issue',
          'The document image quality is too low. Please ensure the document is well-lit and all text is clearly visible.',
          [
            { text: 'Retry', style: 'default' },
            { text: 'Continue Anyway', onPress: () => onIDCapture(result) }
          ]
        );
        return;
      }

      if (!result.isValid) {
        Alert.alert(
          'Invalid Document',
          'The document appears to be invalid or expired. Please check your document and try again.',
          [
            { text: 'Retry', style: 'default' },
            { text: 'Continue Anyway', onPress: () => onIDCapture(result) }
          ]
        );
        return;
      }

      onIDCapture(result);
    } catch (error) {
      console.error('Error processing document:', error);
      Alert.alert(
        'Processing Failed',
        'Failed to process the document. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  if (captureMode === 'gallery') {
    return (
      <ThemedView style={styles.container}>
        <ThemedView style={styles.galleryContainer}>
          <Ionicons name="images-outline" size={80} color="#007AFF" />
          <ThemedText style={styles.galleryTitle}>Select ID Document</ThemedText>
          <ThemedText style={styles.galleryText}>
            Choose a clear photo of your ID document from your gallery.
          </ThemedText>
          
          <TouchableOpacity
            style={[styles.actionButton, isProcessing && styles.actionButtonDisabled]}
            onPress={pickFromGallery}
            disabled={isProcessing}
          >
            <Text style={styles.actionButtonText}>
              {isProcessing ? 'Processing...' : 'Select from Gallery'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.switchModeButton}
            onPress={() => setCaptureMode('camera')}
          >
            <Text style={styles.switchModeText}>Use Camera Instead</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        animateShutter={false}
      >
        {/* Document Guide Overlay */}
        <View style={styles.overlay}>
          <View style={styles.documentGuide}>
            <View style={styles.documentFrame} />
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.instructionContainer}>
          <ThemedText style={styles.instructionText}>
            Position your ID document within the frame
          </ThemedText>
          <ThemedText style={styles.instructionSubtext}>
            Ensure all text is clearly visible
          </ThemedText>
        </View>

        {/* Processing Indicator */}
        {isProcessing && (
          <View style={styles.processingContainer}>
            <ThemedText style={styles.processingText}>Processing...</ThemedText>
          </View>
        )}

        {/* Controls */}
        <View style={styles.controlsContainer}>
          <TouchableOpacity style={styles.cancelControl} onPress={onCancel}>
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.captureButton,
              isProcessing && styles.captureButtonDisabled
            ]}
            onPress={capturePhoto}
            disabled={isProcessing}
          >
            <Ionicons name="camera" size={32} color="white" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.flipControl} onPress={toggleCameraFacing}>
            <Ionicons name="camera-reverse" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Bottom Actions */}
        <View style={styles.bottomActions}>
          <TouchableOpacity
            style={styles.galleryButton}
            onPress={() => setCaptureMode('gallery')}
          >
            <Ionicons name="images" size={20} color="white" />
            <Text style={styles.galleryButtonText}>Gallery</Text>
          </TouchableOpacity>
        </View>
      </CameraView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
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
  documentGuide: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  documentFrame: {
    width: width * 0.8,
    height: width * 0.8 * 0.63, // Standard ID card ratio
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  instructionContainer: {
    position: 'absolute',
    top: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  instructionText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  instructionSubtext: {
    fontSize: 14,
    color: 'white',
    textAlign: 'center',
    marginTop: 5,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  processingContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -75 }, { translateY: -20 }],
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  processingText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 50,
  },
  cancelControl: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
  flipControl: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomActions: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  galleryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  galleryButtonText: {
    color: 'white',
    marginLeft: 5,
    fontSize: 14,
  },
  // Gallery Mode Styles
  galleryContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  galleryTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  galleryText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  actionButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 15,
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  switchModeButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginBottom: 20,
  },
  switchModeText: {
    color: '#007AFF',
    fontSize: 16,
  },
  // Permission Styles
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  permissionButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 15,
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
  },
});
