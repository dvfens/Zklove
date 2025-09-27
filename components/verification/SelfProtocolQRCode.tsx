import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import SelfProtocolSDK from '@/services/SelfProtocolSDK';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface SelfProtocolQRCodeProps {
  onComplete: (result: any) => void;
  onCancel: () => void;
  verificationLevel?: 'basic' | 'enhanced' | 'premium';
  requiredAge?: number;
  allowedCountries?: string[];
  requireSanctionsCheck?: boolean;
}

export default function SelfProtocolQRCode({
  onComplete,
  onCancel,
  verificationLevel = 'enhanced',
  requiredAge,
  allowedCountries,
  requireSanctionsCheck = false
}: SelfProtocolQRCodeProps) {
  const [qrCodeData, setQrCodeData] = useState<string>('');
  const [sessionId, setSessionId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isPolling, setIsPolling] = useState(false);
  const [sessionStatus, setSessionStatus] = useState<'pending' | 'completed' | 'failed' | 'expired'>('pending');
  const [timeRemaining, setTimeRemaining] = useState(30 * 60); // 30 minutes in seconds

  const selfSDK = SelfProtocolSDK.getInstance();

  useEffect(() => {
    initializeVerification();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPolling && sessionId) {
      interval = setInterval(async () => {
        await checkVerificationStatus();
      }, 2000); // Poll every 2 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPolling, sessionId]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (timeRemaining > 0 && sessionStatus === 'pending') {
      timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setSessionStatus('expired');
            setIsPolling(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [timeRemaining, sessionStatus]);

  const initializeVerification = async () => {
    try {
      setIsLoading(true);
      
      const session = await selfSDK.createVerificationSession({
        requiredAge,
        allowedCountries,
        requireSanctionsCheck,
        documentTypes: ['passport', 'aadhaar', 'drivers_license']
      });

      setQrCodeData(session.qrCodeData);
      setSessionId(session.sessionId);
      setIsPolling(true);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to initialize verification:', error);
      Alert.alert('Error', 'Failed to initialize verification. Please try again.');
      setIsLoading(false);
    }
  };

  const checkVerificationStatus = async () => {
    try {
      const session = await selfSDK.checkVerificationStatus(sessionId);
      
      if (session) {
        setSessionStatus(session.status);
        
        if (session.status === 'completed' && session.verificationData) {
          setIsPolling(false);
          onComplete(session.verificationData);
        } else if (session.status === 'failed' || session.status === 'expired') {
          setIsPolling(false);
        }
      }
    } catch (error) {
      console.error('Failed to check verification status:', error);
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const renderQRCode = () => (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Ionicons name="qr-code" size={80} color="#007AFF" />
          <ThemedText style={styles.title}>Scan with Self App</ThemedText>
          <ThemedText style={styles.subtitle}>
            Use the Self mobile app to scan this QR code and verify your identity
          </ThemedText>
        </View>

        <View style={styles.qrContainer}>
          <View style={styles.qrCodePlaceholder}>
            <Ionicons name="qr-code-outline" size={120} color="#007AFF" />
            <ThemedText style={styles.qrCodeText}>QR Code</ThemedText>
            <ThemedText style={styles.qrCodeData} numberOfLines={3}>
              {qrCodeData}
            </ThemedText>
          </View>
        </View>

        <View style={styles.instructionsContainer}>
          <ThemedText style={styles.sectionTitle}>How to Verify</ThemedText>
          
          <View style={styles.instruction}>
            <View style={styles.instructionNumber}>
              <ThemedText style={styles.instructionNumberText}>1</ThemedText>
            </View>
            <ThemedText style={styles.instructionText}>
              Download the Self mobile app from your app store
            </ThemedText>
          </View>

          <View style={styles.instruction}>
            <View style={styles.instructionNumber}>
              <ThemedText style={styles.instructionNumberText}>2</ThemedText>
            </View>
            <ThemedText style={styles.instructionText}>
              Open the Self app and tap "Scan QR Code"
            </ThemedText>
          </View>

          <View style={styles.instruction}>
            <View style={styles.instructionNumber}>
              <ThemedText style={styles.instructionNumberText}>3</ThemedText>
            </View>
            <ThemedText style={styles.instructionText}>
              Scan this QR code with your device camera
            </ThemedText>
          </View>

          <View style={styles.instruction}>
            <View style={styles.instructionNumber}>
              <ThemedText style={styles.instructionNumberText}>4</ThemedText>
            </View>
            <ThemedText style={styles.instructionText}>
              Follow the verification steps in the Self app
            </ThemedText>
          </View>
        </View>

        <View style={styles.statusContainer}>
          <View style={styles.statusItem}>
            <Ionicons name="time" size={20} color="#FF9500" />
            <ThemedText style={styles.statusText}>
              Time Remaining: {formatTime(timeRemaining)}
            </ThemedText>
          </View>
          
          <View style={styles.statusItem}>
            <Ionicons name="shield-checkmark" size={20} color="#34C759" />
            <ThemedText style={styles.statusText}>
              Privacy-First: Zero-knowledge proofs
            </ThemedText>
          </View>
        </View>

        <View style={styles.featuresContainer}>
          <ThemedText style={styles.sectionTitle}>Privacy Features</ThemedText>
          
          <View style={styles.feature}>
            <Ionicons name="lock-closed" size={24} color="#34C759" />
            <View style={styles.featureText}>
              <ThemedText style={styles.featureTitle}>Zero-Knowledge Proofs</ThemedText>
              <ThemedText style={styles.featureDescription}>
                Verify identity without revealing personal information
              </ThemedText>
            </View>
          </View>

          <View style={styles.feature}>
            <Ionicons name="eye-off" size={24} color="#34C759" />
            <View style={styles.featureText}>
              <ThemedText style={styles.featureTitle}>Selective Disclosure</ThemedText>
              <ThemedText style={styles.featureDescription}>
                Choose exactly what information to share
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
          onPress={initializeVerification}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Generating...' : 'Refresh QR Code'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={onCancel}>
          <Text style={styles.secondaryButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );

  const renderLoading = () => (
    <ThemedView style={styles.container}>
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <ThemedText style={styles.loadingText}>Initializing verification...</ThemedText>
      </View>
    </ThemedView>
  );

  const renderStatus = () => {
    let statusIcon = 'time';
    let statusColor = '#FF9500';
    let statusText = 'Waiting for verification...';

    switch (sessionStatus) {
      case 'completed':
        statusIcon = 'checkmark-circle';
        statusColor = '#34C759';
        statusText = 'Verification completed successfully!';
        break;
      case 'failed':
        statusIcon = 'close-circle';
        statusColor = '#FF3B30';
        statusText = 'Verification failed. Please try again.';
        break;
      case 'expired':
        statusIcon = 'time-outline';
        statusColor = '#FF3B30';
        statusText = 'Verification session expired.';
        break;
    }

    return (
      <View style={styles.statusBanner}>
        <Ionicons name={statusIcon} size={24} color={statusColor} />
        <ThemedText style={[styles.statusBannerText, { color: statusColor }]}>
          {statusText}
        </ThemedText>
      </View>
    );
  };

  if (isLoading) {
    return renderLoading();
  }

  return (
    <ThemedView style={styles.container}>
      {renderStatus()}
      {renderQRCode()}
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
  qrContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  qrCodePlaceholder: {
    width: 200,
    height: 200,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E5E7',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  qrCodeText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
    color: '#333333',
  },
  qrCodeData: {
    fontSize: 10,
    textAlign: 'center',
    marginTop: 10,
    color: '#666666',
    fontFamily: 'monospace',
  },
  instructionsContainer: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333333',
  },
  instruction: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  instructionNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  instructionNumberText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  instructionText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
  },
  statusContainer: {
    backgroundColor: '#F8F9FA',
    padding: 20,
    borderRadius: 12,
    marginBottom: 30,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusText: {
    fontSize: 16,
    marginLeft: 10,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F8FF',
    padding: 15,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 10,
  },
  statusBannerText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  featuresContainer: {
    marginBottom: 30,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 20,
    opacity: 0.7,
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
