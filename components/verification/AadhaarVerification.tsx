import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import SelfProtocolService from '@/services/SelfProtocolService';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

interface AadhaarVerificationProps {
  onComplete: (result: any) => void;
  onCancel: () => void;
}

export default function AadhaarVerification({ onComplete, onCancel }: AadhaarVerificationProps) {
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'input' | 'otp' | 'verification' | 'result'>('input');
  const [isLoading, setIsLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);

  const selfProtocolService = SelfProtocolService.getInstance();

  const handleAadhaarSubmit = async () => {
    if (!aadhaarNumber || aadhaarNumber.length !== 12) {
      Alert.alert('Invalid Aadhaar', 'Please enter a valid 12-digit Aadhaar number');
      return;
    }

    setIsLoading(true);
    try {
      // Send OTP through Self Protocol
      const result = await selfProtocolService.authenticateWithAadhaar(aadhaarNumber);
      if (result) {
        setStep('otp');
      }
    } catch (error) {
      console.error('Aadhaar authentication failed:', error);
      Alert.alert('Authentication Failed', 'Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPSubmit = async () => {
    if (!otp || otp.length !== 6) {
      Alert.alert('Invalid OTP', 'Please enter a valid 6-digit OTP');
      return;
    }

    setIsLoading(true);
    try {
      // Verify OTP and complete authentication
      const result = await selfProtocolService.authenticateWithAadhaar(aadhaarNumber, { otp });
      
      if (result.success) {
        setVerificationResult(result);
        setStep('result');
      } else {
        Alert.alert('Verification Failed', result.responseMessage || 'OTP verification failed');
      }
    } catch (error) {
      console.error('OTP verification failed:', error);
      Alert.alert('Verification Failed', 'Failed to verify OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = () => {
    onComplete(verificationResult);
  };

  const renderAadhaarInput = () => (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Ionicons name="card" size={80} color="#007AFF" />
          <ThemedText style={styles.title}>Aadhaar Verification</ThemedText>
          <ThemedText style={styles.subtitle}>
            Verify your identity using Aadhaar through Self Protocol
          </ThemedText>
        </View>

        <View style={styles.formContainer}>
          <ThemedText style={styles.label}>Aadhaar Number</ThemedText>
          <TextInput
            style={styles.input}
            value={aadhaarNumber}
            onChangeText={setAadhaarNumber}
            placeholder="Enter 12-digit Aadhaar number"
            keyboardType="numeric"
            maxLength={12}
            secureTextEntry={false}
          />
          
          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={20} color="#007AFF" />
            <Text style={styles.infoText}>
              Your Aadhaar number will be verified through Self Protocol's secure infrastructure. 
              No personal data is stored or transmitted.
            </Text>
          </View>
        </View>

        <View style={styles.featuresContainer}>
          <ThemedText style={styles.sectionTitle}>Privacy Features</ThemedText>
          
          <View style={styles.feature}>
            <Ionicons name="shield-checkmark" size={24} color="#34C759" />
            <View style={styles.featureText}>
              <ThemedText style={styles.featureTitle}>Zero-Knowledge Proofs</ThemedText>
              <ThemedText style={styles.featureDescription}>
                Verify identity without revealing personal information
              </ThemedText>
            </View>
          </View>

          <View style={styles.feature}>
            <Ionicons name="lock-closed" size={24} color="#34C759" />
            <View style={styles.featureText}>
              <ThemedText style={styles.featureTitle}>Privacy-Preserving</ThemedText>
              <ThemedText style={styles.featureDescription}>
                Only boolean proofs are generated, no raw data exposed
              </ThemedText>
            </View>
          </View>

          <View style={styles.feature}>
            <Ionicons name="key" size={24} color="#34C759" />
            <View style={styles.featureText}>
              <ThemedText style={styles.featureTitle}>Self-Sovereign Identity</ThemedText>
              <ThemedText style={styles.featureDescription}>
                You control your identity data and verification proofs
              </ThemedText>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={handleAadhaarSubmit}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Sending OTP...' : 'Send OTP'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={onCancel}>
          <Text style={styles.secondaryButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );

  const renderOTPInput = () => (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Ionicons name="mail" size={80} color="#007AFF" />
          <ThemedText style={styles.title}>Enter OTP</ThemedText>
          <ThemedText style={styles.subtitle}>
            Enter the 6-digit OTP sent to your registered mobile number
          </ThemedText>
        </View>

        <View style={styles.formContainer}>
          <ThemedText style={styles.label}>OTP Code</ThemedText>
          <TextInput
            style={styles.input}
            value={otp}
            onChangeText={setOtp}
            placeholder="Enter 6-digit OTP"
            keyboardType="numeric"
            maxLength={6}
            secureTextEntry={false}
          />
          
          <View style={styles.infoBox}>
            <Ionicons name="time" size={20} color="#FF9500" />
            <Text style={styles.infoText}>
              OTP is valid for 5 minutes. If you don't receive it, please try again.
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={handleOTPSubmit}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Verifying...' : 'Verify OTP'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.button} 
          onPress={() => setStep('input')}
        >
          <Text style={styles.secondaryButtonText}>Back</Text>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );

  const renderResult = () => {
    if (!verificationResult) return null;

    const isSuccess = verificationResult.success;
    const confidencePercentage = Math.round(verificationResult.confidenceScore * 100);

    return (
      <ThemedView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Ionicons 
              name={isSuccess ? "checkmark-circle" : "close-circle"} 
              size={80} 
              color={isSuccess ? "#34C759" : "#FF3B30"} 
            />
            <ThemedText style={[
              styles.title,
              { color: isSuccess ? "#34C759" : "#FF3B30" }
            ]}>
              {isSuccess ? "Verification Successful" : "Verification Failed"}
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              {isSuccess 
                ? "Your identity has been verified through Self Protocol" 
                : "Identity verification failed. Please try again."
              }
            </ThemedText>
          </View>

          {isSuccess && (
            <View style={styles.resultContainer}>
              <ThemedText style={styles.sectionTitle}>Verification Details</ThemedText>
              
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
            style={[styles.button, styles.primaryButton]}
            onPress={handleComplete}
          >
            <Text style={styles.buttonText}>Complete</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => setStep('input')}
          >
            <Text style={styles.secondaryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  };

  switch (step) {
    case 'input':
      return renderAadhaarInput();
    case 'otp':
      return renderOTPInput();
    case 'result':
      return renderResult();
    default:
      return renderAadhaarInput();
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
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 22,
  },
  formContainer: {
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E5E7',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: '#F8F9FA',
    marginBottom: 15,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F0F8FF',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    marginLeft: 10,
    lineHeight: 18,
    color: '#333333',
  },
  featuresContainer: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333333',
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  featureText: {
    flex: 1,
    marginLeft: 15,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  featureDescription: {
    fontSize: 14,
    opacity: 0.7,
    lineHeight: 18,
  },
  resultContainer: {
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
  button: {
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 15,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#666',
    fontSize: 16,
  },
});
