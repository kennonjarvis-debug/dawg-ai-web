import { z } from 'zod';

// ============================================================================
// COLOR TOKENS
// ============================================================================

export const ColorTokenSchema = z.object({
  primary: z.object({
    50: z.string(),
    100: z.string(),
    200: z.string(),
    300: z.string(),
    400: z.string(),
    500: z.string(),
    600: z.string(),
    700: z.string(),
    800: z.string(),
    900: z.string(),
    950: z.string(),
  }),
  secondary: z.object({
    50: z.string(),
    100: z.string(),
    200: z.string(),
    300: z.string(),
    400: z.string(),
    500: z.string(),
    600: z.string(),
    700: z.string(),
    800: z.string(),
    900: z.string(),
    950: z.string(),
  }),
  accent: z.object({
    50: z.string(),
    100: z.string(),
    200: z.string(),
    300: z.string(),
    400: z.string(),
    500: z.string(),
    600: z.string(),
    700: z.string(),
    800: z.string(),
    900: z.string(),
    950: z.string(),
  }),
  neutral: z.object({
    50: z.string(),
    100: z.string(),
    200: z.string(),
    300: z.string(),
    400: z.string(),
    500: z.string(),
    600: z.string(),
    700: z.string(),
    800: z.string(),
    900: z.string(),
    950: z.string(),
  }),
  semantic: z.object({
    success: z.string(),
    warning: z.string(),
    error: z.string(),
    info: z.string(),
  }),
});

export type ColorTokens = z.infer<typeof ColorTokenSchema>;

// ============================================================================
// SPACING TOKENS
// ============================================================================

export const SpacingTokenSchema = z.object({
  0: z.string(),
  1: z.string(),
  2: z.string(),
  3: z.string(),
  4: z.string(),
  5: z.string(),
  6: z.string(),
  8: z.string(),
  10: z.string(),
  12: z.string(),
  16: z.string(),
  20: z.string(),
  24: z.string(),
  32: z.string(),
  40: z.string(),
  48: z.string(),
  64: z.string(),
  80: z.string(),
  96: z.string(),
  128: z.string(),
});

export type SpacingTokens = z.infer<typeof SpacingTokenSchema>;

// ============================================================================
// TYPOGRAPHY TOKENS
// ============================================================================

export const FontFamilyTokenSchema = z.object({
  sans: z.string(),
  serif: z.string(),
  mono: z.string(),
  display: z.string(),
});

export const FontSizeTokenSchema = z.object({
  xs: z.string(),
  sm: z.string(),
  base: z.string(),
  lg: z.string(),
  xl: z.string(),
  '2xl': z.string(),
  '3xl': z.string(),
  '4xl': z.string(),
  '5xl': z.string(),
  '6xl': z.string(),
  '7xl': z.string(),
  '8xl': z.string(),
  '9xl': z.string(),
});

export const FontWeightTokenSchema = z.object({
  thin: z.number(),
  extralight: z.number(),
  light: z.number(),
  normal: z.number(),
  medium: z.number(),
  semibold: z.number(),
  bold: z.number(),
  extrabold: z.number(),
  black: z.number(),
});

export const LineHeightTokenSchema = z.object({
  none: z.string(),
  tight: z.string(),
  snug: z.string(),
  normal: z.string(),
  relaxed: z.string(),
  loose: z.string(),
});

export const LetterSpacingTokenSchema = z.object({
  tighter: z.string(),
  tight: z.string(),
  normal: z.string(),
  wide: z.string(),
  wider: z.string(),
  widest: z.string(),
});

export const TypographyTokenSchema = z.object({
  fontFamily: FontFamilyTokenSchema,
  fontSize: FontSizeTokenSchema,
  fontWeight: FontWeightTokenSchema,
  lineHeight: LineHeightTokenSchema,
  letterSpacing: LetterSpacingTokenSchema,
});

export type TypographyTokens = z.infer<typeof TypographyTokenSchema>;

// ============================================================================
// SHADOW TOKENS
// ============================================================================

export const ShadowTokenSchema = z.object({
  none: z.string(),
  sm: z.string(),
  base: z.string(),
  md: z.string(),
  lg: z.string(),
  xl: z.string(),
  '2xl': z.string(),
  inner: z.string(),
});

export type ShadowTokens = z.infer<typeof ShadowTokenSchema>;

// ============================================================================
// ANIMATION TOKENS
// ============================================================================

export const DurationTokenSchema = z.object({
  instant: z.string(),
  fast: z.string(),
  normal: z.string(),
  slow: z.string(),
  slower: z.string(),
});

export const EasingTokenSchema = z.object({
  linear: z.string(),
  in: z.string(),
  out: z.string(),
  inOut: z.string(),
  bounce: z.string(),
  elastic: z.string(),
});

export const AnimationTokenSchema = z.object({
  duration: DurationTokenSchema,
  easing: EasingTokenSchema,
});

export type AnimationTokens = z.infer<typeof AnimationTokenSchema>;

// ============================================================================
// RADIUS TOKENS
// ============================================================================

export const RadiusTokenSchema = z.object({
  none: z.string(),
  sm: z.string(),
  base: z.string(),
  md: z.string(),
  lg: z.string(),
  xl: z.string(),
  '2xl': z.string(),
  '3xl': z.string(),
  full: z.string(),
});

export type RadiusTokens = z.infer<typeof RadiusTokenSchema>;

// ============================================================================
// BREAKPOINT TOKENS
// ============================================================================

export const BreakpointTokenSchema = z.object({
  xs: z.string(),
  sm: z.string(),
  md: z.string(),
  lg: z.string(),
  xl: z.string(),
  '2xl': z.string(),
});

export type BreakpointTokens = z.infer<typeof BreakpointTokenSchema>;

// ============================================================================
// Z-INDEX TOKENS
// ============================================================================

export const ZIndexTokenSchema = z.object({
  base: z.number(),
  dropdown: z.number(),
  sticky: z.number(),
  fixed: z.number(),
  modalBackdrop: z.number(),
  modal: z.number(),
  popover: z.number(),
  tooltip: z.number(),
  notification: z.number(),
});

export type ZIndexTokens = z.infer<typeof ZIndexTokenSchema>;

// ============================================================================
// COMPLETE DESIGN TOKENS
// ============================================================================

export const DesignTokensSchema = z.object({
  colors: ColorTokenSchema,
  spacing: SpacingTokenSchema,
  typography: TypographyTokenSchema,
  shadows: ShadowTokenSchema,
  animations: AnimationTokenSchema,
  radius: RadiusTokenSchema,
  breakpoints: BreakpointTokenSchema,
  zIndex: ZIndexTokenSchema,
});

export type DesignTokens = z.infer<typeof DesignTokensSchema>;

// ============================================================================
// TOKEN VALIDATION
// ============================================================================

export function validateDesignTokens(tokens: unknown): DesignTokens {
  return DesignTokensSchema.parse(tokens);
}

export function isValidDesignTokens(tokens: unknown): tokens is DesignTokens {
  return DesignTokensSchema.safeParse(tokens).success;
}
