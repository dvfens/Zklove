import { ThemedText } from '@/components/themed-text';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Alert,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';

interface ComingSoonCardProps {
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  onPress?: () => void;
  estimatedRelease?: string;
  features?: string[];
}

export default function ComingSoonCard({
  title,
  description,
  icon,
  iconColor,
  onPress,
  estimatedRelease = "Soon",
  features = []
}: ComingSoonCardProps) {
  
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      // Default coming soon alert
      Alert.alert(
        '🚀 Coming Soon!',
        `${title} is currently under development and will be available ${estimatedRelease.toLowerCase()}. Stay tuned for updates!`,
        [
          { 
            text: 'Notify Me', 
            onPress: () => {
              Alert.alert(
                '📧 Notification Set!',
                `We'll notify you when ${title} is ready. Thank you for your interest!`,
                [{ text: 'OK' }]
              );
            }
          },
          { text: 'OK' }
        ]
      );
    }
  };

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name={icon} size={24} color={iconColor} />
        </View>
        <View style={styles.textContainer}>
          <ThemedText style={styles.title}>{title}</ThemedText>
          <ThemedText style={styles.description}>{description}</ThemedText>
          
          {features.length > 0 && (
            <View style={styles.featuresContainer}>
              {features.slice(0, 2).map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <View style={styles.featureDot} />
                  <ThemedText style={styles.featureText}>{feature}</ThemedText>
                </View>
              ))}
              {features.length > 2 && (
                <ThemedText style={styles.moreFeatures}>
                  +{features.length - 2} more features
                </ThemedText>
              )}
            </View>
          )}
        </View>
        
        <View style={styles.badgeContainer}>
          <View style={styles.comingSoonBadge}>
            <ThemedText style={styles.comingSoonText}>Coming {estimatedRelease}</ThemedText>
          </View>
        </View>
      </View>
      
      {/* Shimmer effect overlay */}
      <View style={styles.shimmerOverlay}>
        <View style={styles.shimmer} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 184, 0, 0.05)',
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#FFB800',
    opacity: 0.8,
    overflow: 'hidden',
    position: 'relative',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    position: 'relative',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 184, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    paddingRight: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    opacity: 0.7,
    lineHeight: 18,
    marginBottom: 8,
  },
  featuresContainer: {
    marginTop: 4,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  featureDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFB800',
    marginRight: 6,
  },
  featureText: {
    fontSize: 12,
    opacity: 0.6,
  },
  moreFeatures: {
    fontSize: 12,
    opacity: 0.5,
    fontStyle: 'italic',
    marginTop: 2,
  },
  badgeContainer: {
    alignItems: 'flex-end',
  },
  comingSoonBadge: {
    backgroundColor: '#FFB800',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    shadowColor: '#FFB800',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  comingSoonText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#000',
  },
  shimmerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: -100,
    width: 100,
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    transform: [{ skewX: '-20deg' }],
  },
});
