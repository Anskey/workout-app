import React from 'react';
import { Pressable, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { colors } from './colors';
import { engraved, goldBevel, goldBevelLocations, navyBevel, plateGradient, raised, raisedEdge } from './surfaces';

export const serif = 'CormorantGaramond_600SemiBold';
export const sansMedium = 'Inter_500Medium';
export const sansSemiBold = 'Inter_600SemiBold';

// Cormorant's default figures are old-style (the "1" in "Pull #1" looks like a small capital I),
// which reads badly for set numbers, week numbers and dates. Lining figures keep the look.
const liningNums: TextStyle = { fontVariant: ['lining-nums'] };

/** A light tick under the thumb on press — the physical click of a real key. */
export const tap = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
};

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
      <Pressable
        onPress={onPress}
        disabled={disabled}
        hitSlop={8}
        style={({ pressed }) => [styles.ghost, { opacity: disabled ? 0.4 : pressed ? 0.55 : 1 }, style]}
      >
        <Text style={styles.ghostButtonLabel}>{label}</Text>
      </Pressable>
    );
  }

  const face =
    variant === 'navy'
      ? { colors: navyBevel, locations: [0, 0.5, 1] as const, edge: styles.navyEdge, label: styles.navyButtonLabel }
      : variant === 'outline'
      ? { colors: plateGradient, locations: [0, 1] as const, edge: raisedEdge, label: styles.outlineButtonLabel }
      : { colors: goldBevel, locations: goldBevelLocations, edge: styles.goldEdge, label: styles.goldButtonLabel };

  return (
    <Pressable onPress={onPress} onPressIn={tap} disabled={disabled} style={style}>
      {({ pressed }) => (
        <View
          style={[
            styles.buttonShell,
            pressed ? styles.buttonShellPressed : raised(variant === 'outline' ? 2 : 3),
            disabled && { opacity: 0.5 },
          ]}
        >
          <LinearGradient
            // Pressed: light and shade swap, so the key reads as pushed down into the surface.
            colors={(pressed ? [...face.colors].reverse() : face.colors) as unknown as [string, string, ...string[]]}
            locations={face.locations as unknown as [number, number, ...number[]]}
            style={[styles.buttonFace, face.edge]}
          >
            <Text style={face.label}>{label}</Text>
          </LinearGradient>
        </View>
      )}
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

/** A segmented-control style choice: raised plate while idle, pressed-in navy when selected. */
export function Pill({ label, active, onPress }: { label: string; active?: boolean; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} onPressIn={tap} hitSlop={4} style={styles.pillWrap}>
      {({ pressed }) =>
        active ? (
          <LinearGradient colors={['#153950', '#1D4A6B', '#235982']} style={[styles.pill, styles.pillActive]}>
            <Text style={[styles.pillLabel, styles.pillLabelActive]}>{label}</Text>
          </LinearGradient>
        ) : (
          <View style={[styles.pill, raisedEdge, !pressed && raised(1)]}>
            <LinearGradient
              pointerEvents="none"
              colors={pressed ? ['#EAF1F7', '#FFFFFF'] : plateGradient}
              style={[StyleSheet.absoluteFill, { borderRadius: 11 }]}
            />
            <Text style={styles.pillLabel}>{label}</Text>
          </View>
        )
      }
    </Pressable>
  );
}

export function Divider() {
  // An engraved groove: a dark line with a light line directly beneath it.
  return (
    <View style={{ marginVertical: 14 }}>
      <View style={{ height: 1, backgroundColor: 'rgba(47,102,144,0.18)' }} />
      <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.95)' }} />
    </View>
  );
}

const styles = StyleSheet.create({
  screenTitle: {
    fontFamily: serif,
    fontSize: 32,
    color: colors.textPrimary,
    letterSpacing: 0.2,
    ...liningNums,
    ...engraved,
  } as TextStyle,
  screenSubtitle: {
    marginTop: 4,
    fontSize: 14.5,
    lineHeight: 20,
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
    fontSize: 13,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: colors.textSecondary,
    ...engraved,
  },
  buttonShell: {
    borderRadius: 12,
    backgroundColor: colors.surface,
  },
  buttonShellPressed: {
    transform: [{ translateY: 1.5 }],
  },
  buttonFace: {
    borderRadius: 12,
    minHeight: 52,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goldEdge: {
    borderWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.75)',
    borderLeftColor: 'rgba(255,240,205,0.5)',
    borderRightColor: 'rgba(165,112,31,0.45)',
    borderBottomColor: '#A5701F',
  },
  navyEdge: {
    borderWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.28)',
    borderLeftColor: 'rgba(255,255,255,0.14)',
    borderRightColor: 'rgba(0,0,0,0.25)',
    borderBottomColor: '#0F2B3F',
  },
  // Letterpress: a 1px light shadow under the text makes it look stamped into the face.
  goldButtonLabel: {
    fontFamily: sansSemiBold,
    color: colors.navyDeep,
    fontSize: 15.5,
    letterSpacing: 0.3,
    textShadowColor: 'rgba(255,248,225,0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 0,
  },
  navyButtonLabel: {
    fontFamily: sansSemiBold,
    color: colors.textOnNavy,
    fontSize: 15.5,
    letterSpacing: 0.3,
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: -1 },
    textShadowRadius: 0,
  },
  outlineButtonLabel: {
    fontFamily: sansSemiBold,
    color: colors.navyDeep,
    fontSize: 15.5,
    letterSpacing: 0.2,
    textShadowColor: 'rgba(255,255,255,0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 0,
  },
  ghost: {
    minHeight: 44,
    justifyContent: 'center',
  },
  ghostButtonLabel: {
    fontFamily: sansMedium,
    color: colors.textSecondary,
    fontSize: 14.5,
    textAlign: 'center',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    marginRight: 6,
    marginBottom: 6,
  },
  badgeLabel: {
    fontFamily: sansSemiBold,
    fontSize: 12,
    letterSpacing: 0.2,
  },
  pillWrap: {
    marginRight: 8,
    marginBottom: 8,
  },
  pill: {
    minHeight: 40,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: colors.surface,
  },
  pillActive: {
    borderWidth: 1,
    borderTopColor: '#0D2536',
    borderLeftColor: '#12344C',
    borderRightColor: 'rgba(255,255,255,0.18)',
    borderBottomColor: 'rgba(255,255,255,0.28)',
  },
  pillLabel: {
    fontFamily: sansMedium,
    color: colors.textSecondary,
    fontSize: 14,
  },
  pillLabelActive: {
    fontFamily: sansSemiBold,
    color: colors.textOnNavy,
  },
});
