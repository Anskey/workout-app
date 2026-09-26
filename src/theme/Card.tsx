import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { colors } from './colors';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  padded?: boolean;
  variant?: 'surface' | 'navy';
}

export function Card({ children, style, padded = true, variant = 'surface' }: CardProps) {
  return (
    <View style={[styles.wrap, variant === 'navy' ? styles.navy : styles.surface, padded && styles.padded, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 4,
  },
  surface: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  navy: {
    backgroundColor: colors.navySection,
  },
  padded: {
    padding: 18,
  },
});
