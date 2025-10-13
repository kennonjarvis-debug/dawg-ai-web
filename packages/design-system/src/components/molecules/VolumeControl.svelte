<script lang="ts">
  import type { VolumeControlProps } from '../../types';
  import { cn } from '../../utils/cn';
  import Fader from '../atoms/Fader.svelte';
  import Input from '../atoms/Input.svelte';
  import Icon from '../atoms/Icon.svelte';

  let {
    value = $bindable(0.75),
    showFader = true,
    showNumeric = true,
    onchange,
    class: className
  }: VolumeControlProps = $props();

  const volumeDb = $derived((20 * Math.log10(value || 0.001)).toFixed(1));

  function handleFaderChange(newValue: number) {
    value = newValue;
    if (onchange) {
      onchange(newValue);
    }
  }

  function handleNumericChange(newValue: string | number) {
    const db = typeof newValue === 'number' ? newValue : parseFloat(newValue);
    if (!isNaN(db)) {
      // Convert dB to linear (0dB = 1.0, -60dB = 0.001)
      value = Math.pow(10, db / 20);
      if (onchange) {
        onchange(value);
      }
    }
  }

  function handleMute() {
    value = 0;
    if (onchange) {
      onchange(0);
    }
  }
</script>

<div class={cn('volume-control', className)}>
  {#if showFader}
    <Fader
      bind:value={value}
      label="Volume"
      height={150}
      onchange={handleFaderChange}
    />
  {/if}

  {#if showNumeric}
    <div class="numeric-controls">
      <Input
        type="number"
        value={parseFloat(volumeDb)}
        step={0.1}
        min={-60}
        max={6}
        oninput={handleNumericChange}
        class="volume-input"
      />
      <span class="unit">dB</span>

      <button
        class="mute-btn"
        class:muted={value === 0}
        onclick={handleMute}
        aria-label="Mute"
      >
        <Icon name={value === 0 ? 'mute' : 'volume'} size="sm" />
      </button>
    </div>
  {/if}
</div>

<style>
  .volume-control {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-3);
    padding: var(--spacing-3);
    background: var(--color-bg-secondary);
    border-radius: var(--radius-sm);
  }

  .numeric-controls {
    display: flex;
    align-items: center;
    gap: var(--spacing-2);
  }

  .volume-input {
    width: 80px;
  }

  .unit {
    font-size: var(--font-size-sm);
    font-family: var(--font-family-mono);
    color: var(--color-text-secondary);
  }

  .mute-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    color: var(--color-text-primary);
    background: var(--color-bg-tertiary);
    border: 1px solid var(--color-text-tertiary);
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .mute-btn:hover {
    border-color: var(--color-accent-primary);
  }

  .mute-btn.muted {
    color: var(--color-error);
    border-color: var(--color-error);
  }

  .mute-btn:focus-visible {
    outline: 2px solid var(--color-accent-primary);
    outline-offset: 2px;
  }
</style>
