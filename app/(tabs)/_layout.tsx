import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { DumbbellIcon, HomeIcon, ListIcon, NutritionIcon, RulerIcon } from '@/components/Icons';

export default function TabsLayout() {
  // Android's edge-to-edge display means the system gesture/nav bar overlays the
  // app instead of reserving space for it — without adding the bottom safe-area
  // inset ourselves, the tab bar (and its labels) can end up rendered underneath
  // it, effectively making the other tabs unreachable.
  const insets = useSafeAreaInsets();
  const baseHeight = Platform.OS === 'android' ? 56 : 60;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.navyDeep,
        tabBarInactiveTintColor: colors.textFaint,
        tabBarShowLabel: true,
        tabBarLabelStyle: { fontSize: 11, fontFamily: 'Inter_600SemiBold' },
        tabBarStyle: [styles.tabBar, { height: baseHeight + insets.bottom, paddingBottom: insets.bottom + 6 }],
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Tabs.Screen name="home" options={{ title: 'Home', tabBarIcon: ({ color, size }) => <HomeIcon color={color as string} size={size} /> }} />
      <Tabs.Screen
        name="program"
        options={{ title: 'Program', tabBarIcon: ({ color, size }) => <DumbbellIcon color={color as string} size={size} /> }}
      />
      <Tabs.Screen
        name="exercises"
        options={{ title: 'Exercises', tabBarIcon: ({ color, size }) => <ListIcon color={color as string} size={size} /> }}
      />
      <Tabs.Screen
        name="measurements"
        options={{ title: 'Measure', tabBarIcon: ({ color, size }) => <RulerIcon color={color as string} size={size} /> }}
      />
      <Tabs.Screen
        name="nutrition"
        options={{ title: 'Nutrition', tabBarIcon: ({ color, size }) => <NutritionIcon color={color as string} size={size} /> }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    paddingTop: 8,
  },
});
