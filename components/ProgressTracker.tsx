import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface ProgressStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  completed: boolean;
  current?: boolean;
}

interface ProgressTrackerProps {
  steps: ProgressStep[];
}

export default function ProgressTracker({ steps }: ProgressTrackerProps) {
  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Your zkLove Journey</ThemedText>
      
      {steps.map((step, index) => (
        <View key={step.id} style={styles.stepContainer}>
          <View style={styles.stepIndicator}>
            <View style={[
              styles.stepCircle,
              step.completed && styles.completedStep,
              step.current && styles.currentStep
            ]}>
              <Ionicons 
                name={step.completed ? 'checkmark' : step.icon as any} 
                size={20} 
                color={step.completed ? '#FFFFFF' : step.current ? '#FF6B35' : '#666'} 
              />
            </View>
            {index < steps.length - 1 && (
              <View style={[
                styles.stepLine,
                step.completed && styles.completedLine
              ]} />
            )}
          </View>
          
          <View style={styles.stepContent}>
            <Text style={[
              styles.stepTitle,
              step.completed && styles.completedText,
              step.current && styles.currentText
            ]}>
              {step.title}
            </Text>
            <Text style={[
              styles.stepDescription,
              step.completed && styles.completedDescription
            ]}>
              {step.description}
            </Text>
          </View>
        </View>
      ))}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  stepContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  stepIndicator: {
    alignItems: 'center',
    marginRight: 15,
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 2,
    borderColor: '#666',
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedStep: {
    backgroundColor: '#00C851',
    borderColor: '#00C851',
  },
  currentStep: {
    borderColor: '#FF6B35',
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
  },
  stepLine: {
    width: 2,
    height: 30,
    backgroundColor: '#666',
    marginTop: 5,
  },
  completedLine: {
    backgroundColor: '#00C851',
  },
  stepContent: {
    flex: 1,
    paddingTop: 5,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  completedText: {
    color: '#00C851',
  },
  currentText: {
    color: '#FF6B35',
  },
  stepDescription: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.7,
    lineHeight: 18,
  },
  completedDescription: {
    opacity: 0.8,
  },
});
