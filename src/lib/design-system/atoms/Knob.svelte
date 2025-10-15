<script lang="ts">
  /**
   * Knob Component - Rotary control with drag interaction
   */
  import { onMount, onDestroy } from 'svelte';
  import { createKnobDrag, mapValueToRotation, formatKnobValue } from '../utils/knobDrag';
  import type { Size } from '../types/design';

  type KnobProps = {
    value: number;
    min?: number;
    max?: number;
    step?: number;
    label?: string;
    unit?: string;
    size?: Size;
    disabled?: boolean;
    bipolar?: boolean;
    sensitivity?: number;
    onchange?: (value: number) => void;
  };

  let {
    value = $bindable(0),
    min = 0,
    max = 127,
    step = 1,
    label = '',
    unit = '',
    size = 'md',
    disabled = false,
    bipolar = false,
    sensitivity = 100,
    onchange
  }: KnobProps = $props();

  let knobElement: SVGElement;
  let dragHandler: ReturnType<typeof createKnobDrag> | null = null;

  const sizeMap = {
    xs: 32,
    sm: 48,
    md: 64,
    lg: 80,
    xl: 96
  };

  const knobSize = $derived(sizeMap[size]);
  const rotation = $derived(mapValueToRotation(value, min, max));
  const displayValue = $derived(formatKnobValue(value, unit));

  function handleChange(newValue: number) {
    value = newValue;
    onchange?.(newValue);
  }

  function handleMouseDown(e: MouseEvent) {
    if (disabled) return;
    dragHandler?.handleMouseDown(e);
  }

  function handleWheel(e: WheelEvent) {
    if (disabled) return;
    dragHandler?.handleWheel(e);
  }

  $effect(() => {
    if (!disabled) {
      dragHandler = createKnobDrag({
        min,
        max,
        value,
        step,
        sensitivity,
        onChange: handleChange
      });
    }

    return () => {
      dragHandler?.cleanup();
    };
  });
</script>

<div
  class="knob-container flex flex-col items-center gap-1 select-none"
  class:opacity-50={disabled}
  class:cursor-not-allowed={disabled}
  class:cursor-ns-resize={!disabled}
>
  <svg
    bind:this={knobElement}
    width={knobSize}
    height={knobSize}
    viewBox="0 0 100 100"
    onmousedown={handleMouseDown}
    onwheel={handleWheel}
    role="slider"
    aria-valuemin={min}
    aria-valuemax={max}
    aria-valuenow={value}
    aria-label={label || 'Knob control'}
    tabindex={disabled ? -1 : 0}
  >
    <!-- Background circle -->
    <circle
      cx="50"
      cy="50"
      r="42"
      fill="var(--color-surface)"
      stroke="var(--color-border)"
      stroke-width="2"
    />

    <!-- Progress arc -->
    <circle
      cx="50"
      cy="50"
      r="42"
      fill="none"
      stroke="url(#knob-gradient)"
      stroke-width="4"
      stroke-linecap="round"
      stroke-dasharray="{((value - min) / (max - min)) * 236} 236"
      transform="rotate(-118 50 50)"
      class="transition-all duration-100"
    />

    <!-- Center fill with glassmorphic effect -->
    <circle
      cx="50"
      cy="50"
      r="35"
      fill="var(--glass-purple-medium)"
      class="glass-strong"
    />

    <!-- Indicator line -->
    <line
      x1="50"
      y1="18"
      x2="50"
      y2="32"
      stroke="var(--color-accent-primary)"
      stroke-width="3"
      stroke-linecap="round"
      transform="rotate({rotation} 50 50)"
      class="transition-transform duration-100"
    />

    <!-- Gradient definition -->
    <defs>
      <linearGradient id="knob-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#a855f7" />
        <stop offset="100%" stop-color="#c084fc" />
      </linearGradient>
    </defs>
  </svg>

  {#if label}
    <span class="text-xs text-white/70 font-medium">{label}</span>
  {/if}

  <span class="text-2xs font-mono text-white/90">{displayValue}</span>
</div>

<style>
  .knob-container {
    font-family: var(--font-sans);
  }
</style>
