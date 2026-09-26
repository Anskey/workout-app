import 'react-native-gesture-handler';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DarkTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Background } from '@/theme/Background';

const navTheme = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, background: 'transparent', card: 'transparent' },
};

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider value={navTheme}>
        <Background>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerShown: false,
              animation: 'fade_from_bottom',
              contentStyle: { backgroundColor: 'transparent' },
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="onboarding" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="modals/measurement-log" options={{ presentation: 'modal' }} />
            <Stack.Screen name="modals/nutrition-log" options={{ presentation: 'modal' }} />
            <Stack.Screen name="modals/exercise-editor" options={{ presentation: 'modal' }} />
            <Stack.Screen name="modals/day-editor" options={{ presentation: 'modal' }} />
            <Stack.Screen name="modals/program-picker" options={{ presentation: 'modal' }} />
            <Stack.Screen name="modals/edit-profile" options={{ presentation: 'modal' }} />
          </Stack>
        </Background>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
