<script lang="ts">
  /**
   * Button Component - Glassmorphic purple design
   */
  import type { ButtonVariant, Size } from '../types/design';

  type ButtonProps = {
    variant?: ButtonVariant;
    size?: Size;
    disabled?: boolean;
    loading?: boolean;
    fullWidth?: boolean;
    class?: string;
    type?: 'button' | 'submit' | 'reset';
    onclick?: () => void;
  };

  let {
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    fullWidth = false,
    class: className = '',
    type = 'button',
    onclick,
    children
  }: ButtonProps = $props();

  const sizeClasses = {
    xs: 'px-2 py-1 text-2xs',
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg'
  };

  const variantClasses = {
    primary: 'glass-purple text-white hover:brightness-110 active:brightness-90',
    secondary: 'glass text-white hover:bg-white/10 active:bg-white/5',
    ghost: 'bg-transparent text-white hover:bg-white/5 active:bg-white/10',
    danger: 'bg-danger/80 text-white hover:bg-danger active:bg-danger/70'
  };
</script>

<button
  {type}
  disabled={disabled || loading}
  onclick={onclick}
  class="
    relative
    font-medium
    rounded-control
    transition-all
    duration-200
    focus:outline-none
    focus-visible:ring-2
    focus-visible:ring-accent-primary
    focus-visible:ring-offset-2
    focus-visible:ring-offset-background-dark
    disabled:opacity-50
    disabled:cursor-not-allowed
    {sizeClasses[size]}
    {variantClasses[variant]}
    {fullWidth ? 'w-full' : ''}
    {className}
  "
  aria-busy={loading}
>
  {#if loading}
    <span class="absolute inset-0 flex items-center justify-center">
      <span class="animate-pulse">⏳</span>
    </span>
    <span class="invisible">{@render children?.()}</span>
  {:else}
    {@render children?.()}
  {/if}
</button>

<style>
  button {
    font-family: var(--font-sans);
  }
</style>
