import React, { useEffect } from 'react';
import { Text, TextInput } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DefaultTheme, router, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useShareIntent } from 'expo-share-intent';
import { useFonts, CormorantGaramond_600SemiBold, CormorantGaramond_700Bold } from '@expo-google-fonts/cormorant-garamond';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { Background } from '@/theme/Background';
import { initCloudSync } from '@/logic/cloudSync';
import { parseSharedNutritionText } from '@/logic/parseSharedNutrition';

SplashScreen.preventAutoHideAsync().catch(() => {});
initCloudSync();

const navTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: 'transparent', card: 'transparent' },
};

// Modals rise from the bottom like a sheet; pushed screens slide in from the right and the
// tabs cross-fade — three distinct motions, so you can feel where you are in the app.
const modalOptions = { presentation: 'modal', animation: 'slide_from_bottom' } as const;

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

  // A share from another app (e.g. a daily nutrition summary from Gemini) lands here
  // as plain text — pull out whatever numbers we can and open the log pre-filled,
  // rather than silently swallowing the share or requiring manual re-entry.
  const { hasShareIntent, shareIntent, resetShareIntent } = useShareIntent();
  useEffect(() => {
    if (!hasShareIntent || !shareIntent?.text) return;
    const parsed = parseSharedNutritionText(shareIntent.text);
    resetShareIntent();
    router.push({
      pathname: '/modals/nutrition-log',
      params: {
        prefillCalories: parsed.calories != null ? String(parsed.calories) : undefined,
        prefillProteinG: parsed.proteinG != null ? String(parsed.proteinG) : undefined,
        prefillWeightKg: parsed.weightKg != null ? String(parsed.weightKg) : undefined,
        prefillSteps: parsed.steps != null ? String(parsed.steps) : undefined,
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasShareIntent, shareIntent]);

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
              animation: 'slide_from_right',
              contentStyle: { backgroundColor: 'transparent' },
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="onboarding" />
            <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
            <Stack.Screen name="modals/measurement-log" options={modalOptions} />
            <Stack.Screen name="modals/nutrition-log" options={modalOptions} />
            <Stack.Screen name="modals/exercise-detail" options={modalOptions} />
            <Stack.Screen name="modals/exercise-editor" options={modalOptions} />
            <Stack.Screen name="modals/exercise-swap" options={modalOptions} />
            <Stack.Screen name="modals/session-log" options={modalOptions} />
            <Stack.Screen name="modals/day-editor" options={modalOptions} />
            <Stack.Screen name="modals/program-picker" options={modalOptions} />
            <Stack.Screen name="modals/edit-profile" options={modalOptions} />
            <Stack.Screen name="modals/account" options={modalOptions} />
            <Stack.Screen name="modals/trends" options={modalOptions} />
          </Stack>
        </Background>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
