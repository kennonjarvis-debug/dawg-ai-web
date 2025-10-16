<script lang="ts">
  /**
   * WaveformDisplay - Canvas-based audio waveform visualization
   */
  import { onMount } from 'svelte';
  import { setupCanvas, drawGradientWaveform, clearCanvas } from '../utils/canvasUtils';

  type WaveformDisplayProps = {
    audioBuffer?: AudioBuffer;
    width: number;
    height: number;
    color?: string;
    backgroundColor?: string;
    showGrid?: boolean;
    gridColor?: string;
    zoom?: number;
    offset?: number;
  };

  let {
    audioBuffer,
    width,
    height,
    color = '#a855f7',
    backgroundColor = 'transparent',
    showGrid = false,
    gridColor = 'rgba(255, 255, 255, 0.05)',
    zoom = 1,
    offset = 0
  }: WaveformDisplayProps = $props();

  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D | null = null;

  onMount(() => {
    ctx = setupCanvas(canvas, width, height);
  });

  $effect(() => {
    if (!ctx) return;

    clearCanvas(ctx, width, height, backgroundColor);

    if (audioBuffer) {
      drawGradientWaveform(
        ctx,
        audioBuffer,
        width,
        height,
        { start: color, end: '#c084fc' }
      );
    } else {
      // Draw empty state
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();
    }
  });
</script>

<div class="waveform-display glass rounded-control p-2">
  <canvas
    bind:this={canvas}
    class="waveform-canvas"
    role="img"
    aria-label="Audio waveform visualization"
  ></canvas>

  {#if !audioBuffer}
    <div class="absolute inset-0 flex items-center justify-center">
      <span class="text-sm text-white/30">No audio loaded</span>
    </div>
  {/if}
</div>

<style>
  .waveform-display {
    position: relative;
    overflow: hidden;
  }

  .waveform-canvas {
    display: block;
  }
</style>
