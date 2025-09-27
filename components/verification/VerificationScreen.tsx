import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import FaceCapture from './FaceCapture';
import IDCapture from './IDCapture';
import VerificationService, {
  FaceDetectionResult,
  IDVerificationResult,
  VerificationSession,
} from '@/services/VerificationService';

const { width } = Dimensions.get('window');

type VerificationStep = 'intro' | 'face' | 'id' | 'processing' | 'result';

interface VerificationScreenProps {
  onComplete: (session: VerificationSession) => void;
  onCancel: () => void;
}

export default function VerificationScreen({ onComplete, onCancel }: VerificationScreenProps) {
  const [currentStep, setCurrentStep] = useState<VerificationStep>('intro');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [faceResult, setFaceResult] = useState<FaceDetectionResult | null>(null);
  const [idResult, setIdResult] = useState<IDVerificationResult | null>(null);
  const [finalResult, setFinalResult] = useState<VerificationSession | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const verificationService = VerificationService.getInstance();

  useEffect(() => {
    initializeSession();
  }, []);

  const initializeSession = async () => {
    try {
      const id = await verificationService.startVerificationSession();
      setSessionId(id);
    } catch (error) {
      console.error('Failed to initialize session:', error);
      Alert.alert('Error', 'Failed to initialize verification session.');
    }
  };

  const handleFaceCapture = (result: FaceDetectionResult) => {
    setFaceResult(result);
    setCurrentStep('id');
  };

  const handleIDCapture = (result: IDVerificationResult) => {
    setIdResult(result);
    setCurrentStep('processing');
    processVerification();
  };

  const processVerification = async () => {
    setIsProcessing(true);
    
    try {
      // Simulate processing time for better UX
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const result = await verificationService.completeVerification();
      setFinalResult(result);
      setCurrentStep('result');
    } catch (error) {
      console.error('Verification failed:', error);
      Alert.alert(
        'Verification Failed',
        'An error occurred during verification. Please try again.',
        [{ text: 'OK', onPress: () => setCurrentStep('intro') }]
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const renderIntroScreen = () => (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.introHeader}>
          <Ionicons name="shield-checkmark" size={80} color="#007AFF" />
          <ThemedText style={styles.introTitle}>Identity Verification</ThemedText>
          <ThemedText style={styles.introSubtitle}>
            Secure and fast identity verification using advanced face recognition
          </ThemedText>
        </View>

        <View style={styles.stepsContainer}>
          <View style={styles.step}>
            <View style={styles.stepIcon}>
              <Ionicons name="camera" size={24} color="#007AFF" />
            </View>
            <View style={styles.stepContent}>
              <ThemedText style={styles.stepTitle}>Face Verification</ThemedText>
              <ThemedText style={styles.stepDescription}>
                Take a selfie for liveness detection and face recognition
              </ThemedText>
            </View>
          </View>

          <View style={styles.step}>
            <View style={styles.stepIcon}>
              <Ionicons name="document-text" size={24} color="#007AFF" />
            </View>
            <View style={styles.stepContent}>
              <ThemedText style={styles.stepTitle}>ID Document Scan</ThemedText>
              <ThemedText style={styles.stepDescription}>
                Capture or upload your government-issued ID document
              </ThemedText>
            </View>
          </View>

          <View style={styles.step}>
            <View style={styles.stepIcon}>
              <Ionicons name="checkmark-circle" size={24} color="#007AFF" />
            </View>
            <View style={styles.stepContent}>
              <ThemedText style={styles.stepTitle}>Verification Complete</ThemedText>
              <ThemedText style={styles.stepDescription}>
                Get instant results with detailed verification score
              </ThemedText>
            </View>
          </View>
        </View>

        <View style={styles.securityNote}>
          <Ionicons name="lock-closed" size={20} color="#666" />
          <ThemedText style={styles.securityText}>
            Your data is encrypted and processed securely. We never store your biometric data.
          </ThemedText>
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.startButton}
          onPress={() => setCurrentStep('face')}
        >
          <Text style={styles.startButtonText}>Start Verification</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );

  const renderProcessingScreen = () => (
    <ThemedView style={styles.container}>
      <View style={styles.processingContainer}>
        <View style={styles.processingIcon}>
          <Ionicons name="sync" size={60} color="#007AFF" />
        </View>
        <ThemedText style={styles.processingTitle}>Verifying Identity</ThemedText>
        <ThemedText style={styles.processingSubtitle}>
          Please wait while we process your verification...
        </ThemedText>

        <View style={styles.processingSteps}>
          <View style={styles.processingStep}>
            <Ionicons 
              name={faceResult ? "checkmark-circle" : "ellipse-outline"} 
              size={20} 
              color={faceResult ? "#34C759" : "#666"} 
            />
            <ThemedText style={styles.processingStepText}>Face verification complete</ThemedText>
          </View>
          
          <View style={styles.processingStep}>
            <Ionicons 
              name={idResult ? "checkmark-circle" : "ellipse-outline"} 
              size={20} 
              color={idResult ? "#34C759" : "#666"} 
            />
            <ThemedText style={styles.processingStepText}>ID document processed</ThemedText>
          </View>
          
          <View style={styles.processingStep}>
            <Ionicons 
              name={finalResult ? "checkmark-circle" : "ellipse-outline"} 
              size={20} 
              color={finalResult ? "#34C759" : "#666"} 
            />
            <ThemedText style={styles.processingStepText}>Cross-verification analysis</ThemedText>
          </View>
        </View>
      </View>
    </ThemedView>
  );

  const renderResultScreen = () => {
    if (!finalResult) return null;

    const isSuccess = finalResult.status === 'completed';
    const scorePercentage = Math.round(finalResult.overallScore * 100);

    return (
      <ThemedView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.resultHeader}>
            <Ionicons 
              name={isSuccess ? "checkmark-circle" : "close-circle"} 
              size={80} 
              color={isSuccess ? "#34C759" : "#FF3B30"} 
            />
            <ThemedText style={[
              styles.resultTitle,
              { color: isSuccess ? "#34C759" : "#FF3B30" }
            ]}>
              {isSuccess ? "Verification Successful" : "Verification Failed"}
            </ThemedText>
            <ThemedText style={styles.resultScore}>
              Confidence Score: {scorePercentage}%
            </ThemedText>
          </View>

          <View style={styles.resultDetails}>
            <ThemedText style={styles.resultSectionTitle}>Verification Details</ThemedText>
            
            <View style={styles.resultItem}>
              <Ionicons 
                name={faceResult?.isLive ? "checkmark" : "close"} 
                size={20} 
                color={faceResult?.isLive ? "#34C759" : "#FF3B30"} 
              />
              <ThemedText style={styles.resultItemText}>
                Liveness Detection: {faceResult?.isLive ? "Passed" : "Failed"}
              </ThemedText>
            </View>

            <View style={styles.resultItem}>
              <Ionicons 
                name={faceResult && faceResult.confidence > 0.7 ? "checkmark" : "close"} 
                size={20} 
                color={faceResult && faceResult.confidence > 0.7 ? "#34C759" : "#FF3B30"} 
              />
              <ThemedText style={styles.resultItemText}>
                Face Quality: {faceResult ? Math.round(faceResult.confidence * 100) : 0}%
              </ThemedText>
            </View>

            <View style={styles.resultItem}>
              <Ionicons 
                name={idResult?.isValid ? "checkmark" : "close"} 
                size={20} 
                color={idResult?.isValid ? "#34C759" : "#FF3B30"} 
              />
              <ThemedText style={styles.resultItemText}>
                Document Validity: {idResult?.isValid ? "Valid" : "Invalid"}
              </ThemedText>
            </View>

            <View style={styles.resultItem}>
              <Ionicons 
                name={idResult && idResult.faceMatch && idResult.faceMatch > 0.7 ? "checkmark" : "close"} 
                size={20} 
                color={idResult && idResult.faceMatch && idResult.faceMatch > 0.7 ? "#34C759" : "#FF3B30"} 
              />
              <ThemedText style={styles.resultItemText}>
                Face Match: {idResult?.faceMatch ? Math.round(idResult.faceMatch * 100) : 0}%
              </ThemedText>
            </View>
          </View>

          {idResult?.extractedData && (
            <View style={styles.extractedData}>
              <ThemedText style={styles.resultSectionTitle}>Extracted Information</ThemedText>
              {idResult.extractedData.name && (
                <View style={styles.dataItem}>
                  <ThemedText style={styles.dataLabel}>Name:</ThemedText>
                  <ThemedText style={styles.dataValue}>{idResult.extractedData.name}</ThemedText>
                </View>
              )}
              {idResult.extractedData.documentNumber && (
                <View style={styles.dataItem}>
                  <ThemedText style={styles.dataLabel}>Document #:</ThemedText>
                  <ThemedText style={styles.dataValue}>{idResult.extractedData.documentNumber}</ThemedText>
                </View>
              )}
              {idResult.extractedData.expiryDate && (
                <View style={styles.dataItem}>
                  <ThemedText style={styles.dataLabel}>Expires:</ThemedText>
                  <ThemedText style={styles.dataValue}>{idResult.extractedData.expiryDate}</ThemedText>
                </View>
              )}
            </View>
          )}
        </ScrollView>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.completeButton}
            onPress={() => onComplete(finalResult)}
          >
            <Text style={styles.completeButtonText}>Complete</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              setCurrentStep('intro');
              setFaceResult(null);
              setIdResult(null);
              setFinalResult(null);
              initializeSession();
            }}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  };

  switch (currentStep) {
    case 'intro':
      return renderIntroScreen();
    case 'face':
      return (
        <FaceCapture
          onFaceCapture={handleFaceCapture}
          onCancel={() => setCurrentStep('intro')}
        />
      );
    case 'id':
      return (
        <IDCapture
          onIDCapture={handleIDCapture}
          onCancel={() => setCurrentStep('face')}
        />
      );
    case 'processing':
      return renderProcessingScreen();
    case 'result':
      return renderResultScreen();
    default:
      return renderIntroScreen();
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  // Intro Screen Styles
  introHeader: {
    alignItems: 'center',
    marginBottom: 40,
  },
  introTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  introSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 22,
  },
  stepsContainer: {
    marginBottom: 30,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  stepIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F0F8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
  },
  stepDescription: {
    fontSize: 14,
    opacity: 0.7,
    lineHeight: 18,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  securityText: {
    flex: 1,
    fontSize: 12,
    marginLeft: 10,
    lineHeight: 16,
    opacity: 0.8,
  },
  // Processing Screen Styles
  processingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  processingIcon: {
    marginBottom: 30,
  },
  processingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  processingSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 40,
  },
  processingSteps: {
    width: '100%',
  },
  processingStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  processingStepText: {
    fontSize: 16,
    marginLeft: 10,
  },
  // Result Screen Styles
  resultHeader: {
    alignItems: 'center',
    marginBottom: 40,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  resultScore: {
    fontSize: 18,
    fontWeight: '600',
    opacity: 0.8,
  },
  resultDetails: {
    marginBottom: 30,
  },
  resultSectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  resultItemText: {
    fontSize: 16,
    marginLeft: 10,
  },
  extractedData: {
    backgroundColor: '#F8F9FA',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  dataItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dataLabel: {
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.7,
  },
  dataValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  // Button Styles
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 20,
  },
  startButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 15,
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  completeButton: {
    backgroundColor: '#34C759',
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 15,
  },
  completeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  retryButton: {
    backgroundColor: '#FF9500',
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 15,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  cancelButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
  },
});
