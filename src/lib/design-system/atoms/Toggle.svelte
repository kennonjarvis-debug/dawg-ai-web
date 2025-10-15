<script lang="ts">
  /**
   * Toggle Component - On/off switch
   */
  import type { Size } from '../types/design';

  type ToggleProps = {
    checked: boolean;
    label?: string;
    disabled?: boolean;
    size?: Size;
    onchange?: (checked: boolean) => void;
  };

  let {
    checked = $bindable(false),
    label = '',
    disabled = false,
    size = 'md',
    onchange
  }: ToggleProps = $props();

  const sizeMap = {
    xs: { width: 32, height: 16, circle: 12 },
    sm: { width: 40, height: 20, circle: 16 },
    md: { width: 48, height: 24, circle: 20 },
    lg: { width: 56, height: 28, circle: 24 },
    xl: { width: 64, height: 32, circle: 28 }
  };

  const dimensions = $derived(sizeMap[size]);

  function handleClick() {
    if (disabled) return;
    checked = !checked;
    onchange?.(checked);
  }

  function handleKeydown(e: KeyboardEvent) {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }
</script>

<button
  type="button"
  role="switch"
  aria-checked={checked}
  aria-label={label}
  {disabled}
  onclick={handleClick}
  onkeydown={handleKeydown}
  class="
    toggle
    relative
    inline-flex
    items-center
    rounded-full
    transition-colors
    duration-200
    focus:outline-none
    focus-visible:ring-2
    focus-visible:ring-accent-primary
    focus-visible:ring-offset-2
    focus-visible:ring-offset-background-dark
    {checked ? 'glass-purple' : 'glass'}
    {disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
  "
  style="width: {dimensions.width}px; height: {dimensions.height}px;"
>
  <span
    class="
      inline-block
      rounded-full
      bg-white
      transform
      transition-transform
      duration-200
      shadow-md
    "
    style="
      width: {dimensions.circle}px;
      height: {dimensions.circle}px;
      transform: translateX({checked ? dimensions.width - dimensions.circle - 4 : 2}px);
    "
  ></span>
</button>

{#if label}
  <span class="ml-2 text-sm text-white/90">{label}</span>
{/if}

<style>
  .toggle {
    font-family: var(--font-sans);
  }
</style>
