<script lang="ts">
  import type { FaderChannelProps } from '../../types';
  import { cn } from '../../utils/cn';
  import Fader from '../atoms/Fader.svelte';
  import Meter from '../atoms/Meter.svelte';

  let {
    value = $bindable(0),
    label,
    meterLevel = 0,
    color = 'var(--color-accent-primary)',
    onchange,
    class: className
  }: FaderChannelProps = $props();

  function handleFaderChange(newValue: number) {
    value = newValue;
    if (onchange) {
      onchange(newValue);
    }
  }
</script>

<div class={cn('fader-channel', className)}>
  <div class="channel-header" style="border-top: 3px solid {color};">
    <span class="channel-label">{label}</span>
  </div>

  <div class="channel-meters">
    <Meter level={meterLevel} height={150} width={12} />
    <Fader
      bind:value={value}
      height={150}
      onchange={handleFaderChange}
    />
  </div>
</div>

<style>
  .fader-channel {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-2);
    padding: var(--spacing-3);
    background: var(--color-bg-secondary);
    border-radius: var(--radius-sm);
    min-width: 80px;
  }

  .channel-header {
    width: 100%;
    padding-top: var(--spacing-1);
  }

  .channel-label {
    display: block;
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    color: var(--color-text-primary);
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .channel-meters {
    display: flex;
    align-items: flex-end;
    gap: var(--spacing-3);
  }
</style>
