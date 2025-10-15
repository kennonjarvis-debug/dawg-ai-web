<script lang="ts">
  /**
   * Fader Component - Vertical slider control
   */
  import { onMount } from 'svelte';
  import { createFaderDrag, mapValueToPosition, formatFaderValue } from '../utils/faderDrag';

  type FaderProps = {
    value: number;
    min?: number;
    max?: number;
    step?: number;
    label?: string;
    unit?: string;
    height?: number;
    width?: number;
    disabled?: boolean;
    showValue?: boolean;
    onchange?: (value: number) => void;
  };

  let {
    value = $bindable(0),
    min = -90,
    max = 12,
    step = 0.1,
    label = '',
    unit = 'dB',
    height = 200,
    width = 40,
    disabled = false,
    showValue = true,
    onchange
  }: FaderProps = $props();

  let trackElement: HTMLDivElement;
  let dragHandler: ReturnType<typeof createFaderDrag> | null = null;

  const position = $derived(mapValueToPosition(value, min, max));
  const thumbPosition = $derived(`${(1 - position) * 100}%`);
  const fillHeight = $derived(`${position * 100}%`);
  const displayValue = $derived(formatFaderValue(value, unit));

  function handleChange(newValue: number) {
    value = newValue;
    onchange?.(newValue);
  }

  function handleMouseDown(e: MouseEvent) {
    if (disabled) return;
    dragHandler?.handleMouseDown(e);
  }

  function handleTrackClick(e: MouseEvent) {
    if (disabled) return;
    dragHandler?.handleTrackClick(e, trackElement);
  }

  function handleWheel(e: WheelEvent) {
    if (disabled) return;
    dragHandler?.handleWheel(e);
  }

  $effect(() => {
    if (!disabled) {
      dragHandler = createFaderDrag({
        min,
        max,
        value,
        step,
        height,
        onChange: handleChange
      });
    }

    return () => {
      dragHandler?.cleanup();
    };
  });
</script>

<div
  class="fader-container flex flex-col items-center gap-2 select-none"
  class:opacity-50={disabled}
  class:cursor-not-allowed={disabled}
  style="width: {width}px;"
>
  {#if label}
    <span class="text-2xs text-white/70 font-medium text-center">{label}</span>
  {/if}

  <div
    class="fader-track relative glass rounded-control overflow-hidden"
    bind:this={trackElement}
    style="width: 12px; height: {height}px;"
    onclick={handleTrackClick}
    onwheel={handleWheel}
    role="slider"
    aria-valuemin={min}
    aria-valuemax={max}
    aria-valuenow={value}
    aria-label={label || 'Fader control'}
    tabindex={disabled ? -1 : 0}
  >
    <!-- Fill -->
    <div
      class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-accent-primary to-accent-secondary transition-all duration-100"
      style="height: {fillHeight};"
    ></div>

    <!-- Thumb -->
    <div
      class="absolute left-1/2 -translate-x-1/2 w-8 h-6 glass-purple rounded-control cursor-ns-resize transition-all duration-100 shadow-glass-md"
      style="top: {thumbPosition}; transform: translate(-50%, -50%);"
      onmousedown={handleMouseDown}
    >
      <!-- Grip lines -->
      <div class="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
        <div class="w-4 h-0.5 bg-white/30 rounded-full"></div>
        <div class="w-4 h-0.5 bg-white/30 rounded-full"></div>
        <div class="w-4 h-0.5 bg-white/30 rounded-full"></div>
      </div>
    </div>
  </div>

  {#if showValue}
    <span class="text-2xs font-mono text-white/90">{displayValue}</span>
  {/if}
</div>

<style>
  .fader-container {
    font-family: var(--font-sans);
  }
</style>
