import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import ZKDatingService from '@/services/ZKDatingService';
import ZKProofService from '@/services/ZKProofService';
import type { DatingProfile, Hobby } from '@/types/dating';

const { width } = Dimensions.get('window');

interface ProfileSetupProps {
  profile?: DatingProfile | null;
  onComplete: (profile: DatingProfile) => void;
}

const AVAILABLE_HOBBIES: Hobby[] = [
  'music', 'fitness', 'art', 'coding', 'gaming', 'travel', 'food',
  'reading', 'movies', 'sports', 'photography', 'cooking', 'dancing', 'hiking', 'yoga'
];

export default function ProfileSetup({ profile, onComplete }: ProfileSetupProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  
  // Form state
  const [name, setName] = useState(profile?.name || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [city, setCity] = useState(profile?.city || '');
  const [age, setAge] = useState(profile?.age?.toString() || '');
  const [minAge, setMinAge] = useState(profile?.minAge?.toString() || '18');
  const [maxAge, setMaxAge] = useState(profile?.maxAge?.toString() || '35');
  const [selectedHobbies, setSelectedHobbies] = useState<Hobby[]>(profile?.hobbies || []);
  const [avatarUri, setAvatarUri] = useState(profile?.avatarUri || '');

  const zkDatingService = ZKDatingService.getInstance();
  const zkProofService = ZKProofService.getInstance();

  const steps = [
    { title: 'Basic Info', icon: 'person' },
    { title: 'Location', icon: 'location' },
    { title: 'Interests', icon: 'heart' },
    { title: 'Preferences', icon: 'settings' },
    { title: 'Privacy', icon: 'shield-checkmark' }
  ];

  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'We need camera roll permissions to let you select a profile picture.'
      );
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setAvatarUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  const toggleHobby = (hobby: Hobby) => {
    setSelectedHobbies(prev => {
      if (prev.includes(hobby)) {
        return prev.filter(h => h !== hobby);
      } else if (prev.length < 5) {
        return [...prev, hobby];
      } else {
        Alert.alert('Limit Reached', 'You can select up to 5 hobbies.');
        return prev;
      }
    });
  };

  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case 0: // Basic Info
        if (!name.trim()) {
          Alert.alert('Required Field', 'Please enter your name.');
          return false;
        }
        if (!bio.trim()) {
          Alert.alert('Required Field', 'Please write a short bio.');
          return false;
        }
        if (!age || parseInt(age) < 18 || parseInt(age) > 100) {
          Alert.alert('Invalid Age', 'Please enter a valid age (18-100).');
          return false;
        }
        return true;

      case 1: // Location
        if (!city.trim()) {
          Alert.alert('Required Field', 'Please enter your city.');
          return false;
        }
        return true;

      case 2: // Interests
        if (selectedHobbies.length === 0) {
          Alert.alert('Required Selection', 'Please select at least one hobby.');
          return false;
        }
        return true;

      case 3: // Preferences
        const minAgeNum = parseInt(minAge);
        const maxAgeNum = parseInt(maxAge);
        if (minAgeNum < 18 || maxAgeNum > 100 || minAgeNum >= maxAgeNum) {
          Alert.alert('Invalid Range', 'Please enter a valid age range.');
          return false;
        }
        return true;

      case 4: // Privacy - always valid
        return true;

      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateCurrentStep()) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);

      // Create profile data
      const profileData: Partial<DatingProfile> = {
        name: name.trim(),
        bio: bio.trim(),
        city: city.trim(),
        age: parseInt(age),
        minAge: parseInt(minAge),
        maxAge: parseInt(maxAge),
        hobbies: selectedHobbies,
        avatarUri,
        coordinates: { lat: 0, lng: 0 }, // Would be populated by geocoding in production
      };

      console.log('Generating ZK proofs for profile...');

      // Generate ZK proofs and commitments
      const salt1 = Math.random().toString();
      const salt2 = Math.random().toString();
      const salt3 = Math.random().toString();

      const profileCommitment = await zkProofService.generateProfileCommitmentProof(
        profileData.name!,
        profileData.bio!,
        profileData.avatarUri || '',
        profileData.age!,
        salt1
      );

      const locationCommitment = await zkProofService.generateLocationCommitmentProof(
        profileData.city!,
        profileData.coordinates!,
        salt2
      );

      const hobbiesCommitment = await zkProofService.generateHobbiesCommitmentProof(
        profileData.hobbies!,
        salt3
      );

      // Create nullifier hash (simplified - in production use proper identity verification)
      const nullifierHash = `0x${Math.random().toString(16).substr(2, 64)}`;

      const completeProfile: DatingProfile = {
        ...profileData as Required<Omit<DatingProfile, 'commitments' | 'auraBalance' | 'totalMatches' | 'successfulChats' | 'isActive' | 'createdAt' | 'lastActiveAt' | 'profileProof' | 'locationProof' | 'hobbiesProof'>>,
        commitments: {
          profileCommitment: profileCommitment.commitment,
          locationCommitment: locationCommitment.commitment,
          hobbiesCommitment: hobbiesCommitment.commitment,
          ageCommitment: `0x${Math.random().toString(16).substr(2, 64)}`, // Simplified
          nullifierHash,
        },
        auraBalance: 100,
        totalMatches: 0,
        successfulChats: 0,
        isActive: true,
        createdAt: Date.now(),
        lastActiveAt: Date.now(),
        profileProof: profileCommitment.proof,
        locationProof: locationCommitment.proof,
        hobbiesProof: hobbiesCommitment.proof,
      };

      if (!profile) {
        // Create new profile on blockchain
        console.log('Creating profile on blockchain...');
        await zkDatingService.createProfile(completeProfile);
      }

      console.log('Profile setup complete!');
      onComplete(completeProfile);

    } catch (error) {
      console.error('Profile setup failed:', error);
      Alert.alert(
        'Setup Failed',
        'Failed to create your dating profile. Please check your connection and try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {steps.map((step, index) => (
        <View key={index} style={styles.stepItem}>
          <View style={[
            styles.stepCircle,
            index === currentStep && styles.activeStepCircle,
            index < currentStep && styles.completedStepCircle
          ]}>
            <Ionicons
              name={step.icon as any}
              size={16}
              color={index <= currentStep ? '#FFFFFF' : '#666'}
            />
          </View>
          <Text style={[
            styles.stepText,
            index === currentStep && styles.activeStepText
          ]}>
            {step.title}
          </Text>
        </View>
      ))}
    </View>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <View style={styles.stepContent}>
            <ThemedText style={styles.stepTitle}>Tell us about yourself</ThemedText>
            
            <TouchableOpacity style={styles.avatarContainer} onPress={pickImage}>
              {avatarUri ? (
                <View style={styles.avatarPreview}>
                  <Text>📷</Text>
                </View>
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="camera" size={40} color="#666" />
                  <Text style={styles.avatarText}>Add Photo</Text>
                </View>
              )}
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              placeholder="Your name (will be hidden until unlocked)"
              value={name}
              onChangeText={setName}
              maxLength={50}
              placeholderTextColor="#666"
            />

            <TextInput
              style={styles.input}
              placeholder="Your age"
              value={age}
              onChangeText={setAge}
              keyboardType="numeric"
              maxLength={3}
              placeholderTextColor="#666"
            />

            <TextInput
              style={[styles.input, styles.bioInput]}
              placeholder="Write a short bio about yourself..."
              value={bio}
              onChangeText={setBio}
              multiline
              maxLength={200}
              placeholderTextColor="#666"
            />
          </View>
        );

      case 1:
        return (
          <View style={styles.stepContent}>
            <ThemedText style={styles.stepTitle}>Where are you located?</ThemedText>
            <ThemedText style={styles.stepDescription}>
              We'll only match you with people in your city for safety and convenience.
            </ThemedText>

            <TextInput
              style={styles.input}
              placeholder="Your city (e.g., San Francisco)"
              value={city}
              onChangeText={setCity}
              maxLength={100}
              placeholderTextColor="#666"
            />

            <View style={styles.privacyNote}>
              <Ionicons name="shield-checkmark" size={20} color="#00C851" />
              <Text style={styles.privacyText}>
                Your exact location is never shared. We only verify city-level matches using zero-knowledge proofs.
              </Text>
            </View>
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContent}>
            <ThemedText style={styles.stepTitle}>What are your interests?</ThemedText>
            <ThemedText style={styles.stepDescription}>
              Select up to 5 hobbies. We'll match you with people who share your interests.
            </ThemedText>

            <View style={styles.hobbiesContainer}>
              {AVAILABLE_HOBBIES.map((hobby) => (
                <TouchableOpacity
                  key={hobby}
                  style={[
                    styles.hobbyChip,
                    selectedHobbies.includes(hobby) && styles.selectedHobbyChip
                  ]}
                  onPress={() => toggleHobby(hobby)}
                >
                  <Text style={[
                    styles.hobbyText,
                    selectedHobbies.includes(hobby) && styles.selectedHobbyText
                  ]}>
                    {hobby}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.selectionCount}>
              {selectedHobbies.length}/5 selected
            </Text>
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContent}>
            <ThemedText style={styles.stepTitle}>Age preferences</ThemedText>
            <ThemedText style={styles.stepDescription}>
              Set your preferred age range for matches.
            </ThemedText>

            <View style={styles.ageRangeContainer}>
              <View style={styles.ageInputContainer}>
                <Text style={styles.ageLabel}>Min Age</Text>
                <TextInput
                  style={styles.ageInput}
                  value={minAge}
                  onChangeText={setMinAge}
                  keyboardType="numeric"
                  maxLength={2}
                  placeholderTextColor="#666"
                />
              </View>

              <Text style={styles.ageSeparator}>to</Text>

              <View style={styles.ageInputContainer}>
                <Text style={styles.ageLabel}>Max Age</Text>
                <TextInput
                  style={styles.ageInput}
                  value={maxAge}
                  onChangeText={setMaxAge}
                  keyboardType="numeric"
                  maxLength={2}
                  placeholderTextColor="#666"
                />
              </View>
            </View>
          </View>
        );

      case 4:
        return (
          <View style={styles.stepContent}>
            <ThemedText style={styles.stepTitle}>Privacy & Security</ThemedText>
            <ThemedText style={styles.stepDescription}>
              Your profile is protected by zero-knowledge cryptography.
            </ThemedText>

            <View style={styles.privacyFeatures}>
              <View style={styles.privacyFeature}>
                <Ionicons name="eye-off" size={24} color="#00C851" />
                <View style={styles.privacyFeatureContent}>
                  <Text style={styles.privacyFeatureTitle}>Anonymous Matching</Text>
                  <Text style={styles.privacyFeatureText}>
                    Your name and photos are hidden until both users unlock them
                  </Text>
                </View>
              </View>

              <View style={styles.privacyFeature}>
                <Ionicons name="shield-checkmark" size={24} color="#00C851" />
                <View style={styles.privacyFeatureContent}>
                  <Text style={styles.privacyFeatureTitle}>Zero-Knowledge Proofs</Text>
                  <Text style={styles.privacyFeatureText}>
                    Compatibility is verified without revealing your personal data
                  </Text>
                </View>
              </View>

              <View style={styles.privacyFeature}>
                <Ionicons name="link" size={24} color="#00C851" />
                <View style={styles.privacyFeatureContent}>
                  <Text style={styles.privacyFeatureTitle}>On-Chain Security</Text>
                  <Text style={styles.privacyFeatureText}>
                    All interactions are recorded on blockchain for transparency
                  </Text>
                </View>
              </View>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
        <ThemedText style={styles.loadingText}>
          {profile ? 'Updating Profile...' : 'Creating Profile...'}
        </ThemedText>
        <ThemedText style={styles.loadingSubtext}>
          Generating zero-knowledge proofs and commitments
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        style={styles.gradient}
      >
        {renderStepIndicator()}
        
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {renderStep()}
        </ScrollView>

        <View style={styles.buttonContainer}>
          {currentStep > 0 && (
            <TouchableOpacity style={styles.backButton} onPress={prevStep}>
              <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.nextButton} onPress={nextStep}>
            <Text style={styles.nextButtonText}>
              {currentStep === steps.length - 1 ? (profile ? 'Update Profile' : 'Create Profile') : 'Next'}
            </Text>
            {currentStep < steps.length - 1 && (
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    textAlign: 'center',
  },
  loadingSubtext: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 10,
    textAlign: 'center',
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  stepItem: {
    alignItems: 'center',
    flex: 1,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  activeStepCircle: {
    backgroundColor: '#FF6B35',
  },
  completedStepCircle: {
    backgroundColor: '#00C851',
  },
  stepText: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
  activeStepText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  stepContent: {
    flex: 1,
    paddingBottom: 100,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  stepDescription: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  avatarContainer: {
    alignSelf: 'center',
    marginBottom: 30,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#666',
    borderStyle: 'dashed',
  },
  avatarPreview: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#666',
    fontSize: 12,
    marginTop: 5,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  bioInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 200, 81, 0.1)',
    padding: 15,
    borderRadius: 12,
    marginTop: 20,
  },
  privacyText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginLeft: 10,
    flex: 1,
    lineHeight: 18,
  },
  hobbiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  hobbyChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    margin: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  selectedHobbyChip: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  hobbyText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  selectedHobbyText: {
    fontWeight: 'bold',
  },
  selectionCount: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
  },
  ageRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  ageInputContainer: {
    alignItems: 'center',
  },
  ageLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 10,
  },
  ageInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    width: 80,
    textAlign: 'center',
  },
  ageSeparator: {
    color: '#FFFFFF',
    fontSize: 16,
    marginHorizontal: 20,
  },
  privacyFeatures: {
    marginTop: 20,
  },
  privacyFeature: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  privacyFeatureContent: {
    flex: 1,
    marginLeft: 15,
  },
  privacyFeatureTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  privacyFeatureText: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.7,
    lineHeight: 18,
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 20,
  },
  backButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginRight: 10,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 5,
  },
  nextButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 12,
    backgroundColor: '#FF6B35',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 5,
  },
});
