import type { AnonymousCard as AnonymousCardType } from '@/types/dating';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;
const CARD_HEIGHT = CARD_WIDTH * 1.4;

interface AnonymousCardProps {
  card: AnonymousCardType;
  onSwipe?: (direction: 'left' | 'right') => void;
}

export default function AnonymousCard({ card, onSwipe }: AnonymousCardProps) {
  const getCompatibilityColor = (score: number) => {
    if (score >= 80) return '#00C851';
    if (score >= 60) return '#FFB800';
    return '#FF4444';
  };

  const getCompatibilityLabel = (score: number) => {
    if (score >= 80) return 'Excellent Match';
    if (score >= 60) return 'Good Match';
    return 'Fair Match';
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1a1a2e', '#16213e']}
        style={styles.card}
      >
        {/* Privacy Shield */}
        <View style={styles.privacyBadge}>
          <Ionicons name="shield-checkmark" size={16} color="#00C851" />
          <Text style={styles.privacyText}>ZK Protected</Text>
        </View>

        {/* Anonymous Avatar */}
        <View style={styles.avatarContainer}>
          <BlurView intensity={80} style={styles.avatarBlur}>
            <Ionicons name="person" size={80} color="#FFFFFF" opacity={0.3} />
          </BlurView>
          <Text style={styles.anonymousText}>Identity Hidden</Text>
        </View>

        {/* Compatibility Score */}
        <View style={styles.scoreContainer}>
          <LinearGradient
            colors={[getCompatibilityColor(card.compatibilityScore), getCompatibilityColor(card.compatibilityScore) + '80']}
            style={styles.scoreCircle}
          >
            <Text style={styles.scoreText}>{card.compatibilityScore}</Text>
            <Text style={styles.scoreLabel}>%</Text>
          </LinearGradient>
          <Text style={[styles.matchLabel, { color: getCompatibilityColor(card.compatibilityScore) }]}>
            {getCompatibilityLabel(card.compatibilityScore)}
          </Text>
        </View>

        {/* Verified Compatibility Info */}
        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <Ionicons name="location" size={20} color="#00C851" />
            <Text style={styles.infoText}>Same City</Text>
            <Ionicons name="checkmark-circle" size={16} color="#00C851" />
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="heart" size={20} color="#FF6B35" />
            <Text style={styles.infoText}>
              {card.sharedHobbyCount} Shared {card.sharedHobbyCount === 1 ? 'Hobby' : 'Hobbies'}
            </Text>
            <Ionicons name="checkmark-circle" size={16} color="#00C851" />
          </View>

          {card.estimatedAge && (
            <View style={styles.infoRow}>
              <Ionicons name="calendar" size={20} color="#4ECDC4" />
              <Text style={styles.infoText}>Age: {card.estimatedAge}</Text>
              <Ionicons name="eye-off" size={16} color="#666" />
            </View>
          )}
        </View>

        {/* Unlock Tiers */}
        <View style={styles.unlockContainer}>
          <Text style={styles.unlockTitle}>Unlock with Aura</Text>
          <View style={styles.unlockTiers}>
            <View style={styles.unlockTier}>
              <Text style={styles.unlockTierText}>Name</Text>
              <Text style={styles.unlockCost}>{card.auraRequiredToUnlock.basic}</Text>
            </View>
            <View style={styles.unlockTier}>
              <Text style={styles.unlockTierText}>Bio</Text>
              <Text style={styles.unlockCost}>{card.auraRequiredToUnlock.bio}</Text>
            </View>
            <View style={styles.unlockTier}>
              <Text style={styles.unlockTierText}>Photo</Text>
              <Text style={styles.unlockCost}>{card.auraRequiredToUnlock.avatar}</Text>
            </View>
            <View style={styles.unlockTier}>
              <Text style={styles.unlockTierText}>Chat</Text>
              <Text style={styles.unlockCost}>{card.auraRequiredToUnlock.contact}</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.passButton]}
            onPress={() => onSwipe?.('left')}
          >
            <Ionicons name="close" size={30} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.likeButton]}
            onPress={() => onSwipe?.('right')}
          >
            <Ionicons name="heart" size={30} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* ZK Proof Indicator */}
        <View style={styles.zkIndicator}>
          <Text style={styles.zkText}>
            Compatibility verified with zero-knowledge proofs
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    alignSelf: 'center',
  },
  card: {
    flex: 1,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  privacyBadge: {
    position: 'absolute',
    top: 15,
    right: 15,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 200, 81, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  privacyText: {
    color: '#00C851',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  avatarContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  avatarBlur: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  anonymousText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginTop: 10,
    opacity: 0.7,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  scoreCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  scoreLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    opacity: 0.8,
  },
  matchLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
  },
  infoContainer: {
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 10,
  },
  infoText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginLeft: 10,
    flex: 1,
  },
  unlockContainer: {
    marginBottom: 20,
  },
  unlockTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  unlockTiers: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  unlockTier: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 8,
    minWidth: 60,
  },
  unlockTierText: {
    color: '#FFFFFF',
    fontSize: 10,
    marginBottom: 4,
  },
  unlockCost: {
    color: '#FF6B35',
    fontSize: 12,
    fontWeight: 'bold',
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 'auto',
    paddingHorizontal: 20,
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  passButton: {
    backgroundColor: '#FF4444',
  },
  likeButton: {
    backgroundColor: '#00C851',
  },
  zkIndicator: {
    position: 'absolute',
    bottom: 10,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  zkText: {
    color: '#FFFFFF',
    fontSize: 10,
    opacity: 0.6,
    textAlign: 'center',
  },
});
