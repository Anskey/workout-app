import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { Text, TextInput } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, CormorantGaramond_600SemiBold, CormorantGaramond_700Bold } from '@expo-google-fonts/cormorant-garamond';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { Background } from '@/theme/Background';

SplashScreen.preventAutoHideAsync().catch(() => {});

const navTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: 'transparent', card: 'transparent' },
};

let didSetDefaultFont = false;
function applyDefaultFont() {
  if (didSetDefaultFont) return;
  didSetDefaultFont = true;
  const TextAny = Text as any;
  const TextInputAny = TextInput as any;
  TextAny.defaultProps = TextAny.defaultProps || {};
  TextAny.defaultProps.style = [{ fontFamily: 'Inter_400Regular' }, TextAny.defaultProps.style];
  TextInputAny.defaultProps = TextInputAny.defaultProps || {};
  TextInputAny.defaultProps.style = [{ fontFamily: 'Inter_400Regular' }, TextInputAny.defaultProps.style];
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    CormorantGaramond_600SemiBold,
    CormorantGaramond_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      applyDefaultFont();
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider value={navTheme}>
        <Background>
          <StatusBar style="dark" />
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
            <Stack.Screen name="modals/exercise-swap" options={{ presentation: 'modal' }} />
            <Stack.Screen name="modals/session-log" options={{ presentation: 'modal' }} />
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
