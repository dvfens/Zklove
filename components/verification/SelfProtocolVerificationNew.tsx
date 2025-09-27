import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import {
    SelfVerificationResult,
} from '@/services/SelfProtocolService';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import SelfProtocolQRCode from './SelfProtocolQRCode';

interface SelfProtocolVerificationProps {
  onComplete: (result: SelfVerificationResult) => void;
  onCancel: () => void;
  verificationLevel?: 'basic' | 'enhanced' | 'premium';
  requiredAge?: number;
  allowedCountries?: string[];
  requireSanctionsCheck?: boolean;
}

export default function SelfProtocolVerification({
  onComplete,
  onCancel,
  verificationLevel = 'basic',
  requiredAge,
  allowedCountries,
  requireSanctionsCheck = false,
}: SelfProtocolVerificationProps) {
  const [currentStep, setCurrentStep] = useState<'intro' | 'qr-code' | 'result'>('intro');
  const [verificationResult, setVerificationResult] = useState<SelfVerificationResult | null>(null);

  const handleQRCodeComplete = (result: SelfVerificationResult) => {
    setVerificationResult(result);
    setCurrentStep('result');
  };

  const handleStartVerification = () => {
    setCurrentStep('qr-code');
  };

  const renderIntroScreen = () => (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.introHeader}>
          <Ionicons name="shield-checkmark" size={80} color="#007AFF" />
          <ThemedText style={styles.introTitle}>Self Protocol Verification</ThemedText>
          <ThemedText style={styles.introSubtitle}>
            Privacy-first identity verification powered by zero-knowledge proofs
          </ThemedText>
        </View>

        <View style={styles.privacyFeatures}>
          <ThemedText style={styles.sectionTitle}>Privacy Features</ThemedText>
          
          <View style={styles.featureItem}>
            <Ionicons name="lock-closed" size={20} color="#34C759" />
            <ThemedText style={styles.featureText}>
              Zero-knowledge proofs - no private data exposed
            </ThemedText>
          </View>
          
          <View style={styles.featureItem}>
            <Ionicons name="eye-off" size={20} color="#34C759" />
            <ThemedText style={styles.featureText}>
              Local processing - no external data sharing
            </ThemedText>
          </View>
          
          <View style={styles.featureItem}>
            <Ionicons name="shield" size={20} color="#34C759" />
            <ThemedText style={styles.featureText}>
              Sybil resistance - prevents duplicate identities
            </ThemedText>
          </View>
          
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color="#34C759" />
            <ThemedText style={styles.featureText}>
              Age, country, and sanctions verification
            </ThemedText>
          </View>
        </View>

        <View style={styles.verificationLevel}>
          <ThemedText style={styles.sectionTitle}>Verification Level: {verificationLevel.toUpperCase()}</ThemedText>
          
          {verificationLevel === 'basic' && (
            <ThemedText style={styles.levelDescription}>
              Basic identity verification with privacy protection
            </ThemedText>
          )}
          
          {verificationLevel === 'enhanced' && (
            <ThemedText style={styles.levelDescription}>
              Enhanced verification with age and country checks
            </ThemedText>
          )}
          
          {verificationLevel === 'premium' && (
            <ThemedText style={styles.levelDescription}>
              Premium verification with sanctions screening
            </ThemedText>
          )}
        </View>

        <View style={styles.howItWorks}>
          <ThemedText style={styles.sectionTitle}>How It Works</ThemedText>
          
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <ThemedText style={styles.stepNumberText}>1</ThemedText>
            </View>
            <View style={styles.stepContent}>
              <ThemedText style={styles.stepTitle}>Scan QR Code</ThemedText>
              <ThemedText style={styles.stepDescription}>
                Use the Self mobile app to scan the QR code
              </ThemedText>
            </View>
          </View>

          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <ThemedText style={styles.stepNumberText}>2</ThemedText>
            </View>
            <View style={styles.stepContent}>
              <ThemedText style={styles.stepTitle}>Verify Identity</ThemedText>
              <ThemedText style={styles.stepDescription}>
                Follow the verification steps in the Self app
              </ThemedText>
            </View>
          </View>

          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <ThemedText style={styles.stepNumberText}>3</ThemedText>
            </View>
            <View style={styles.stepContent}>
              <ThemedText style={styles.stepTitle}>Get Proof</ThemedText>
              <ThemedText style={styles.stepDescription}>
                Receive zero-knowledge proof of your identity
              </ThemedText>
            </View>
          </View>
        </View>

        <View style={styles.securityNote}>
          <Ionicons name="lock-closed" size={20} color="#666" />
          <Text style={styles.securityText}>
            Your identity data is processed locally and never shared. Only privacy-preserving proofs are generated.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.startButton}
          onPress={handleStartVerification}
        >
          <Text style={styles.startButtonText}>Start Verification</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );

  const renderResultScreen = () => {
    if (!verificationResult) return null;

    const isSuccess = verificationResult.isHuman && verificationResult.isUnique;
    const confidencePercentage = Math.round(verificationResult.confidenceScore * 100);

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
            <ThemedText style={styles.resultSubtitle}>
              {isSuccess 
                ? "Your identity has been verified through Self Protocol" 
                : "Identity verification failed. Please try again."
              }
            </ThemedText>
          </View>

          {isSuccess && (
            <View style={styles.resultDetails}>
              <ThemedText style={styles.sectionTitle}>Verification Results</ThemedText>
              
              <View style={styles.resultItem}>
                <Ionicons name="person" size={20} color="#34C759" />
                <ThemedText style={styles.resultText}>
                  Human Verification: {verificationResult.isHuman ? "Passed" : "Failed"}
                </ThemedText>
              </View>

              <View style={styles.resultItem}>
                <Ionicons name="finger-print" size={20} color="#34C759" />
                <ThemedText style={styles.resultText}>
                  Uniqueness Check: {verificationResult.isUnique ? "Passed" : "Failed"}
                </ThemedText>
              </View>

              <View style={styles.resultItem}>
                <Ionicons name="calendar" size={20} color="#34C759" />
                <ThemedText style={styles.resultText}>
                  Age Verification: {verificationResult.ageVerified ? "Passed" : "Failed"}
                </ThemedText>
              </View>

              <View style={styles.resultItem}>
                <Ionicons name="globe" size={20} color="#34C759" />
                <ThemedText style={styles.resultText}>
                  Country Verification: {verificationResult.countryVerified ? "Passed" : "Failed"}
                </ThemedText>
              </View>

              <View style={styles.resultItem}>
                <Ionicons name="shield" size={20} color="#34C759" />
                <ThemedText style={styles.resultText}>
                  Sanctions Check: {verificationResult.sanctionsCleared ? "Passed" : "Failed"}
                </ThemedText>
              </View>

              <View style={styles.confidenceContainer}>
                <ThemedText style={styles.confidenceLabel}>Confidence Score</ThemedText>
                <ThemedText style={styles.confidenceValue}>{confidencePercentage}%</ThemedText>
              </View>

              {verificationResult.zkProof && (
                <View style={styles.zkProofContainer}>
                  <ThemedText style={styles.sectionTitle}>Zero-Knowledge Proof</ThemedText>
                  <View style={styles.proofItem}>
                    <Text style={styles.proofLabel}>Proof Hash:</Text>
                    <Text style={styles.proofValue}>
                      {verificationResult.zkProof.proofHash.substring(0, 20)}...
                    </Text>
                  </View>
                  <View style={styles.proofItem}>
                    <Text style={styles.proofLabel}>Identity Commitment:</Text>
                    <Text style={styles.proofValue}>
                      {verificationResult.zkProof.identityCommitment.substring(0, 20)}...
                    </Text>
                  </View>
                </View>
              )}
            </View>
          )}
        </ScrollView>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.completeButton}
            onPress={() => onComplete(verificationResult)}
          >
            <Text style={styles.completeButtonText}>Complete</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => setCurrentStep('intro')}
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
    case 'qr-code':
      return (
        <SelfProtocolQRCode
          onComplete={handleQRCodeComplete}
          onCancel={() => setCurrentStep('intro')}
          verificationLevel={verificationLevel}
          requiredAge={requiredAge}
          allowedCountries={allowedCountries}
          requireSanctionsCheck={requireSanctionsCheck}
        />
      );
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
  privacyFeatures: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333333',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  featureText: {
    fontSize: 16,
    marginLeft: 10,
  },
  verificationLevel: {
    marginBottom: 30,
  },
  levelDescription: {
    fontSize: 16,
    opacity: 0.7,
    lineHeight: 22,
  },
  howItWorks: {
    marginBottom: 30,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  stepNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  stepNumberText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
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
    color: '#333333',
    opacity: 1,
  },
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
  resultSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 22,
  },
  resultDetails: {
    marginBottom: 30,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  resultText: {
    fontSize: 16,
    marginLeft: 10,
  },
  confidenceContainer: {
    backgroundColor: '#F0F8FF',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 20,
  },
  confidenceLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  confidenceValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  zkProofContainer: {
    backgroundColor: '#F0FFF4',
    padding: 20,
    borderRadius: 12,
    marginTop: 20,
  },
  proofItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  proofLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
  },
  proofValue: {
    fontSize: 14,
    color: '#333333',
    fontFamily: 'monospace',
  },
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
