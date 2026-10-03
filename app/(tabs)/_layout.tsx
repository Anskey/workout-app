import React from 'react';
import { ColorValue, Platform, StyleSheet, View } from 'react-native';
import { Tabs } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { plateGradient } from '@/theme/surfaces';
import { DumbbellIcon, HomeIcon, ListIcon, NutritionIcon, RulerIcon } from '@/components/Icons';
import { TabIcon } from '@/components/TabIcon';

function TabBarBackground() {
  return (
    <View style={StyleSheet.absoluteFill}>
      <LinearGradient colors={plateGradient} style={StyleSheet.absoluteFill} />
      <View style={styles.topLight} />
    </View>
  );
}

type IconComponent = React.ComponentType<{ color: string; size?: number }>;

function TabBarIcon({ Icon, color, focused }: { Icon: IconComponent; color: ColorValue; focused: boolean }) {
  return (
    <TabIcon focused={focused}>
      <Icon color={color as string} size={24} />
    </TabIcon>
  );
}

export default function TabsLayout() {
  // Android's edge-to-edge display means the system gesture/nav bar overlays the
  // app instead of reserving space for it — without adding the bottom safe-area
  // inset ourselves, the tab bar (and its labels) can end up rendered underneath
  // it, effectively making the other tabs unreachable.
  const insets = useSafeAreaInsets();
  const baseHeight = Platform.OS === 'android' ? 66 : 70;

  return (
    <Tabs
      screenListeners={{
        tabPress: () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        },
      }}
      screenOptions={{
        headerShown: false,
        // A soft cross-fade between tabs, instead of the content just snapping over.
        animation: 'fade',
        tabBarActiveTintColor: colors.navyDeep,
        tabBarInactiveTintColor: colors.textFaint,
        tabBarShowLabel: true,
        tabBarLabelStyle: { fontSize: 11.5, fontFamily: 'Inter_600SemiBold', marginTop: 1 },
        tabBarBackground: () => <TabBarBackground />,
        tabBarStyle: [styles.tabBar, { height: baseHeight + insets.bottom, paddingBottom: insets.bottom + 6 }],
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{ title: 'Home', tabBarIcon: ({ color, focused }) => <TabBarIcon Icon={HomeIcon} color={color} focused={focused} /> }}
      />
      <Tabs.Screen
        name="program"
        options={{ title: 'Program', tabBarIcon: ({ color, focused }) => <TabBarIcon Icon={DumbbellIcon} color={color} focused={focused} /> }}
      />
      <Tabs.Screen
        name="exercises"
        options={{ title: 'Exercises', tabBarIcon: ({ color, focused }) => <TabBarIcon Icon={ListIcon} color={color} focused={focused} /> }}
      />
      <Tabs.Screen
        name="measurements"
        options={{ title: 'Measure', tabBarIcon: ({ color, focused }) => <TabBarIcon Icon={RulerIcon} color={color} focused={focused} /> }}
      />
      <Tabs.Screen
        name="nutrition"
        options={{ title: 'Nutrition', tabBarIcon: ({ color, focused }) => <TabBarIcon Icon={NutritionIcon} color={color} focused={focused} /> }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    paddingTop: 6,
    ...Platform.select({
      android: { elevation: 10 },
      default: {
        shadowColor: colors.navyDeep,
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
      },
    }),
  },
  // A bright edge along the top of the dock, where the light hits it.
  topLight: { height: 1, backgroundColor: 'rgba(255,255,255,0.95)' },
});
