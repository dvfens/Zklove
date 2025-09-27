import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import ZKDatingService from '@/services/ZKDatingService';
import type { AuraTransaction, Match } from '@/types/dating';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import AuraDisplay from './AuraDisplay';

const { width } = Dimensions.get('window');

export default function MatchesScreen() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [auraBalance, setAuraBalance] = useState(0);
  const [auraTransactions, setAuraTransactions] = useState<AuraTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [unlockedDetails, setUnlockedDetails] = useState<{[matchId: string]: string[]}>({});

  const zkDatingService = ZKDatingService.getInstance();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Load matches, aura balance, and transactions
      const [matchesData, balance, transactions] = await Promise.all([
        zkDatingService.getMatches(),
        zkDatingService.getAuraBalance(),
        zkDatingService.getAuraTransactions()
      ]);
      
      setMatches(matchesData);
      setAuraBalance(balance);
      setAuraTransactions(transactions);
    } catch (error) {
      console.error('Failed to load matches data:', error);
      Alert.alert('Error', 'Failed to load your matches. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleUnlockDetails = async (match: Match, tier: string, cost: number) => {
    if (auraBalance < cost) {
      Alert.alert(
        'Insufficient Aura',
        `You need ${cost} Aura to unlock ${tier} details. You currently have ${auraBalance} Aura.`,
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Unlock Details',
      `Spend ${cost} Aura to unlock ${tier} details?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unlock',
          onPress: async () => {
            try {
              const otherUser = match.user1 === zkDatingService.getUserAddress() ? match.user2 : match.user1;
              await zkDatingService.unlockDetails(otherUser, tier);
              
              // Update local state
              setAuraBalance(prev => prev - cost);
              setUnlockedDetails(prev => ({
                ...prev,
                [match.matchId]: [...(prev[match.matchId] || []), tier]
              }));
              
              Alert.alert('Success', `${tier} details unlocked!`);
            } catch (error) {
              console.error('Failed to unlock details:', error);
              Alert.alert('Error', 'Failed to unlock details. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handleUnlockChat = async (match: Match) => {
    const chatCost = 80;
    
    if (auraBalance < chatCost) {
      Alert.alert(
        'Insufficient Aura',
        `You need ${chatCost} Aura to unlock chat. You currently have ${auraBalance} Aura.`,
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Unlock Chat',
      `Spend ${chatCost} Aura to unlock chat with this match?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unlock',
          onPress: async () => {
            try {
              const otherUser = match.user1 === zkDatingService.getUserAddress() ? match.user2 : match.user1;
              await zkDatingService.unlockChat(otherUser);
              
              // Update local state
              setAuraBalance(prev => prev - chatCost);
              
              // Refresh matches to get updated chat status
              await loadData();
              
              Alert.alert('Success', 'Chat unlocked! You can now message each other.');
            } catch (error) {
              console.error('Failed to unlock chat:', error);
              Alert.alert('Error', 'Failed to unlock chat. Please try again.');
            }
          }
        }
      ]
    );
  };

  const renderMatchCard = (match: Match) => {
    const isUnlocked = unlockedDetails[match.matchId] || [];
    const currentUser = zkDatingService.getUserAddress();
    const otherUser = match.user1 === currentUser ? match.user2 : match.user1;

    return (
      <TouchableOpacity
        key={match.matchId}
        style={styles.matchCard}
        onPress={() => setSelectedMatch(match)}
      >
        <LinearGradient
          colors={['#1a1a2e', '#16213e']}
          style={styles.matchCardGradient}
        >
          {/* Match Header */}
          <View style={styles.matchHeader}>
            <View style={styles.matchInfo}>
              <BlurView intensity={80} style={styles.avatarBlur}>
                <Ionicons name="person" size={40} color="#FFFFFF" opacity={0.3} />
              </BlurView>
              <View style={styles.matchDetails}>
                <Text style={styles.matchTitle}>
                  {isUnlocked.includes('basic') ? 'Sarah' : 'Anonymous Match'}
                </Text>
                <Text style={styles.matchSubtitle}>
                  {match.compatibilityScore}% compatibility
                </Text>
              </View>
            </View>
            
            <View style={styles.matchStatus}>
              {match.chatUnlocked ? (
                <View style={styles.statusBadge}>
                  <Ionicons name="chatbubble" size={16} color="#00C851" />
                  <Text style={styles.statusText}>Chat Active</Text>
                </View>
              ) : (
                <View style={[styles.statusBadge, styles.pendingStatus]}>
                  <Ionicons name="lock-closed" size={16} color="#FFB800" />
                  <Text style={styles.statusText}>Locked</Text>
                </View>
              )}
            </View>
          </View>

          {/* Unlock Options */}
          <View style={styles.unlockOptions}>
            <TouchableOpacity
              style={[
                styles.unlockButton,
                isUnlocked.includes('basic') && styles.unlockedButton
              ]}
              onPress={() => !isUnlocked.includes('basic') && handleUnlockDetails(match, 'basic', 20)}
              disabled={isUnlocked.includes('basic')}
            >
              <Ionicons 
                name={isUnlocked.includes('basic') ? 'checkmark' : 'person'} 
                size={16} 
                color={isUnlocked.includes('basic') ? '#00C851' : '#FFFFFF'} 
              />
              <Text style={[
                styles.unlockButtonText,
                isUnlocked.includes('basic') && styles.unlockedButtonText
              ]}>
                {isUnlocked.includes('basic') ? 'Name' : '20 ⚡'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.unlockButton,
                isUnlocked.includes('bio') && styles.unlockedButton
              ]}
              onPress={() => !isUnlocked.includes('bio') && handleUnlockDetails(match, 'bio', 40)}
              disabled={isUnlocked.includes('bio')}
            >
              <Ionicons 
                name={isUnlocked.includes('bio') ? 'checkmark' : 'document-text'} 
                size={16} 
                color={isUnlocked.includes('bio') ? '#00C851' : '#FFFFFF'} 
              />
              <Text style={[
                styles.unlockButtonText,
                isUnlocked.includes('bio') && styles.unlockedButtonText
              ]}>
                {isUnlocked.includes('bio') ? 'Bio' : '40 ⚡'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.unlockButton,
                isUnlocked.includes('avatar') && styles.unlockedButton
              ]}
              onPress={() => !isUnlocked.includes('avatar') && handleUnlockDetails(match, 'avatar', 60)}
              disabled={isUnlocked.includes('avatar')}
            >
              <Ionicons 
                name={isUnlocked.includes('avatar') ? 'checkmark' : 'image'} 
                size={16} 
                color={isUnlocked.includes('avatar') ? '#00C851' : '#FFFFFF'} 
              />
              <Text style={[
                styles.unlockButtonText,
                isUnlocked.includes('avatar') && styles.unlockedButtonText
              ]}>
                {isUnlocked.includes('avatar') ? 'Photo' : '60 ⚡'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.unlockButton,
                styles.chatButton,
                match.chatUnlocked && styles.unlockedButton
              ]}
              onPress={() => !match.chatUnlocked && handleUnlockChat(match)}
              disabled={match.chatUnlocked}
            >
              <Ionicons 
                name={match.chatUnlocked ? 'chatbubble' : 'lock-closed'} 
                size={16} 
                color={match.chatUnlocked ? '#00C851' : '#FFFFFF'} 
              />
              <Text style={[
                styles.unlockButtonText,
                match.chatUnlocked && styles.unlockedButtonText
              ]}>
                {match.chatUnlocked ? 'Chat' : '80 ⚡'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Match Date */}
          <Text style={styles.matchDate}>
            Matched {new Date(match.matchedAt).toLocaleDateString()}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const renderAuraHistory = () => (
    <View style={styles.auraHistoryContainer}>
      <ThemedText style={styles.sectionTitle}>Aura History</ThemedText>
      
      {auraTransactions.slice(0, 5).map((transaction, index) => (
        <View key={index} style={styles.transactionItem}>
          <View style={styles.transactionIcon}>
            <Ionicons
              name={transaction.amount > 0 ? 'add-circle' : 'remove-circle'}
              size={20}
              color={transaction.amount > 0 ? '#00C851' : '#FF4444'}
            />
          </View>
          <View style={styles.transactionDetails}>
            <Text style={styles.transactionReason}>
              {transaction.reason.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Text>
            <Text style={styles.transactionDate}>
              {new Date(transaction.timestamp).toLocaleDateString()}
            </Text>
          </View>
          <Text style={[
            styles.transactionAmount,
            { color: transaction.amount > 0 ? '#00C851' : '#FF4444' }
          ]}>
            {transaction.amount > 0 ? '+' : ''}{transaction.amount}
          </Text>
        </View>
      ))}
    </View>
  );

  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
        <ThemedText style={styles.loadingText}>Loading your matches...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <ThemedText style={styles.headerTitle}>Your Matches</ThemedText>
          <ThemedText style={styles.headerSubtitle}>
            {matches.length} {matches.length === 1 ? 'match' : 'matches'}
          </ThemedText>
        </View>
        <AuraDisplay balance={auraBalance} size="large" />
      </View>

      {/* Matches List */}
      {matches.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-outline" size={60} color="#666" />
          <ThemedText style={styles.emptyTitle}>No Matches Yet</ThemedText>
          <ThemedText style={styles.emptyText}>
            Keep swiping to find compatible matches in your area!
          </ThemedText>
        </View>
      ) : (
        <View style={styles.matchesList}>
          {matches.map(renderMatchCard)}
        </View>
      )}

      {/* Aura History */}
      {auraTransactions.length > 0 && renderAuraHistory()}

      {/* Tips */}
      <View style={styles.tipsContainer}>
        <ThemedText style={styles.sectionTitle}>💡 Tips</ThemedText>
        <View style={styles.tip}>
          <Ionicons name="sparkles" size={20} color="#FF6B35" />
          <Text style={styles.tipText}>
            Earn more Aura by getting mutual matches and completing your profile
          </Text>
        </View>
        <View style={styles.tip}>
          <Ionicons name="shield-checkmark" size={20} color="#00C851" />
          <Text style={styles.tipText}>
            Your identity stays private until you both unlock details
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 20,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 5,
  },
  matchesList: {
    paddingHorizontal: 20,
  },
  matchCard: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  matchCardGradient: {
    padding: 20,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  matchInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarBlur: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginRight: 15,
  },
  matchDetails: {
    flex: 1,
  },
  matchTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  matchSubtitle: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.7,
  },
  matchStatus: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 200, 81, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  pendingStatus: {
    backgroundColor: 'rgba(255, 184, 0, 0.2)',
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    marginLeft: 5,
    fontWeight: 'bold',
  },
  unlockOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  unlockButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 2,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  chatButton: {
    backgroundColor: 'rgba(255, 107, 53, 0.2)',
    borderColor: '#FF6B35',
  },
  unlockedButton: {
    backgroundColor: 'rgba(0, 200, 81, 0.2)',
    borderColor: '#00C851',
  },
  unlockButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  unlockedButtonText: {
    color: '#00C851',
  },
  matchDate: {
    color: '#FFFFFF',
    fontSize: 12,
    opacity: 0.5,
    textAlign: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
    lineHeight: 22,
  },
  auraHistoryContainer: {
    paddingHorizontal: 20,
    marginTop: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  transactionIcon: {
    marginRight: 15,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionReason: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  transactionDate: {
    color: '#FFFFFF',
    fontSize: 12,
    opacity: 0.6,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  tipsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  tip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  tipText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginLeft: 10,
    flex: 1,
    lineHeight: 18,
    opacity: 0.8,
  },
});
