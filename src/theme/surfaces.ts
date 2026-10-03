import { Platform, ViewStyle } from 'react-native';
import { colors } from './colors';

/** Shared "material" tokens so every raised/inset surface in the app reads as one set of
 * physical objects. Android draws depth with `elevation`; the shadow props cover iOS and the
 * web preview (which ignores elevation), so what we check in a browser roughly matches. */
export function raised(level: 1 | 2 | 3 | 4): ViewStyle {
  return (
    Platform.select<ViewStyle>({
      android: { elevation: level * 2 },
      default: {
        shadowColor: colors.navyDeep,
        shadowOffset: { width: 0, height: level * 1.5 },
        shadowOpacity: 0.1 + level * 0.025,
        shadowRadius: level * 3,
      },
    }) ?? {}
  );
}

/** A sheet of cool white paper: lit from above, slightly darker toward the bottom. */
export const plateGradient = ['#FFFFFF', '#E8F0F6'] as const;

/** Gold key/button face — bright top highlight, deeper bottom, like a stamped metal plate. */
export const goldBevel = ['#F2CF88', '#DDAA48', '#C58A30'] as const;
export const goldBevelLocations = [0, 0.45, 1] as const;

/** Deep navy leather-ish face for the secondary filled button and pressed-in pills. */
export const navyBevel = ['#2C5F86', '#1D4A6B', '#173E5A'] as const;

/** Light catches the top edge and falls off at the bottom edge — the bevel on a raised plate. */
export const raisedEdge: ViewStyle = {
  borderWidth: 1,
  borderTopColor: 'rgba(255,255,255,0.95)',
  borderLeftColor: 'rgba(255,255,255,0.6)',
  borderRightColor: 'rgba(47,102,144,0.14)',
  borderBottomColor: 'rgba(47,102,144,0.28)',
};

/** A recessed well (inputs, tracks): dark lip along the top, light catching the bottom edge —
 * the reverse of a raised plate, so it reads as pressed into the surface. */
export const insetWell: ViewStyle = {
  backgroundColor: '#EBF2F8',
  borderWidth: 1,
  borderTopColor: 'rgba(28,43,56,0.22)',
  borderLeftColor: 'rgba(28,43,56,0.12)',
  borderRightColor: 'rgba(255,255,255,0.9)',
  borderBottomColor: 'rgba(255,255,255,0.95)',
};

/** Letterpress: a 1px light edge under dark text makes headings look pressed into the page. */
export const engraved = {
  textShadowColor: 'rgba(255,255,255,0.95)',
  textShadowOffset: { width: 0, height: 1 },
  textShadowRadius: 0,
} as const;
