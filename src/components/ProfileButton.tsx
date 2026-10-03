import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { colors } from '@/theme/colors';
import { serif } from '@/theme/ui';
import { raised } from '@/theme/surfaces';
import { useStore } from '@/store/useStore';
import { UserIcon } from '@/components/Icons';

const SIZE = 46;

/** Round, soft-moulded profile button for the top corner of every tab. A 46dp thumb target
 * (the old text link was ~14dp tall) that shows your initial once you've set a name. Raised
 * at rest; when pressed the light and shadow swap so it reads as pushed into the surface. */
export function ProfileButton() {
  const name = useStore((s) => s.profile.name);
  const initial = name.trim().charAt(0).toUpperCase();

  return (
    <Pressable
      onPress={() => router.push('/modals/edit-profile')}
      onPressIn={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})}
      accessibilityRole="button"
      accessibilityLabel="Profile and goals"
      hitSlop={4}
    >
      {({ pressed }) => (
        <View style={[styles.outer, !pressed && raised(2)]}>
          <LinearGradient
            colors={pressed ? ['#C5D5E2', '#FAFCFE'] : ['#FFFFFF', '#C9D9E6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.ring}
          >
            <LinearGradient
              colors={pressed ? ['#E1EBF3', '#F4F8FB'] : ['#FCFEFF', '#E0EAF3']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.face}
            >
              {initial ? <Text style={styles.initial}>{initial}</Text> : <UserIcon color={colors.navyDeep} size={21} />}
            </LinearGradient>
          </LinearGradient>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  outer: { width: SIZE, height: SIZE, borderRadius: SIZE / 2, backgroundColor: '#E4EDF4' },
  ring: { flex: 1, borderRadius: SIZE / 2, padding: 3 },
  face: { flex: 1, borderRadius: SIZE / 2, alignItems: 'center', justifyContent: 'center' },
  initial: { fontFamily: serif, fontSize: 20, color: colors.navyDeep, marginTop: -1 },
});
