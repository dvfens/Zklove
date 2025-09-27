import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanGestureHandler,
  State,
  Dimensions,
  Alert,
} from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import AnonymousCard from './AnonymousCard';
import type { AnonymousCard as AnonymousCardType, DatingProfile } from '@/types/dating';

const { width, height } = Dimensions.get('window');
const SWIPE_THRESHOLD = width * 0.3;

interface SwipeDeckProps {
  candidates: AnonymousCardType[];
  onSwipe: (targetId: string, isLike: boolean) => void;
  userProfile: DatingProfile;
}

export default function SwipeDeck({ candidates, onSwipe, userProfile }: SwipeDeckProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const handleSwipeGesture = (event: any) => {
    const { translationX, translationY } = event.nativeEvent;
    
    translateX.setValue(translationX);
    translateY.setValue(translationY);
    
    // Rotate based on horizontal movement
    const rotation = translationX / width * 30; // Max 30 degrees
    rotate.setValue(rotation);
    
    // Fade out as card moves away
    const distance = Math.sqrt(translationX * translationX + translationY * translationY);
    const maxDistance = width;
    const newOpacity = 1 - (distance / maxDistance) * 0.5;
    opacity.setValue(Math.max(0.5, newOpacity));
  };

  const handleSwipeEnd = (event: any) => {
    const { translationX, velocityX } = event.nativeEvent;
    
    // Determine if swipe was strong enough
    const shouldSwipe = Math.abs(translationX) > SWIPE_THRESHOLD || Math.abs(velocityX) > 1000;
    
    if (shouldSwipe) {
      const isLike = translationX > 0;
      performSwipe(isLike);
    } else {
      // Snap back to center
      Animated.parallel([
        Animated.spring(translateX, { toValue: 0, useNativeDriver: true }),
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true }),
        Animated.spring(rotate, { toValue: 0, useNativeDriver: true }),
        Animated.spring(opacity, { toValue: 1, useNativeDriver: true }),
      ]).start();
    }
  };

  const performSwipe = (isLike: boolean) => {
    const currentCard = candidates[currentIndex];
    if (!currentCard) return;

    // Animate card off screen
    const exitX = isLike ? width * 1.5 : -width * 1.5;
    const exitY = isLike ? -height * 0.3 : height * 0.3;
    
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: exitX,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: exitY,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Reset animations and move to next card
      translateX.setValue(0);
      translateY.setValue(0);
      rotate.setValue(0);
      opacity.setValue(1);
      
      // Call swipe handler
      onSwipe(currentCard.id, isLike);
      
      // Move to next card
      setCurrentIndex(prev => prev + 1);
    });
  };

  const handleCardSwipe = (direction: 'left' | 'right') => {
    performSwipe(direction === 'right');
  };

  const renderCard = (card: AnonymousCardType, index: number) => {
    const isCurrentCard = index === currentIndex;
    const isNextCard = index === currentIndex + 1;
    
    if (!isCurrentCard && !isNextCard) {
      return null;
    }

    const cardStyle = isCurrentCard
      ? {
          transform: [
            { translateX },
            { translateY },
            { rotate: rotate.interpolate({
                inputRange: [-1, 1],
                outputRange: ['-30deg', '30deg'],
              })
            },
          ],
          opacity,
          zIndex: 2,
        }
      : {
          transform: [{ scale: 0.95 }],
          opacity: 0.8,
          zIndex: 1,
        };

    return (
      <Animated.View key={card.id} style={[styles.cardContainer, cardStyle]}>
        {isCurrentCard ? (
          <PanGestureHandler
            onGestureEvent={handleSwipeGesture}
            onHandlerStateChange={(event) => {
              if (event.nativeEvent.state === State.END) {
                handleSwipeEnd(event);
              }
            }}
          >
            <Animated.View>
              <AnonymousCard card={card} onSwipe={handleCardSwipe} />
            </Animated.View>
          </PanGestureHandler>
        ) : (
          <AnonymousCard card={card} />
        )}
      </Animated.View>
    );
  };

  const renderSwipeIndicators = () => {
    const currentCard = candidates[currentIndex];
    if (!currentCard) return null;

    return (
      <>
        {/* Like Indicator */}
        <Animated.View
          style={[
            styles.swipeIndicator,
            styles.likeIndicator,
            {
              opacity: translateX.interpolate({
                inputRange: [0, SWIPE_THRESHOLD],
                outputRange: [0, 1],
                extrapolate: 'clamp',
              }),
              transform: [
                {
                  rotate: translateX.interpolate({
                    inputRange: [0, SWIPE_THRESHOLD],
                    outputRange: ['0deg', '-20deg'],
                    extrapolate: 'clamp',
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.indicatorText}>LIKE</Text>
        </Animated.View>

        {/* Pass Indicator */}
        <Animated.View
          style={[
            styles.swipeIndicator,
            styles.passIndicator,
            {
              opacity: translateX.interpolate({
                inputRange: [-SWIPE_THRESHOLD, 0],
                outputRange: [1, 0],
                extrapolate: 'clamp',
              }),
              transform: [
                {
                  rotate: translateX.interpolate({
                    inputRange: [-SWIPE_THRESHOLD, 0],
                    outputRange: ['20deg', '0deg'],
                    extrapolate: 'clamp',
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.indicatorText}>PASS</Text>
        </Animated.View>
      </>
    );
  };

  const renderEmptyState = () => (
    <ThemedView style={styles.emptyContainer}>
      <Ionicons name="heart-outline" size={80} color="#666" />
      <ThemedText style={styles.emptyTitle}>No More Profiles</ThemedText>
      <ThemedText style={styles.emptyText}>
        Check back later for new compatible matches in your area!
      </ThemedText>
      <View style={styles.emptyStats}>
        <ThemedText style={styles.statsText}>
          Your current aura: {userProfile.auraBalance}
        </ThemedText>
        <ThemedText style={styles.statsText}>
          Total matches: {userProfile.totalMatches}
        </ThemedText>
      </View>
    </ThemedView>
  );

  if (currentIndex >= candidates.length) {
    return renderEmptyState();
  }

  return (
    <View style={styles.container}>
      {/* Instructions */}
      <View style={styles.instructionsContainer}>
        <ThemedText style={styles.instructionsText}>
          Swipe right to like • Swipe left to pass
        </ThemedText>
        <ThemedText style={styles.zkText}>
          🔒 All compatibility verified with zero-knowledge proofs
        </ThemedText>
      </View>

      {/* Card Stack */}
      <View style={styles.cardStack}>
        {candidates.slice(currentIndex, currentIndex + 2).map((card, index) =>
          renderCard(card, currentIndex + index)
        )}
        {renderSwipeIndicators()}
      </View>

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${((currentIndex + 1) / candidates.length) * 100}%` },
            ]}
          />
        </View>
        <ThemedText style={styles.progressText}>
          {currentIndex + 1} of {candidates.length}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  instructionsContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  instructionsText: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.8,
    marginBottom: 5,
  },
  zkText: {
    fontSize: 12,
    opacity: 0.6,
    textAlign: 'center',
  },
  cardStack: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  swipeIndicator: {
    position: 'absolute',
    top: '30%',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 3,
  },
  likeIndicator: {
    right: 50,
    borderColor: '#00C851',
    backgroundColor: 'rgba(0, 200, 81, 0.1)',
  },
  passIndicator: {
    left: 50,
    borderColor: '#FF4444',
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
  },
  indicatorText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  progressContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  progressBar: {
    width: '60%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF6B35',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    opacity: 0.7,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 24,
    marginBottom: 30,
  },
  emptyStats: {
    alignItems: 'center',
  },
  statsText: {
    fontSize: 14,
    opacity: 0.6,
    marginBottom: 5,
  },
});
