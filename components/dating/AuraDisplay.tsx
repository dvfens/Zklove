import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface AuraDisplayProps {
  balance: number;
  showLabel?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export default function AuraDisplay({ balance, showLabel = true, size = 'medium' }: AuraDisplayProps) {
  const getStyles = () => {
    switch (size) {
      case 'small':
        return {
          container: styles.containerSmall,
          text: styles.textSmall,
          icon: 16,
        };
      case 'large':
        return {
          container: styles.containerLarge,
          text: styles.textLarge,
          icon: 28,
        };
      default:
        return {
          container: styles.containerMedium,
          text: styles.textMedium,
          icon: 20,
        };
    }
  };

  const styleSet = getStyles();

  return (
    <LinearGradient
      colors={['#FF6B35', '#F7931E']}
      style={[styles.gradient, styleSet.container]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <Ionicons name="sparkles" size={styleSet.icon} color="#FFFFFF" />
      <Text style={[styles.balanceText, styleSet.text]}>{balance}</Text>
      {showLabel && <Text style={styles.labelText}>Aura</Text>}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  containerSmall: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  containerMedium: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  containerLarge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  balanceText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 6,
  },
  textSmall: {
    fontSize: 12,
  },
  textMedium: {
    fontSize: 14,
  },
  textLarge: {
    fontSize: 18,
  },
  labelText: {
    color: '#FFFFFF',
    fontSize: 10,
    opacity: 0.8,
    marginLeft: 4,
  },
});
