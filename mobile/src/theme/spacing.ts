import { Platform, type ViewStyle } from 'react-native';

// Tailwind 4pt scale.
export const space = {
  0: 0, 0.5: 2, 1: 4, 1.5: 6, 2: 8, 2.5: 10, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32, 10: 40, 12: 48,
} as const;

// globals.css: --radius: 0.75rem; rounded-sm/md/lg/xl = radius-4/-2/+0/+4 px; Tailwind 2xl = 16.
export const radius = { sm: 8, md: 10, lg: 12, xl: 16, '2xl': 16, full: 9999 } as const;

// Minimum touch target (globals.css mobile rule: min-height 44px).
export const touchTarget = 44;

function shadow(y: number, blur: number, opacity: number, elevation: number): ViewStyle {
  return Platform.select<ViewStyle>({
    android: { elevation },
    default: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: y },
      shadowOpacity: opacity,
      shadowRadius: blur,
    },
  })!;
}

export const shadows = {
  sm: shadow(1, 2, 0.05, 1),
  md: shadow(4, 6, 0.1, 3),
  lg: shadow(10, 15, 0.1, 6),
  xl: shadow(20, 25, 0.1, 10),
};
