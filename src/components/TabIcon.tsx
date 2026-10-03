import React from 'react';
import { StyleSheet, View } from 'react-native';
import { insetWell } from '@/theme/surfaces';

/** Wraps a tab-bar icon. The active tab's icon sits in a recessed capsule, like a button
 * that's been pressed into the dock, instead of only changing colour. */
export function TabIcon({ focused, children }: { focused: boolean; children: React.ReactNode }) {
  return <View style={[styles.capsule, focused && styles.capsuleActive]}>{children}</View>;
}

const styles = StyleSheet.create({
  capsule: {
    width: 58,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  capsuleActive: {
    ...insetWell,
    backgroundColor: '#E2ECF4',
  },
});
