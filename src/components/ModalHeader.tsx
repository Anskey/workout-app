import React from 'react';
import { Pressable, StyleSheet, Text, TextStyle, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { colors } from '@/theme/colors';
import { serif, tap } from '@/theme/ui';
import { plateGradient, raised, raisedEdge } from '@/theme/surfaces';
import { CloseIcon } from '@/components/Icons';

export function ModalHeader({ title, onClose }: { title: string; onClose?: () => void }) {
  return (
    <View style={styles.row}>
      <Text style={styles.title} numberOfLines={2}>
        {title}
      </Text>
      <Pressable
        hitSlop={6}
        onPress={onClose ?? (() => router.back())}
        onPressIn={tap}
        accessibilityRole="button"
        accessibilityLabel="Close"
      >
        {({ pressed }) => (
          <View style={[styles.closeButton, raisedEdge, !pressed && raised(1)]}>
            <LinearGradient
              pointerEvents="none"
              colors={pressed ? ['#E6EEF5', '#FFFFFF'] : plateGradient}
              style={[StyleSheet.absoluteFill, { borderRadius: 21 }]}
            />
            <View>
              <CloseIcon color={colors.textSecondary} size={18} />
            </View>
          </View>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, gap: 12 },
  title: { flex: 1, fontFamily: serif, fontSize: 26, color: colors.textPrimary, fontVariant: ['lining-nums'] } as TextStyle,
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
});
