import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { BlurView } from 'expo-blur';
import { colors } from '@/theme/colors';
import { DumbbellIcon, HomeIcon, NutritionIcon, RulerIcon } from '@/components/Icons';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.gold,
        tabBarInactiveTintColor: colors.textFaint,
        tabBarShowLabel: true,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginBottom: Platform.OS === 'android' ? 6 : 0 },
        tabBarStyle: styles.tabBar,
        tabBarBackground: () => <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />,
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
    position: 'absolute',
    borderTopWidth: 0,
    backgroundColor: 'transparent',
    elevation: 0,
    height: Platform.OS === 'android' ? 68 : 84,
    paddingTop: 8,
  },
});
