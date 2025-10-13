<script lang="ts">
  import type { MeterProps } from '../../types';
  import { cn } from '../../utils/cn';

  let {
    level = 0,
    peaks = [],
    orientation = 'vertical',
    height = 200,
    width = 20,
    class: className
  }: MeterProps = $props();

  // Convert linear level (0-1) to dB
  const levelDb = $derived(level > 0 ? 20 * Math.log10(level) : -Infinity);

  // Normalize level to 0-1 range for display (-60dB to 0dB)
  const normalizedLevel = $derived(Math.max(0, Math.min(1, (levelDb + 60) / 60)));

  // Color thresholds
  const getSegmentColor = (position: number): string => {
    if (position > 0.9) return 'var(--color-meter-red)';
    if (position > 0.7) return 'var(--color-meter-yellow)';
    return 'var(--color-meter-green)';
  };

  // Create meter segments
  const segments = $derived(
    Array.from({ length: 20 }, (_, i) => {
      const position = (i + 1) / 20;
      const isActive = position <= normalizedLevel;
      return {
        position,
        isActive,
        color: getSegmentColor(position)
      };
    })
  );

  const containerStyle = $derived(
    orientation === 'vertical'
      ? `height: ${height}px; width: ${width}px;`
      : `width: ${height}px; height: ${width}px;`
  );
</script>

<div
  class={cn('meter', orientation, className)}
  style={containerStyle}
  role="meter"
  aria-label="Audio level meter"
  aria-valuemin={-60}
  aria-valuemax={0}
  aria-valuenow={levelDb}
>
  <div class="meter-track">
    {#each segments as segment, i}
      <div
        class="meter-segment"
        class:active={segment.isActive}
        style="background-color: {segment.isActive ? segment.color : 'var(--color-bg-tertiary)'};"
      />
    {/each}
  </div>

  <!-- Peak indicator -->
  {#if peaks && peaks.length > 0}
    <div
      class="meter-peak"
      style={orientation === 'vertical'
        ? `bottom: ${Math.max(...peaks) * 100}%;`
        : `left: ${Math.max(...peaks) * 100}%;`
      }
    />
  {/if}
</div>

<style>
  .meter {
    position: relative;
    background: var(--color-bg-secondary);
    border-radius: var(--radius-sm);
    overflow: hidden;
  }

  .meter-track {
    display: flex;
    width: 100%;
    height: 100%;
    gap: 1px;
  }

  .meter.vertical .meter-track {
    flex-direction: column-reverse;
  }

  .meter.horizontal .meter-track {
    flex-direction: row;
  }

  .meter-segment {
    flex: 1;
    background: var(--color-bg-tertiary);
    transition: background-color 0.05s ease-out;
  }

  .meter-segment.active {
    box-shadow: 0 0 2px currentColor;
  }

  .meter-peak {
    position: absolute;
    background: var(--color-error);
    box-shadow: 0 0 4px var(--color-error);
    transition: all 0.1s ease-out;
  }

  .meter.vertical .meter-peak {
    left: 0;
    right: 0;
    height: 2px;
  }

  .meter.horizontal .meter-peak {
    top: 0;
    bottom: 0;
    width: 2px;
  }
</style>
