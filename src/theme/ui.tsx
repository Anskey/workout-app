import React from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients } from './colors';

export const serif = Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' });

export function ScreenTitle({ children, subtitle }: { children: React.ReactNode; subtitle?: string }) {
  return (
    <View style={{ marginBottom: 18 }}>
      <Text style={styles.screenTitle}>{children}</Text>
      {subtitle ? <Text style={styles.screenSubtitle}>{subtitle}</Text> : null}
    </View>
  );
}

export function SectionHeader({ children, right }: { children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <View style={styles.sectionHeaderRow}>
      <Text style={styles.sectionHeader}>{children}</Text>
      {right}
    </View>
  );
}

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'gold' | 'glass' | 'ghost';
  disabled?: boolean;
  style?: ViewStyle;
}

export function Button({ label, onPress, variant = 'gold', disabled, style }: ButtonProps) {
  if (variant === 'gold') {
    return (
      <Pressable onPress={onPress} disabled={disabled} style={({ pressed }) => [{ opacity: disabled ? 0.5 : pressed ? 0.85 : 1 }, style]}>
        <LinearGradient colors={gradients.gold} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.goldButton}>
          <Text style={styles.goldButtonLabel}>{label}</Text>
        </LinearGradient>
      </Pressable>
    );
  }
  if (variant === 'glass') {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={({ pressed }) => [styles.glassButton, { opacity: disabled ? 0.5 : pressed ? 0.7 : 1 }, style]}
      >
        <Text style={styles.glassButtonLabel}>{label}</Text>
      </Pressable>
    );
  }
  return (
    <Pressable onPress={onPress} disabled={disabled} style={({ pressed }) => [{ opacity: disabled ? 0.4 : pressed ? 0.6 : 1 }, style]}>
      <Text style={styles.ghostButtonLabel}>{label}</Text>
    </Pressable>
  );
}

export function Badge({ label, color }: { label: string; color: string }) {
  return (
    <View style={[styles.badge, { borderColor: color + '55', backgroundColor: color + '1E' }]}>
      <Text style={[styles.badgeLabel, { color }]}>{label}</Text>
    </View>
  );
}

export function Pill({ label, active, onPress }: { label: string; active?: boolean; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.pill, active && styles.pillActive]}>
      <Text style={[styles.pillLabel, active && styles.pillLabelActive]}>{label}</Text>
    </Pressable>
  );
}

export function Divider() {
  return <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: colors.divider, marginVertical: 14 }} />;
}

const styles = StyleSheet.create({
  screenTitle: {
    fontFamily: serif,
    fontSize: 30,
    color: colors.textPrimary,
    letterSpacing: 0.3,
  } as TextStyle,
  screenSubtitle: {
    marginTop: 4,
    fontSize: 14,
    color: colors.textSecondary,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    marginTop: 6,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: colors.textSecondary,
  },
  goldButton: {
    borderRadius: 2,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goldButtonLabel: {
    color: '#241A0E',
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: 0.4,
  },
  glassButton: {
    borderRadius: 2,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.glassFillStrong,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  glassButtonLabel: {
    color: colors.textPrimary,
    fontWeight: '600',
    fontSize: 15,
  },
  ghostButtonLabel: {
    color: colors.textSecondary,
    fontWeight: '600',
    fontSize: 14,
    textAlign: 'center',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 2,
    borderWidth: 1,
    marginRight: 6,
    marginBottom: 6,
  },
  badgeLabel: {
    fontSize: 11.5,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 2,
    backgroundColor: colors.glassFill,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    marginRight: 8,
  },
  pillActive: {
    backgroundColor: colors.gold + '2A',
    borderColor: colors.gold + '80',
  },
  pillLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  pillLabelActive: {
    color: colors.gold,
  },
});
