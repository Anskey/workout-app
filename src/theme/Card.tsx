import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from './colors';
import { navyBevel, plateGradient, raised, raisedEdge } from './surfaces';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  padded?: boolean;
  variant?: 'surface' | 'navy';
}

/** A raised plate. The gradient and bevel are absolutely-positioned layers behind the
 * content, so callers' padding / flex layout work exactly as they would on a plain View. */
export function Card({ children, style, padded = true, variant = 'surface' }: CardProps) {
  const navy = variant === 'navy';
  return (
    <View style={[styles.wrap, navy ? styles.navy : styles.surface, padded && styles.padded, style]}>
      <LinearGradient
        pointerEvents="none"
        colors={navy ? navyBevel : plateGradient}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={styles.layer}
      />
      {!navy && <View pointerEvents="none" style={[styles.layer, raisedEdge]} />}
      {children}
    </View>
  );
}

const RADIUS = 16;

const styles = StyleSheet.create({
  wrap: {
    borderRadius: RADIUS,
  },
  surface: {
    backgroundColor: colors.surface,
    ...raised(3),
  },
  navy: {
    backgroundColor: colors.navySection,
    ...raised(2),
  },
  padded: {
    padding: 18,
  },
  layer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: RADIUS,
  },
});
