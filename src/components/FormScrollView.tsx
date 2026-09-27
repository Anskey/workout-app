import React, { useEffect, useState } from 'react';
import { Keyboard, Platform, ScrollView, StyleProp, ViewStyle } from 'react-native';

function useAndroidKeyboardHeight(): number {
  const [height, setHeight] = useState(0);
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const show = Keyboard.addListener('keyboardDidShow', (e) => setHeight(e.endCoordinates.height));
    const hide = Keyboard.addListener('keyboardDidHide', () => setHeight(0));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);
  return height;
}

/**
 * ScrollView for forms that keeps the bottom inputs reachable while the keyboard is open.
 * Android (edge-to-edge) doesn't resize the window for the keyboard, so we pad the content
 * by the keyboard height; iOS uses the native inset adjustment.
 */
export function FormScrollView({
  children,
  contentContainerStyle,
  bottomPadding = 48,
}: {
  children: React.ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
  bottomPadding?: number;
}) {
  const keyboardHeight = useAndroidKeyboardHeight();
  return (
    <ScrollView
      contentContainerStyle={[contentContainerStyle, { paddingBottom: bottomPadding + keyboardHeight }]}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      automaticallyAdjustKeyboardInsets
    >
      {children}
    </ScrollView>
  );
}
