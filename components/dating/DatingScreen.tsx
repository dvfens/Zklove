import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import ZKDatingService from '@/services/ZKDatingService';
import ZKProofService from '@/services/ZKProofService';
import type { AnonymousCard, DatingProfile } from '@/types/dating';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import AuraDisplay from './AuraDisplay';
import MatchesScreen from './MatchesScreen';
import OnboardingScreen from './OnboardingScreen';
import ProfileSetup from './ProfileSetup';
import SwipeDeck from './SwipeDeck';

const { width, height } = Dimensions.get('window');

interface DatingScreenProps {
  onBack: () => void;
}

type TabType = 'discover' | 'matches' | 'profile';

export default function DatingScreen({ onBack }: DatingScreenProps) {
  const [currentTab, setCurrentTab] = useState<TabType>('discover');
  const [profile, setProfile] = useState<DatingProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [auraBalance, setAuraBalance] = useState(0);
  const [candidates, setCandidates] = useState<AnonymousCard[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const zkDatingService = ZKDatingService.getInstance();
  const zkProofService = ZKProofService.getInstance();

  useEffect(() => {
    initializeServices();
  }, []);

  const initializeServices = async () => {
    try {
      setIsLoading(true);
      
      // Check if user has seen onboarding
      const hasSeenOnboarding = false; // In production, check AsyncStorage
      if (!hasSeenOnboarding) {
        setShowOnboarding(true);
        setIsLoading(false);
        return;
      }
      
      // Initialize ZK Dating Service
      if (!zkDatingService.isInitialized()) {
        await zkDatingService.initialize();
      }
      
      // Connect wallet if not connected
      if (!zkDatingService.isConnected()) {
        await zkDatingService.connectWallet();
      }
      
      // Load user profile
      const userProfile = await zkDatingService.getProfile();
      setProfile(userProfile);
      
      if (userProfile) {
        // Load aura balance
        const balance = await zkDatingService.getAuraBalance();
        setAuraBalance(balance);
        
        // Load candidates
        await loadCandidates();
        
        // Subscribe to events
        await subscribeToEvents();
      }
      
      setIsInitialized(true);
    } catch (error) {
      console.error('Failed to initialize dating screen:', error);
      Alert.alert(
        'Initialization Error',
        'Failed to initialize the dating app. Please check your connection and try again.',
        [{ text: 'OK', onPress: onBack }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const subscribeToEvents = async () => {
    await zkDatingService.subscribeToEvents({
      onMatchCreated: (event) => {
        console.log('New match created:', event);
        Alert.alert('🎉 New Match!', 'You have a new match! Check your matches tab.');
        updateAuraBalance();
      },
      onAuraEarned: (event) => {
        console.log('Aura earned:', event);
        updateAuraBalance();
      },
      onChatUnlocked: (event) => {
        console.log('Chat unlocked:', event);
        Alert.alert('💬 Chat Unlocked!', 'You can now chat with your match!');
      }
    });
  };

  const updateAuraBalance = async () => {
    try {
      const balance = await zkDatingService.getAuraBalance();
      setAuraBalance(balance);
    } catch (error) {
      console.error('Failed to update aura balance:', error);
    }
  };

  const loadCandidates = async () => {
    try {
      // In a real app, this would fetch potential matches from the contract
      // For now, we'll generate mock candidates with more variety
      const mockCandidates: AnonymousCard[] = [
        {
          id: '0x1234567890123456789012345678901234567890',
          cityMatch: true,
          sharedHobbyCount: 3,
          compatibilityScore: 85,
          estimatedAge: '22-27',
          auraRequiredToUnlock: {
            basic: 20,
            bio: 40,
            avatar: 60,
            contact: 80
          }
        },
        {
          id: '0x2345678901234567890123456789012345678901',
          cityMatch: true,
          sharedHobbyCount: 2,
          compatibilityScore: 72,
          estimatedAge: '25-30',
          auraRequiredToUnlock: {
            basic: 20,
            bio: 40,
            avatar: 60,
            contact: 80
          }
        },
        {
          id: '0x3456789012345678901234567890123456789012',
          cityMatch: true,
          sharedHobbyCount: 4,
          compatibilityScore: 91,
          estimatedAge: '20-25',
          auraRequiredToUnlock: {
            basic: 20,
            bio: 40,
            avatar: 60,
            contact: 80
          }
        },
        {
          id: '0x4567890123456789012345678901234567890123',
          cityMatch: false,
          sharedHobbyCount: 1,
          compatibilityScore: 65,
          estimatedAge: '28-32',
          auraRequiredToUnlock: {
            basic: 25,
            bio: 50,
            avatar: 75,
            contact: 100
          }
        },
        {
          id: '0x5678901234567890123456789012345678901234',
          cityMatch: true,
          sharedHobbyCount: 5,
          compatibilityScore: 95,
          estimatedAge: '24-28',
          auraRequiredToUnlock: {
            basic: 15,
            bio: 30,
            avatar: 45,
            contact: 60
          }
        },
        {
          id: '0x6789012345678901234567890123456789012345',
          cityMatch: true,
          sharedHobbyCount: 2,
          compatibilityScore: 78,
          estimatedAge: '26-31',
          auraRequiredToUnlock: {
            basic: 20,
            bio: 40,
            avatar: 60,
            contact: 80
          }
        },
        {
          id: '0x7890123456789012345678901234567890123456',
          cityMatch: false,
          sharedHobbyCount: 3,
          compatibilityScore: 82,
          estimatedAge: '23-27',
          auraRequiredToUnlock: {
            basic: 20,
            bio: 40,
            avatar: 60,
            contact: 80
          }
        },
        {
          id: '0x8901234567890123456789012345678901234567',
          cityMatch: true,
          sharedHobbyCount: 1,
          compatibilityScore: 58,
          estimatedAge: '29-35',
          auraRequiredToUnlock: {
            basic: 30,
            bio: 60,
            avatar: 90,
            contact: 120
          }
        }
      ];
      
      setCandidates(mockCandidates);
    } catch (error) {
      console.error('Failed to load candidates:', error);
    }
  };

  const handleOnboardingComplete = async () => {
    setShowOnboarding(false);
    setIsLoading(true);
    
    try {
      // Initialize services after onboarding
      if (!zkDatingService.isInitialized()) {
        await zkDatingService.initialize();
      }
      
      if (!zkDatingService.isConnected()) {
        await zkDatingService.connectWallet();
      }
      
      // Load user profile
      const userProfile = await zkDatingService.getProfile();
      setProfile(userProfile);
      
      if (userProfile) {
        const balance = await zkDatingService.getAuraBalance();
        setAuraBalance(balance);
        await loadCandidates();
        await subscribeToEvents();
      }
      
      setIsInitialized(true);
    } catch (error) {
      console.error('Failed to initialize after onboarding:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwipe = async (targetId: string, isLike: boolean) => {
    if (!profile) return;
    
    try {
      console.log(`Swiping ${isLike ? 'right' : 'left'} on ${targetId}`);
      
      if (isLike) {
        // Generate compatibility proof for likes
        const targetProfile = await zkDatingService.getProfile(targetId);
        if (targetProfile && zkProofService.isCompatible(profile, targetProfile)) {
          const compatibilityProof = await zkProofService.generateCompatibilityProof(profile, targetProfile);
          
          await zkDatingService.swipeUser({
            targetUser: targetId,
            isLike: true,
            compatibilityProof,
            timestamp: Date.now()
          });
        } else {
          Alert.alert('Not Compatible', 'You can only like users in your city with shared hobbies.');
          return;
        }
      } else {
        // Simple pass without proof
        await zkDatingService.swipeUser({
          targetUser: targetId,
          isLike: false,
          timestamp: Date.now()
        });
      }
      
      // Remove candidate from deck
      setCandidates(prev => prev.filter(c => c.id !== targetId));
      
    } catch (error) {
      console.error('Failed to record swipe:', error);
      Alert.alert('Error', 'Failed to record your swipe. Please try again.');
    }
  };

  const renderTabContent = () => {
    if (!profile) {
      return <ProfileSetup onComplete={(newProfile) => setProfile(newProfile)} />;
    }

    switch (currentTab) {
      case 'discover':
        return (
          <SwipeDeck
            candidates={candidates}
            onSwipe={handleSwipe}
            userProfile={profile}
          />
        );
      case 'matches':
        return <MatchesScreen />;
      case 'profile':
        return <ProfileSetup profile={profile} onComplete={(updatedProfile) => setProfile(updatedProfile)} />;
      default:
        return null;
    }
  };

  // Show onboarding first
  if (showOnboarding) {
    return <OnboardingScreen onComplete={handleOnboardingComplete} />;
  }

  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
        <ThemedText style={styles.loadingText}>Initializing zkLove...</ThemedText>
        <ThemedText style={styles.loadingSubtext}>
          Setting up zero-knowledge proofs and blockchain connection
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#FF6B35', '#F7931E']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333333" />
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>zkLove</Text>
            <Text style={styles.headerSubtitle}>Privacy-First Dating</Text>
          </View>
          
          <AuraDisplay balance={auraBalance} />
        </View>

        {/* Tab Navigation */}
        {profile && (
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, currentTab === 'discover' && styles.activeTab]}
              onPress={() => setCurrentTab('discover')}
            >
              <Ionicons 
                name="heart" 
                size={20} 
                color={currentTab === 'discover' ? '#FF6B35' : '#666'} 
              />
              <Text style={[styles.tabText, currentTab === 'discover' && styles.activeTabText]}>
                Discover
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.tab, currentTab === 'matches' && styles.activeTab]}
              onPress={() => setCurrentTab('matches')}
            >
              <Ionicons 
                name="people" 
                size={20} 
                color={currentTab === 'matches' ? '#FF6B35' : '#666'} 
              />
              <Text style={[styles.tabText, currentTab === 'matches' && styles.activeTabText]}>
                Matches
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.tab, currentTab === 'profile' && styles.activeTab]}
              onPress={() => setCurrentTab('profile')}
            >
              <Ionicons 
                name="person" 
                size={20} 
                color={currentTab === 'profile' ? '#FF6B35' : '#666'} 
              />
              <Text style={[styles.tabText, currentTab === 'profile' && styles.activeTabText]}>
                Profile
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Main Content */}
        <View style={styles.content}>
          {renderTabContent()}
        </View>

        {/* Zero Knowledge Indicator */}
        <View style={styles.zkIndicator}>
          <Ionicons name="shield-checkmark" size={16} color="#00C851" />
          <Text style={styles.zkText}>Zero-Knowledge Protected</Text>
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
    backgroundColor: '#FFFFFF',
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 20,
    borderRadius: 15,
    padding: 5,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: 'rgba(255, 107, 53, 0.2)',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 5,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#FF6B35',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    marginTop: 20,
  },
  zkIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0, 200, 81, 0.1)',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 10,
  },
  zkText: {
    fontSize: 12,
    color: '#00C851',
    marginLeft: 5,
    fontWeight: '600',
  },
});
