import React from 'react';
import { StyleSheet, View, ViewStyle, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { colors } from './colors';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  intensity?: number;
  padded?: boolean;
}

export function GlassCard({ children, style, intensity = 32, padded = true }: GlassCardProps) {
  return (
    <View style={[styles.wrap, padded && styles.padded, style]}>
      <BlurView
        intensity={intensity}
        tint="dark"
        style={StyleSheet.absoluteFill}
        experimentalBlurMethod={Platform.OS === 'android' ? 'dimezisBlurView' : undefined}
      />
      <View style={styles.tint} pointerEvents="none" />
      <View style={styles.border} pointerEvents="none" />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 2,
    overflow: 'hidden',
    backgroundColor: 'rgba(30,22,34,0.55)',
  },
  padded: {
    padding: 18,
  },
  tint: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.glassFill,
  },
  border: {
    ...StyleSheet.absoluteFill,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
});
