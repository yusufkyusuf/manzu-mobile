// Extracted from manzu-f (med-version): app/pharmacy/** hex usage, components/ui/*, app/globals.css.
export const colors = {
  primary: '#1ABA7F',
  primaryDark: '#159E6A',
  primarySoft: 'rgba(26,186,127,0.10)',
  primarySofter: 'rgba(26,186,127,0.20)',
  brandBlue: '#225F91',
  brandBlueDark: '#1A4971',

  white: '#FFFFFF',
  background: '#F9FAFB',
  backgroundEnd: '#F3F4F6',
  card: '#FFFFFF',
  border: '#E5E7EB',
  borderSoft: 'rgba(229,231,235,0.6)',

  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray900: '#111827',

  green50: '#F0FDF4',
  green100: '#DCFCE7',
  green600: '#16A34A',
  green800: '#166534',
  red50: '#FEF2F2',
  red500: '#EF4444',
  red600: '#DC2626',
  red700: '#B91C1C',
  yellow50: '#FEFCE8',
  yellow600: '#CA8A04',
  orange50: '#FFF7ED',
  orange600: '#EA580C',
  blue50: '#EFF6FF',
  blue600: '#2563EB',

  success: '#10B981',
  danger: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
  cyan: '#06B6D4',
  violet: '#8B5CF6',
} as const;

export const gradients = {
  brand: [colors.primary, colors.brandBlue] as const,
  brandText: [colors.brandBlue, colors.primary] as const,
  logout: [colors.brandBlue, colors.brandBlueDark] as const,
  appBackground: [colors.background, colors.backgroundEnd] as const,
  loginBackground: [colors.green50, colors.white] as const,
  cardHeader: ['rgba(26,186,127,0.10)', 'rgba(26,186,127,0)'] as const,
  activeNav: ['rgba(26,186,127,0.20)', 'rgba(26,186,127,0.10)'] as const,
};

export type ColorName = keyof typeof colors;
