import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import VerificationScreen from '@/components/verification/VerificationScreen';
import DatingScreen from '@/components/dating/DatingScreen';
import ZkLoveLogo from '@/components/ZkLoveLogo';
import AppInitializationService from '@/services/AppInitializationService';
import { VerificationSession } from '@/services/VerificationService';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';

export default function HomeScreen() {
  const [showVerification, setShowVerification] = useState(false);
  const [showDating, setShowDating] = useState(false);
  const [verificationHistory, setVerificationHistory] = useState<VerificationSession[]>([]);

  useEffect(() => {
    // Initialize all services including Self Protocol
    const initializeServices = async () => {
      try {
        const appInitService = AppInitializationService.getInstance();
        await appInitService.initializeAllServices();
        
        console.log('All services initialized successfully');
      } catch (error) {
        console.error('Service initialization failed:', error);
        // Continue with app even if some services fail
      }
    };

    initializeServices();
  }, []);

  const handleVerificationComplete = (session: VerificationSession) => {
    setVerificationHistory(prev => [session, ...prev]);
    setShowVerification(false);
    
    Alert.alert(
      'Verification Complete',
      `Identity verification ${session.status === 'completed' ? 'successful' : 'failed'} with ${Math.round(session.overallScore * 100)}% confidence.`,
      [{ text: 'OK' }]
    );
  };

  const handleVerificationCancel = () => {
    setShowVerification(false);
  };

  if (showVerification) {
    return (
      <VerificationScreen
        onComplete={handleVerificationComplete}
        onCancel={handleVerificationCancel}
      />
    );
  }

  if (showDating) {
    return (
      <DatingScreen
        onBack={() => setShowDating(false)}
      />
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <ThemedView style={styles.header}>
          <ZkLoveLogo size={100} style={styles.logo} />
          <ThemedText style={styles.title}>zkLove</ThemedText>
          <ThemedText style={styles.subtitle}>
            Zero-Knowledge Identity & Privacy-First Dating
          </ThemedText>
        </ThemedView>

        {/* Features */}
        <ThemedView style={styles.featuresContainer}>
          <ThemedText style={styles.sectionTitle}>Features</ThemedText>
          
          <ThemedView style={styles.feature}>
            <ThemedView style={styles.featureIcon}>
              <Ionicons name="camera" size={24} color="#007AFF" />
            </ThemedView>
            <ThemedView style={styles.featureContent}>
              <ThemedText style={styles.featureTitle}>Face Recognition</ThemedText>
              <ThemedText style={styles.featureDescription}>
                Advanced liveness detection and face analysis
              </ThemedText>
            </ThemedView>
          </ThemedView>

          <ThemedView style={styles.feature}>
            <ThemedView style={styles.featureIcon}>
              <Ionicons name="document-text" size={24} color="#007AFF" />
            </ThemedView>
            <ThemedView style={styles.featureContent}>
              <ThemedText style={styles.featureTitle}>ID Verification</ThemedText>
              <ThemedText style={styles.featureDescription}>
                OCR and document authenticity validation
              </ThemedText>
            </ThemedView>
          </ThemedView>

          <ThemedView style={styles.feature}>
            <ThemedView style={styles.featureIcon}>
              <Ionicons name="analytics" size={24} color="#007AFF" />
            </ThemedView>
            <ThemedView style={styles.featureContent}>
              <ThemedText style={styles.featureTitle}>AI-Powered Analysis</ThemedText>
              <ThemedText style={styles.featureDescription}>
                Cross-verification and confidence scoring
              </ThemedText>
            </ThemedView>
          </ThemedView>

          <ThemedView style={styles.feature}>
            <ThemedView style={styles.featureIcon}>
              <Ionicons name="lock-closed" size={24} color="#007AFF" />
            </ThemedView>
            <ThemedView style={styles.featureContent}>
              <ThemedText style={styles.featureTitle}>Secure & Private</ThemedText>
              <ThemedText style={styles.featureDescription}>
                End-to-end encryption, no data storage
              </ThemedText>
            </ThemedView>
          </ThemedView>

          <TouchableOpacity 
            style={[styles.feature, styles.datingFeature]} 
            onPress={() => setShowDating(true)}
          >
            <ThemedView style={[styles.featureIcon, styles.datingIcon]}>
              <Ionicons name="heart" size={24} color="#FF6B35" />
            </ThemedView>
            <ThemedView style={styles.featureContent}>
              <ThemedText style={styles.featureTitle}>🚀 Zero-Knowledge Dating</ThemedText>
              <ThemedText style={styles.featureDescription}>
                Privacy-first dating with anonymous matching and on-chain verification
              </ThemedText>
            </ThemedView>
            <Ionicons name="arrow-forward" size={20} color="#FF6B35" />
          </TouchableOpacity>
        </ThemedView>

        {/* Verification History */}
        {verificationHistory.length > 0 && (
          <ThemedView style={styles.historyContainer}>
            <ThemedText style={styles.sectionTitle}>Recent Verifications</ThemedText>
            {verificationHistory.slice(0, 3).map((session, index) => (
              <ThemedView key={session.id} style={styles.historyItem}>
                <Ionicons 
                  name={session.status === 'completed' ? "checkmark-circle" : "close-circle"} 
                  size={20} 
                  color={session.status === 'completed' ? "#34C759" : "#FF3B30"} 
                />
                <ThemedView style={styles.historyContent}>
                  <ThemedText style={styles.historyTitle}>
                    {session.status === 'completed' ? 'Verified' : 'Failed'}
                  </ThemedText>
                  <ThemedText style={styles.historyDescription}>
                    {Math.round(session.overallScore * 100)}% confidence • {new Date(session.timestamp).toLocaleDateString()}
                  </ThemedText>
                </ThemedView>
              </ThemedView>
            ))}
          </ThemedView>
        )}

        {/* Security Notice */}
        <ThemedView style={styles.securityNotice}>
          <Ionicons name="information-circle" size={20} color="#666" />
          <ThemedText style={styles.securityText}>
            Your biometric data is processed locally and never stored on our servers. 
            All verification happens on-device for maximum privacy.
          </ThemedText>
        </ThemedView>
      </ScrollView>

      {/* Start Verification Button */}
      <ThemedView style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.verifyButton}
          onPress={() => setShowVerification(true)}
        >
          <Ionicons name="scan" size={24} color="white" />
          <Text style={styles.verifyButtonText}>Start Verification</Text>
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  featuresContainer: {
    marginBottom: 40,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0F8FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureContent: {
    flex: 1,
    marginLeft: 16,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    opacity: 0.7,
    lineHeight: 18,
  },
  historyContainer: {
    marginBottom: 30,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  historyContent: {
    flex: 1,
    marginLeft: 12,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  historyDescription: {
    fontSize: 14,
    opacity: 0.7,
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F0F8FF',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  securityText: {
    flex: 1,
    fontSize: 12,
    marginLeft: 10,
    lineHeight: 16,
    opacity: 0.8,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  verifyButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 28,
    elevation: 4,
    shadowColor: '#007AFF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  verifyButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  datingFeature: {
    borderColor: '#FF6B35',
    borderWidth: 2,
    backgroundColor: 'rgba(255, 107, 53, 0.05)',
  },
  datingIcon: {
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
  },
});
