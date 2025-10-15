<script lang="ts">
  /**
   * Meter Component - VU/Peak level meter
   */
  import { onMount } from 'svelte';
  import { drawMeter, setupCanvas } from '../utils/canvasUtils';

  type MeterType = 'peak' | 'rms' | 'vu';

  type MeterProps = {
    value: number; // -90 to +12 dB
    peak?: number;
    type?: MeterType;
    height?: number;
    width?: number;
    showScale?: boolean;
    showPeak?: boolean;
  };

  let {
    value = -90,
    peak = undefined,
    type = 'peak',
    height = 200,
    width = 24,
    showScale = false,
    showPeak = true
  }: MeterProps = $props();

  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D | null = null;

  // Convert dB to 0-1 range for display
  const normalizedValue = $derived(Math.max(0, Math.min(1, (value + 90) / 102)));
  const normalizedPeak = $derived(
    peak !== undefined ? Math.max(0, Math.min(1, (peak + 90) / 102)) : undefined
  );

  onMount(() => {
    ctx = setupCanvas(canvas, width, height);
  });

  $effect(() => {
    if (ctx) {
      drawMeter(ctx, width, height, normalizedValue, showPeak ? normalizedPeak : undefined);
    }
  });

  // Scale marks in dB
  const scaleMarks = [12, 6, 0, -6, -12, -18, -24, -30, -40, -60];
</script>

<div class="meter-container flex gap-1">
  <canvas
    bind:this={canvas}
    class="meter-canvas rounded-sm"
    role="progressbar"
    aria-valuemin={-90}
    aria-valuemax={12}
    aria-valuenow={value}
    aria-label="Audio level meter"
  ></canvas>

  {#if showScale}
    <div class="meter-scale flex flex-col justify-between text-2xs font-mono text-white/50" style="height: {height}px;">
      {#each scaleMarks as mark}
        <span>{mark > 0 ? '+' : ''}{mark}</span>
      {/each}
    </div>
  {/if}
</div>

<style>
  .meter-container {
    font-family: var(--font-mono);
  }

  .meter-canvas {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
  }
</style>
