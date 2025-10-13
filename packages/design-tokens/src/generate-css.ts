#!/usr/bin/env node

import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { designTokens } from './tokens.js';
import { DesignTokens } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Generate CSS custom properties from design tokens
 */
function generateCSSVariables(tokens: DesignTokens): string {
  const lines: string[] = [];

  lines.push('/**');
  lines.push(' * DAWG AI Design Tokens - CSS Custom Properties');
  lines.push(' * Auto-generated from design tokens. DO NOT EDIT MANUALLY.');
  lines.push(' * Run `npm run build` in packages/design-tokens to regenerate.');
  lines.push(' */');
  lines.push('');
  lines.push(':root {');
  lines.push('  /* ========================================================================== */');
  lines.push('  /* COLORS */');
  lines.push('  /* ========================================================================== */');
  lines.push('  ');

  // Primary colors
  lines.push('  /* Primary */');
  Object.entries(tokens.colors.primary).forEach(([shade, value]) => {
    lines.push(`  --color-primary-${shade}: ${value};`);
  });
  lines.push('  ');

  // Secondary colors
  lines.push('  /* Secondary */');
  Object.entries(tokens.colors.secondary).forEach(([shade, value]) => {
    lines.push(`  --color-secondary-${shade}: ${value};`);
  });
  lines.push('  ');

  // Accent colors
  lines.push('  /* Accent */');
  Object.entries(tokens.colors.accent).forEach(([shade, value]) => {
    lines.push(`  --color-accent-${shade}: ${value};`);
  });
  lines.push('  ');

  // Neutral colors
  lines.push('  /* Neutral */');
  Object.entries(tokens.colors.neutral).forEach(([shade, value]) => {
    lines.push(`  --color-neutral-${shade}: ${value};`);
  });
  lines.push('  ');

  // Semantic colors
  lines.push('  /* Semantic */');
  Object.entries(tokens.colors.semantic).forEach(([key, value]) => {
    lines.push(`  --color-${key}: ${value};`);
  });

  // Spacing
  lines.push('  ');
  lines.push('  /* ========================================================================== */');
  lines.push('  /* SPACING */');
  lines.push('  /* ========================================================================== */');
  lines.push('  ');
  Object.entries(tokens.spacing).forEach(([key, value]) => {
    lines.push(`  --spacing-${key}: ${value};`);
  });

  // Typography - Font Families
  lines.push('  ');
  lines.push('  /* ========================================================================== */');
  lines.push('  /* TYPOGRAPHY */');
  lines.push('  /* ========================================================================== */');
  lines.push('  ');
  lines.push('  /* Font Families */');
  Object.entries(tokens.typography.fontFamily).forEach(([key, value]) => {
    lines.push(`  --font-${key}: ${value};`);
  });

  // Font Sizes
  lines.push('  ');
  lines.push('  /* Font Sizes */');
  Object.entries(tokens.typography.fontSize).forEach(([key, value]) => {
    lines.push(`  --text-${key}: ${value};`);
  });

  // Font Weights
  lines.push('  ');
  lines.push('  /* Font Weights */');
  Object.entries(tokens.typography.fontWeight).forEach(([key, value]) => {
    lines.push(`  --font-weight-${key}: ${value};`);
  });

  // Line Heights
  lines.push('  ');
  lines.push('  /* Line Heights */');
  Object.entries(tokens.typography.lineHeight).forEach(([key, value]) => {
    lines.push(`  --leading-${key}: ${value};`);
  });

  // Letter Spacing
  lines.push('  ');
  lines.push('  /* Letter Spacing */');
  Object.entries(tokens.typography.letterSpacing).forEach(([key, value]) => {
    lines.push(`  --tracking-${key}: ${value};`);
  });

  // Shadows
  lines.push('  ');
  lines.push('  /* ========================================================================== */');
  lines.push('  /* SHADOWS */');
  lines.push('  /* ========================================================================== */');
  lines.push('  ');
  Object.entries(tokens.shadows).forEach(([key, value]) => {
    lines.push(`  --shadow-${key}: ${value};`);
  });

  // Animations - Durations
  lines.push('  ');
  lines.push('  /* ========================================================================== */');
  lines.push('  /* ANIMATIONS */');
  lines.push('  /* ========================================================================== */');
  lines.push('  ');
  lines.push('  /* Durations */');
  Object.entries(tokens.animations.duration).forEach(([key, value]) => {
    lines.push(`  --duration-${key}: ${value};`);
  });

  // Easing
  lines.push('  ');
  lines.push('  /* Easing */');
  Object.entries(tokens.animations.easing).forEach(([key, value]) => {
    lines.push(`  --ease-${key}: ${value};`);
  });

  // Radius
  lines.push('  ');
  lines.push('  /* ========================================================================== */');
  lines.push('  /* RADIUS */');
  lines.push('  /* ========================================================================== */');
  lines.push('  ');
  Object.entries(tokens.radius).forEach(([key, value]) => {
    lines.push(`  --radius-${key}: ${value};`);
  });

  // Breakpoints
  lines.push('  ');
  lines.push('  /* ========================================================================== */');
  lines.push('  /* BREAKPOINTS */');
  lines.push('  /* ========================================================================== */');
  lines.push('  ');
  Object.entries(tokens.breakpoints).forEach(([key, value]) => {
    lines.push(`  --breakpoint-${key}: ${value};`);
  });

  // Z-Index
  lines.push('  ');
  lines.push('  /* ========================================================================== */');
  lines.push('  /* Z-INDEX */');
  lines.push('  /* ========================================================================== */');
  lines.push('  ');
  Object.entries(tokens.zIndex).forEach(([key, value]) => {
    lines.push(`  --z-${key}: ${value};`);
  });

  lines.push('}');
  lines.push('');

  return lines.join('\n');
}

// Generate and write CSS file
const css = generateCSSVariables(designTokens);
const outputPath = join(__dirname, '..', 'dist', 'tokens.css');

try {
  writeFileSync(outputPath, css, 'utf-8');
  console.log('✅ Generated CSS variables:', outputPath);
} catch (error) {
  console.error('❌ Failed to generate CSS variables:', error);
  process.exit(1);
}
