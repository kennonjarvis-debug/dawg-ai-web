<script lang="ts">
  import type { ButtonProps } from '../../types';
  import { cn } from '../../utils/cn';

  let {
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    fullWidth = false,
    type = 'button',
    onclick,
    class: className,
    children
  }: ButtonProps & { children?: any } = $props();

  const variantClasses = {
    primary: 'bg-accent-primary text-bg-primary hover:bg-accent-primary/90',
    secondary: 'bg-bg-tertiary text-text-primary hover:bg-bg-tertiary/90 border border-text-tertiary',
    danger: 'bg-error text-white hover:bg-error/90',
    ghost: 'bg-transparent text-text-primary hover:bg-bg-secondary'
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  const buttonClasses = $derived(
    cn(
      'button inline-flex items-center justify-center gap-2 rounded-sm font-medium transition-all duration-[var(--transition-fast)] cursor-pointer border-none',
      variantClasses[variant],
      sizeClasses[size],
      fullWidth && 'w-full',
      (disabled || loading) && 'opacity-50 cursor-not-allowed',
      className
    )
  );
</script>

<button
  class={buttonClasses}
  {type}
  {disabled}
  aria-disabled={disabled || loading}
  aria-busy={loading}
  onclick={onclick}
>
  {#if loading}
    <span class="loading-spinner"></span>
  {/if}
  {@render children?.()}
</button>

<style>
  .loading-spinner {
    width: 1em;
    height: 1em;
    border: 2px solid currentColor;
    border-right-color: transparent;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .button:focus-visible {
    outline: 2px solid var(--color-accent-primary);
    outline-offset: 2px;
  }
</style>
