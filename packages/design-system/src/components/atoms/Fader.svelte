<script lang="ts">
  import type { FaderProps } from '../../types';
  import { cn } from '../../utils/cn';

  let {
    value = $bindable(0),
    label = '',
    height = 200,
    disabled = false,
    onchange,
    class: className
  }: FaderProps = $props();

  let trackElement = $state<HTMLDivElement>();
  let isDragging = $state(false);

  const displayDb = $derived((20 * Math.log10(value || 0.001)).toFixed(1));

  function updateValue(clientY: number) {
    if (!trackElement || disabled) return;

    const rect = trackElement.getBoundingClientRect();
    const y = clientY - rect.top;
    const percentage = 1 - Math.max(0, Math.min(1, y / rect.height));
    value = percentage;

    if (onchange) {
      onchange(value);
    }
  }

  function handleMouseDown(e: MouseEvent) {
    if (disabled) return;
    isDragging = true;
    updateValue(e.clientY);
    e.preventDefault();
  }

  function handleMouseMove(e: MouseEvent) {
    if (isDragging && !disabled) {
      updateValue(e.clientY);
    }
  }

  function handleMouseUp() {
    isDragging = false;
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (disabled) return;

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        value = Math.min(1, value + 0.05);
        if (onchange) onchange(value);
        break;
      case 'ArrowDown':
        e.preventDefault();
        value = Math.max(0, value - 0.05);
        if (onchange) onchange(value);
        break;
    }
  }
</script>

<svelte:window
  onmousemove={handleMouseMove}
  onmouseup={handleMouseUp}
/>

<div class={cn('fader-container', className)}>
  {#if label}
    <label class="fader-label">{label}</label>
  {/if}

  <div
    class="fader-track"
    class:disabled
    style="height: {height}px"
    bind:this={trackElement}
    onmousedown={handleMouseDown}
    role="slider"
    aria-valuemin={0}
    aria-valuemax={1}
    aria-valuenow={value}
    aria-label={label}
    aria-disabled={disabled}
    tabindex={disabled ? -1 : 0}
    onkeydown={handleKeyDown}
  >
    <div class="fader-fill" style="height: {value * 100}%" />
    <div class="fader-thumb" style="bottom: {value * 100}%" />
  </div>

  <span class="fader-value">{displayDb} dB</span>
</div>

<style>
  .fader-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-2);
  }

  .fader-track {
    position: relative;
    width: 32px;
    background: var(--color-bg-tertiary);
    border-radius: var(--radius-sm);
    cursor: ns-resize;
    user-select: none;
  }

  .fader-track.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .fader-fill {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: var(--color-waveform-progress);
    border-radius: var(--radius-sm);
    pointer-events: none;
    transition: height 0.05s ease-out;
  }

  .fader-thumb {
    position: absolute;
    left: 50%;
    transform: translate(-50%, 50%);
    width: 40px;
    height: 16px;
    background: var(--color-text-primary);
    border: 2px solid var(--color-accent-primary);
    border-radius: var(--radius-sm);
    pointer-events: none;
    transition: bottom 0.05s ease-out;
  }

  .fader-value {
    font-size: var(--font-size-xs);
    font-family: var(--font-family-mono);
    color: var(--color-text-secondary);
    min-width: 50px;
    text-align: center;
  }

  .fader-label {
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
  }

  .fader-track:focus-visible {
    outline: 2px solid var(--color-accent-primary);
    outline-offset: 2px;
  }
</style>
