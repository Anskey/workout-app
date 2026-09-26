export const colors = {
  // Light, flat, editorial palette matching kylamiranda.com's own design tokens.
  bg: '#F7FAFC',
  bgAlt: '#E7F1F8',
  surface: '#FFFFFF',
  surfaceBorder: 'rgba(47,102,144,0.16)',

  navySection: '#1D4A6B',

  textPrimary: '#1C2B38',
  textSecondary: '#57697A',
  textFaint: 'rgba(28,43,56,0.45)',
  textOnNavy: '#FFFFFF',
  textOnNavySecondary: 'rgba(255,255,255,0.74)',

  gold: '#D9A441',
  navy: '#2F6690',
  navyDeep: '#1D4A6B',
  teal: '#3FA39A',
  sky: '#9CC1DE',

  success: '#3FA39A',
  warning: '#D9A441',
  danger: '#C96A52',

  divider: 'rgba(47,102,144,0.14)',
};

export const gradients = {
  background: [colors.bg, colors.bgAlt] as const,
  gold: ['#EAC271', '#C68A31'] as const,
};
