import React from 'react';
import { Redirect } from 'expo-router';
import { useStore, useHasHydrated } from '@/store/useStore';
import { View } from 'react-native';

export default function Index() {
  const hydrated = useHasHydrated();
  const onboardingComplete = useStore((s) => s.profile.onboardingComplete);

  if (!hydrated) return <View style={{ flex: 1 }} />;

  return <Redirect href={onboardingComplete ? '/(tabs)/home' : '/onboarding/welcome'} />;
}
