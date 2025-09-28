import { ThemedText } from '@/components/themed-text';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
    Dimensions,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

interface OnboardingScreenProps {
  onComplete: () => void;
}

const onboardingSteps = [
  {
    title: "Welcome to zkLove",
    subtitle: "Privacy-First Dating",
    description: "Find meaningful connections while keeping your identity completely private until you both choose to reveal it.",
    icon: "heart-circle",
    color: "#FF6B35"
  },
  {
    title: "Zero-Knowledge Matching",
    subtitle: "Anonymous & Secure",
    description: "Our advanced cryptography proves you're compatible (same city + shared hobbies) without revealing your personal data.",
    icon: "shield-checkmark-outline",
    color: "#00C851"
  },
  {
    title: "Earn Aura Points",
    subtitle: "Progressive Revelation",
    description: "Earn Aura through genuine connections and spend them to gradually unlock your match's details when you both agree.",
    icon: "sparkles",
    color: "#FFB800"
  },
  {
    title: "On-Chain Transparency",
    subtitle: "Blockchain Verified",
    description: "All matches and interactions are recorded on blockchain for fairness, while your personal data stays private.",
    icon: "link",
    color: "#4ECDC4"
  }
];

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const nextStep = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skip = () => {
    onComplete();
  };

  const currentStepData = onboardingSteps[currentStep];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.gradient}>
        {/* Skip Button */}
        <TouchableOpacity style={styles.skipButton} onPress={skip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>

        {/* Step Indicators */}
        <View style={styles.stepIndicators}>
          {onboardingSteps.map((_, index) => (
            <View
              key={index}
              style={[
                styles.stepDot,
                index === currentStep && styles.activeStepDot,
                index < currentStep && styles.completedStepDot
              ]}
            />
          ))}
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <LinearGradient
              colors={[currentStepData.color, currentStepData.color + '80']}
              style={styles.iconGradient}
            >
              <Ionicons 
                name={currentStepData.icon as any} 
                size={60} 
                color="#FFFFFF" 
              />
            </LinearGradient>
          </View>

          <ThemedText style={styles.title}>{currentStepData.title}</ThemedText>
          <ThemedText style={styles.subtitle}>{currentStepData.subtitle}</ThemedText>
          <ThemedText style={styles.description}>{currentStepData.description}</ThemedText>

          {/* Feature Highlights */}
          {currentStep === 0 && (
            <View style={styles.highlights}>
              <View style={styles.highlight}>
                <Ionicons name="eye-off" size={20} color="#00C851" />
                <Text style={styles.highlightText}>Anonymous until you unlock</Text>
              </View>
              <View style={styles.highlight}>
                <Ionicons name="shield-checkmark" size={20} color="#00C851" />
                <Text style={styles.highlightText}>Zero-knowledge verified</Text>
              </View>
              <View style={styles.highlight}>
                <Ionicons name="heart" size={20} color="#FF6B35" />
                <Text style={styles.highlightText}>Meaningful connections</Text>
              </View>
            </View>
          )}

          {currentStep === 1 && (
            <View style={styles.highlights}>
              <View style={styles.highlight}>
                <Ionicons name="location" size={20} color="#4ECDC4" />
                <Text style={styles.highlightText}>Same city matching</Text>
              </View>
              <View style={styles.highlight}>
                <Ionicons name="heart-outline" size={20} color="#FF6B35" />
                <Text style={styles.highlightText}>Shared hobby verification</Text>
              </View>
              <View style={styles.highlight}>
                <Ionicons name="lock-closed" size={20} color="#00C851" />
                <Text style={styles.highlightText}>Data never revealed</Text>
              </View>
            </View>
          )}

          {currentStep === 2 && (
            <View style={styles.auraExample}>
              <View style={styles.auraItem}>
                <Text style={styles.auraAction}>Create Profile</Text>
                <Text style={styles.auraPoints}>+100 ⚡</Text>
              </View>
              <View style={styles.auraItem}>
                <Text style={styles.auraAction}>Mutual Match</Text>
                <Text style={styles.auraPoints}>+50 ⚡</Text>
              </View>
              <View style={styles.auraDivider} />
              <View style={styles.auraItem}>
                <Text style={styles.auraAction}>Unlock Name</Text>
                <Text style={styles.auraSpend}>-20 ⚡</Text>
              </View>
              <View style={styles.auraItem}>
                <Text style={styles.auraAction}>Unlock Chat</Text>
                <Text style={styles.auraSpend}>-80 ⚡</Text>
              </View>
            </View>
          )}
        </View>

        {/* Navigation */}
        <View style={styles.navigation}>
          {currentStep > 0 && (
            <TouchableOpacity style={styles.backButton} onPress={prevStep}>
              <Ionicons name="arrow-back" size={20} color="#333333" />
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.nextButton} onPress={nextStep}>
            <Text style={styles.nextButtonText}>
              {currentStep === onboardingSteps.length - 1 ? "Get Started" : "Next"}
            </Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Privacy Notice */}
        <View style={styles.privacyNotice}>
          <Ionicons name="shield-checkmark" size={16} color="#00C851" />
          <Text style={styles.privacyText}>
            Your privacy is protected by zero-knowledge cryptography
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 1,
    padding: 10,
  },
  skipText: {
    color: '#666666',
    fontSize: 16,
    opacity: 0.7,
  },
  stepIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 80,
    marginBottom: 40,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    marginHorizontal: 6,
  },
  activeStepDot: {
    backgroundColor: '#FF6B35',
    width: 24,
  },
  completedStepDot: {
    backgroundColor: '#00C851',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  iconContainer: {
    marginBottom: 40,
  },
  iconGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.8,
    textAlign: 'center',
    marginBottom: 20,
    color: '#FF6B35',
    fontWeight: '600',
  },
  description: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  highlights: {
    width: '100%',
    marginTop: 20,
  },
  highlight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  highlightText: {
    color: '#333333',
    fontSize: 14,
    marginLeft: 12,
    opacity: 0.8,
  },
  auraExample: {
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
  },
  auraItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  auraAction: {
    color: '#333333',
    fontSize: 14,
    fontWeight: '500',
  },
  auraPoints: {
    color: '#00C851',
    fontSize: 14,
    fontWeight: 'bold',
  },
  auraSpend: {
    color: '#FF6B35',
    fontSize: 14,
    fontWeight: 'bold',
  },
  auraDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 10,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 40,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.2)',
  },
  backButtonText: {
    color: '#333333',
    fontSize: 16,
    marginLeft: 8,
    fontWeight: '600',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: '#FF6B35',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  privacyNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 20,
  },
  privacyText: {
    color: '#666666',
    fontSize: 12,
    opacity: 0.8,
    marginLeft: 8,
  },
});
