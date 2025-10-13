<script lang="ts">
  import type { KnobProps } from '../../types';
  import { cn } from '../../utils/cn';

  let {
    value = $bindable(0),
    label = '',
    min = 0,
    max = 1,
    step = 0.01,
    disabled = false,
    onchange,
    class: className
  }: KnobProps = $props();

  let isDragging = $state(false);
  let startY = $state(0);
  let startValue = $state(0);

  const angle = $derived((value - min) / (max - min) * 270 - 135);
  const displayValue = $derived((value * 100).toFixed(0));

  function handleMouseDown(e: MouseEvent) {
    if (disabled) return;
    isDragging = true;
    startY = e.clientY;
    startValue = value;
    e.preventDefault();
  }

  function handleMouseMove(e: MouseEvent) {
    if (!isDragging || disabled) return;

    const delta = (startY - e.clientY) / 100;
    const newValue = Math.min(max, Math.max(min, startValue + delta * (max - min)));
    value = Math.round(newValue / step) * step;

    if (onchange) {
      onchange(value);
    }
  }

  function handleMouseUp() {
    isDragging = false;
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (disabled) return;

    switch (e.key) {
      case 'ArrowUp':
      case 'ArrowRight':
        e.preventDefault();
        value = Math.min(max, value + step);
        if (onchange) onchange(value);
        break;
      case 'ArrowDown':
      case 'ArrowLeft':
        e.preventDefault();
        value = Math.max(min, value - step);
        if (onchange) onchange(value);
        break;
    }
  }
</script>

<svelte:window
  onmousemove={handleMouseMove}
  onmouseup={handleMouseUp}
/>

<div class={cn('knob-container', className)}>
  {#if label}
    <label class="knob-label">{label}</label>
  {/if}

  <div
    class="knob"
    class:disabled
    role="slider"
    aria-valuemin={min}
    aria-valuemax={max}
    aria-valuenow={value}
    aria-label={label}
    aria-disabled={disabled}
    tabindex={disabled ? -1 : 0}
    onmousedown={handleMouseDown}
    onkeydown={handleKeyDown}
  >
    <svg viewBox="0 0 100 100" class="knob-svg">
      <circle cx="50" cy="50" r="40" class="knob-track" />
      <path
        d="M 50 50 L 50 10"
        class="knob-indicator"
        style="transform: rotate({angle}deg); transform-origin: 50% 50%;"
      />
    </svg>
    <span class="knob-value">{displayValue}</span>
  </div>
</div>

<style>
  .knob-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-2);
  }

  .knob {
    position: relative;
    width: 60px;
    height: 60px;
    cursor: ns-resize;
    user-select: none;
  }

  .knob.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .knob-svg {
    width: 100%;
    height: 100%;
  }

  .knob-track {
    fill: var(--color-bg-tertiary);
    stroke: var(--color-bg-secondary);
    stroke-width: 2;
  }

  .knob-indicator {
    stroke: var(--color-accent-primary);
    stroke-width: 3;
    stroke-linecap: round;
    transition: transform 0.05s ease-out;
  }

  .knob-value {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: var(--font-size-xs);
    color: var(--color-text-secondary);
    pointer-events: none;
    font-family: var(--font-family-mono);
  }

  .knob-label {
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
  }

  .knob:focus-visible {
    outline: 2px solid var(--color-accent-primary);
    outline-offset: 2px;
    border-radius: 50%;
  }
</style>
