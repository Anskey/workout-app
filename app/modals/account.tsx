import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { insetWell } from '@/theme/surfaces';
import { Button, SectionHeader } from '@/theme/ui';
import { Card } from '@/theme/Card';
import { FormScrollView } from '@/components/FormScrollView';
import { ModalHeader } from '@/components/ModalHeader';
import { useAuthStore } from '@/store/useAuthStore';
import { isFirebaseConfigured } from '@/lib/firebase';
import { waitForFirstCloudSync } from '@/logic/cloudSync';

export default function Account() {
  const { fromOnboarding } = useLocalSearchParams<{ fromOnboarding?: string }>();
  const { user, initializing, error, signIn, signUp, signOutUser, clearError } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const runAuth = async (action: 'signIn' | 'signUp') => {
    setValidationError(null);
    clearError();
    if (!email.trim()) {
      setValidationError('Enter an email address.');
      return;
    }
    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters.');
      return;
    }
    setBusy(true);
    try {
      await (action === 'signIn' ? signIn(email, password) : signUp(email, password));
      if (fromOnboarding) {
        // Skipping onboarding by signing in — wait for the real account data to
        // actually arrive before deciding where to go, rather than acting on
        // whatever this fresh install's local (onboarding-incomplete) state says.
        setBusy(false);
        setSyncing(true);
        await waitForFirstCloudSync();
        router.replace('/');
        return;
      }
      router.back();
    } catch {
      // useAuthStore already recorded a friendly error message.
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <FormScrollView contentContainerStyle={styles.scroll}>
        <ModalHeader title="Account" />

        {syncing ? (
          <Card style={styles.centerCard}>
            <ActivityIndicator color={colors.navyDeep} />
            <Text style={[styles.hintText, { marginTop: 12, textAlign: 'center' }]}>Syncing your account…</Text>
          </Card>
        ) : !isFirebaseConfigured ? (
          <Card>
            <Text style={styles.bodyText}>
              Cloud sync isn’t set up yet — this build has no Firebase project configured, so everything stays local to this
              device for now.
            </Text>
          </Card>
        ) : initializing ? (
          <Card style={styles.centerCard}>
            <ActivityIndicator color={colors.navyDeep} />
          </Card>
        ) : user ? (
          <>
            <SectionHeader>Signed In</SectionHeader>
            <Card style={{ marginBottom: 20 }}>
              <Text style={styles.emailText}>{user.email}</Text>
              <Text style={styles.hintText}>Your data syncs to this account automatically — sign in with the same account on another device to pick up right where you left off.</Text>
            </Card>
            <Button label="Sign Out" variant="ghost" onPress={() => signOutUser()} />
          </>
        ) : (
          <>
            <Text style={styles.subtitle}>
              Sign in to keep your data backed up and synced across devices — your current data on this device becomes the
              starting point for your account the first time you sign in.
            </Text>
            <Card>
              <SectionHeader>Email</SectionHeader>
              <TextInput
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                placeholder="you@example.com"
                placeholderTextColor={colors.textFaint}
                style={styles.input}
              />
              <SectionHeader>Password</SectionHeader>
              <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholder="At least 6 characters"
                placeholderTextColor={colors.textFaint}
                style={styles.input}
              />
              {(validationError || error) && <Text style={styles.errorText}>{validationError || error}</Text>}
            </Card>

            <Button label={busy ? 'Please wait…' : 'Sign In'} onPress={() => runAuth('signIn')} disabled={busy} style={{ marginTop: 20 }} />
            <Button label="Create Account" variant="outline" onPress={() => runAuth('signUp')} disabled={busy} style={{ marginTop: 12 }} />
            {!!error && (
              <View style={{ marginTop: 4 }}>
                <Text style={styles.dismissLink} onPress={clearError}>
                  Dismiss
                </Text>
              </View>
            )}
          </>
        )}
      </FormScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 22 },
  subtitle: { color: colors.textSecondary, fontSize: 13.5, lineHeight: 19, marginBottom: 18 },
  bodyText: { color: colors.textSecondary, fontSize: 14, lineHeight: 20 },
  centerCard: { alignItems: 'center', paddingVertical: 30 },
  emailText: { color: colors.textPrimary, fontSize: 16, fontWeight: '700', marginBottom: 6 },
  hintText: { color: colors.textSecondary, fontSize: 12.5, lineHeight: 18 },
  input: {
    color: colors.textPrimary,
    fontSize: 16,
    ...insetWell,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 8,
  },
  errorText: { color: colors.danger, fontSize: 12.5, marginTop: 4 },
  dismissLink: { color: colors.textFaint, fontSize: 12.5, textAlign: 'center' },
});
