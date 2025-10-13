import { describe, it, expect } from 'vitest';
import { cn } from './cn';

describe('cn utility', () => {
  it('merges class names', () => {
    const result = cn('foo', 'bar');
    expect(result).toBe('foo bar');
  });

  it('handles conditional classes', () => {
    const result = cn('foo', false && 'bar', 'baz');
    expect(result).toBe('foo baz');
  });

  it('handles Tailwind class conflicts', () => {
    const result = cn('px-2', 'px-4');
    // Should keep only the last px value
    expect(result).toBe('px-4');
  });

  it('handles arrays', () => {
    const result = cn(['foo', 'bar'], 'baz');
    expect(result).toBe('foo bar baz');
  });

  it('handles objects', () => {
    const result = cn({ foo: true, bar: false, baz: true });
    expect(result).toBe('foo baz');
  });

  it('handles mixed inputs', () => {
    const result = cn('foo', ['bar', 'baz'], { qux: true, quux: false }, 'quuz');
    expect(result).toBe('foo bar baz qux quuz');
  });
});
