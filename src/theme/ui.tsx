import React from 'react';
import { Pressable, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import { colors } from './colors';

export const serif = 'CormorantGaramond_600SemiBold';
export const sansMedium = 'Inter_500Medium';
export const sansSemiBold = 'Inter_600SemiBold';

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
  variant?: 'gold' | 'outline' | 'navy' | 'ghost';
  disabled?: boolean;
  style?: ViewStyle;
}

export function Button({ label, onPress, variant = 'gold', disabled, style }: ButtonProps) {
  if (variant === 'ghost') {
    return (
      <Pressable onPress={onPress} disabled={disabled} style={({ pressed }) => [{ opacity: disabled ? 0.4 : pressed ? 0.6 : 1 }, style]}>
        <Text style={styles.ghostButtonLabel}>{label}</Text>
      </Pressable>
    );
  }
  const variantStyle = variant === 'navy' ? styles.navyButton : variant === 'outline' ? styles.outlineButton : styles.goldButton;
  const labelStyle = variant === 'navy' ? styles.navyButtonLabel : variant === 'outline' ? styles.outlineButtonLabel : styles.goldButtonLabel;
  return (
    <Pressable onPress={onPress} disabled={disabled} style={({ pressed }) => [{ opacity: disabled ? 0.5 : pressed ? 0.8 : 1 }, style]}>
      <View style={variantStyle}>
        <Text style={labelStyle}>{label}</Text>
      </View>
    </Pressable>
  );
}

export function Badge({ label, color }: { label: string; color: string }) {
  return (
    <View style={[styles.badge, { borderColor: color + '55', backgroundColor: color + '14' }]}>
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
    fontSize: 32,
    color: colors.textPrimary,
    letterSpacing: 0.2,
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
    fontFamily: sansSemiBold,
    fontSize: 12.5,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: colors.textSecondary,
  },
  goldButton: {
    borderRadius: 4,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.gold,
  },
  goldButtonLabel: {
    fontFamily: sansSemiBold,
    color: colors.navyDeep,
    fontSize: 15,
    letterSpacing: 0.2,
  },
  navyButton: {
    borderRadius: 4,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.navyDeep,
  },
  navyButtonLabel: {
    fontFamily: sansSemiBold,
    color: colors.textOnNavy,
    fontSize: 15,
    letterSpacing: 0.2,
  },
  outlineButton: {
    borderRadius: 4,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  outlineButtonLabel: {
    fontFamily: sansSemiBold,
    color: colors.navyDeep,
    fontSize: 15,
  },
  ghostButtonLabel: {
    fontFamily: sansMedium,
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 3,
    borderWidth: 1,
    marginRight: 6,
    marginBottom: 6,
  },
  badgeLabel: {
    fontFamily: sansSemiBold,
    fontSize: 11.5,
    letterSpacing: 0.2,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 4,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    marginRight: 8,
    marginBottom: 8,
  },
  pillActive: {
    backgroundColor: colors.navyDeep,
    borderColor: colors.navyDeep,
  },
  pillLabel: {
    fontFamily: sansMedium,
    color: colors.textSecondary,
    fontSize: 13,
  },
  pillLabelActive: {
    fontFamily: sansSemiBold,
    color: colors.textOnNavy,
  },
});
