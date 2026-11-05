import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { colors, fonts, fontSize, type FontSize, type FontWeight } from '@/theme';

export interface TextProps extends RNTextProps {
  size?: FontSize;
  weight?: FontWeight;
  color?: string;
  align?: 'left' | 'center' | 'right';
}

export function Text({ size = 'sm', weight = 'regular', color = colors.gray700, align, style, ...rest }: TextProps) {
  return (
    <RNText
      style={[fontSize[size], { fontFamily: fonts[weight], color, textAlign: align }, style]}
      {...rest}
    />
  );
}
