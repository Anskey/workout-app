export const colors = {
  // Navy/gold palette drawn from kylamiranda.com's own design tokens.
  bgTop: '#070D16',
  bgMid: '#0D1B2E',
  bgBottom: '#123055',
  glow: '#1D4A6B',

  glassFill: 'rgba(231,241,248,0.06)',
  glassFillStrong: 'rgba(231,241,248,0.10)',
  glassBorder: 'rgba(217,164,65,0.18)',

  textPrimary: '#F2F6FA',
  textSecondary: 'rgba(231,241,248,0.64)',
  textFaint: 'rgba(231,241,248,0.40)',

  gold: '#D9A441',
  navy: '#2F6690',
  navyDeep: '#1D4A6B',
  teal: '#3FA39A',
  sky: '#9CC1DE',

  success: '#3FA39A',
  warning: '#D9A441',
  danger: '#D9836F',

  divider: 'rgba(217,164,65,0.12)',
};

export const gradients = {
  background: [colors.bgTop, colors.bgMid, colors.bgBottom] as const,
  gold: ['#EAC271', '#C68A31'] as const,
};
