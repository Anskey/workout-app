import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { serif, Button } from '@/theme/ui';
import { SparkleIcon } from '@/components/Icons';

export default function Welcome() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.hero}>
        <SparkleIcon color={colors.gold} size={30} />
        <Text style={styles.title}>SCULPT</Text>
        <Text style={styles.subtitle}>Train with intention.{'\n'}Track what actually changes.</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.copy}>
          A few quick measurements, your training program, and daily nutrition — all in one place, with
          weekly guidance on what to adjust.
        </Text>
      </View>
      <Button label="Begin" onPress={() => router.push('/onboarding/profile')} style={styles.button} />
      <Text
        style={styles.signInLink}
        onPress={() => router.push({ pathname: '/modals/account', params: { fromOnboarding: 'true' } })}
      >
        Already have an account? Sign in
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 28, justifyContent: 'space-between', paddingVertical: 40 },
  hero: { alignItems: 'center', marginTop: 60, gap: 14 },
  title: {
    fontFamily: serif,
    fontSize: 40,
    letterSpacing: 8,
    color: colors.textPrimary,
  },
  subtitle: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
  },
  body: { flex: 1, justifyContent: 'center' },
  copy: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 23,
    paddingHorizontal: 8,
  },
  button: { marginBottom: 8 },
  signInLink: {
    textAlign: 'center',
    color: colors.gold,
    fontSize: 13.5,
    fontWeight: '600',
    marginTop: 14,
  },
});
