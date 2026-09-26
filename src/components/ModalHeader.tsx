import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { colors } from '@/theme/colors';
import { serif } from '@/theme/ui';
import { CloseIcon } from '@/components/Icons';

export function ModalHeader({ title, onClose }: { title: string; onClose?: () => void }) {
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      <Pressable hitSlop={12} onPress={onClose ?? (() => router.back())} style={styles.closeButton}>
        <CloseIcon color={colors.textSecondary} size={16} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  title: { fontFamily: serif, fontSize: 24, color: colors.textPrimary },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.glassFill,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
});
