import React from 'react';
import { Platform, StyleSheet, View, ViewStyle } from 'react-native';
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
    borderRadius: 16,
  },
  surface: {
    backgroundColor: colors.surface,
    // Material elevation instead of a hairline border — a flat bordered card is
    // one of the clearest "this is a web page" tells on Android.
    ...Platform.select({
      ios: {
        shadowColor: colors.textPrimary,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: { elevation: 2 },
    }),
  },
  navy: {
    backgroundColor: colors.navySection,
  },
  padded: {
    padding: 18,
  },
});
