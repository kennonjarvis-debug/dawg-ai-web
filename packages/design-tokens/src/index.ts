/**
 * @dawg-ai/design-tokens
 *
 * Design tokens with TypeScript types for DAWG AI.
 * Provides type-safe access to design tokens and CSS variable generation.
 */

export * from './types';
export * from './tokens';

// Re-export for convenience
export { designTokens as tokens } from './tokens';
export { validateDesignTokens, isValidDesignTokens } from './types';
