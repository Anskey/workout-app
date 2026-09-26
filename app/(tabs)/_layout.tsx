import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { colors } from '@/theme/colors';
import { DumbbellIcon, HomeIcon, NutritionIcon, RulerIcon } from '@/components/Icons';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.navyDeep,
        tabBarInactiveTintColor: colors.textFaint,
        tabBarShowLabel: true,
        tabBarLabelStyle: { fontSize: 11, fontFamily: 'Inter_600SemiBold', marginBottom: Platform.OS === 'android' ? 6 : 0 },
        tabBarStyle: styles.tabBar,
      }}
    >
      <Tabs.Screen name="home" options={{ title: 'Home', tabBarIcon: ({ color, size }) => <HomeIcon color={color as string} size={size} /> }} />
      <Tabs.Screen
        name="program"
        options={{ title: 'Program', tabBarIcon: ({ color, size }) => <DumbbellIcon color={color as string} size={size} /> }}
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
    height: Platform.OS === 'android' ? 64 : 84,
    paddingTop: 8,
  },
});
