<script lang="ts">
  /**
   * Label Component - Text labels with various styles
   */
  import type { Size } from '../types/design';

  type LabelProps = {
    size?: Size;
    weight?: 'normal' | 'medium' | 'semibold' | 'bold';
    color?: string;
    mono?: boolean;
    uppercase?: boolean;
    class?: string;
  };

  let {
    size = 'md',
    weight = 'normal',
    color = 'var(--color-text-primary)',
    mono = false,
    uppercase = false,
    class: className = '',
    children
  }: LabelProps = $props();

  const sizeClasses = {
    xs: 'text-2xs',
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  };

  const weightClasses = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold'
  };
</script>

<span
  class="
    label
    {sizeClasses[size]}
    {weightClasses[weight]}
    {mono ? 'font-mono' : 'font-sans'}
    {uppercase ? 'uppercase' : ''}
    {className}
  "
  style="color: {color};"
>
  {@render children?.()}
</span>

<style>
  .label {
    display: inline-block;
  }
</style>
