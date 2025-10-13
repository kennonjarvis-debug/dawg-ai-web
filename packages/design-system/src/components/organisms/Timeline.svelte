<script lang="ts">
  import type { TimelineProps } from '../../types';
  import { cn } from '../../utils/cn';
  import Button from '../atoms/Button.svelte';
  import Icon from '../atoms/Icon.svelte';

  let {
    duration,
    currentTime = $bindable(0),
    waveformData,
    regions = [],
    zoom = $bindable(1),
    onSeek,
    onZoomChange,
    class: className
  }: TimelineProps = $props();

  let timelineElement = $state<HTMLDivElement>();
  let isDragging = $state(false);

  const playheadPosition = $derived((currentTime / duration) * 100);

  function handleClick(e: MouseEvent) {
    if (!timelineElement) return;

    const rect = timelineElement.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * duration;

    currentTime = Math.max(0, Math.min(duration, newTime));

    if (onSeek) {
      onSeek(currentTime);
    }
  }

  function handleZoomIn() {
    zoom = Math.min(zoom * 1.5, 10);
    if (onZoomChange) {
      onZoomChange(zoom);
    }
  }

  function handleZoomOut() {
    zoom = Math.max(zoom / 1.5, 0.1);
    if (onZoomChange) {
      onZoomChange(zoom);
    }
  }

  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  }
</script>

<div class={cn('timeline', className)}>
  <div class="timeline-header">
    <div class="timeline-info">
      <span class="time-display">{formatTime(currentTime)}</span>
      <span class="duration-display">/ {formatTime(duration)}</span>
    </div>

    <div class="timeline-controls">
      <Button variant="ghost" size="sm" onclick={handleZoomOut}>
        <Icon name="remove" size="sm" />
      </Button>
      <span class="zoom-level">{(zoom * 100).toFixed(0)}%</span>
      <Button variant="ghost" size="sm" onclick={handleZoomIn}>
        <Icon name="add" size="sm" />
      </Button>
    </div>
  </div>

  <div
    class="timeline-canvas"
    bind:this={timelineElement}
    onclick={handleClick}
    role="slider"
    aria-label="Timeline"
    aria-valuemin={0}
    aria-valuemax={duration}
    aria-valuenow={currentTime}
  >
    <!-- Waveform background -->
    {#if waveformData}
      <canvas class="waveform-canvas" width="1000" height="100"></canvas>
    {/if}

    <!-- Regions -->
    {#each regions as region (region.id)}
      <div
        class="timeline-region"
        style="left: {(region.start / duration) * 100}%; width: {((region.end - region.start) / duration) * 100}%; background-color: {region.color || 'var(--color-accent-primary)'}"
      >
        {#if region.label}
          <span class="region-label">{region.label}</span>
        {/if}
      </div>
    {/each}

    <!-- Playhead -->
    <div
      class="playhead"
      style="left: {playheadPosition}%"
    >
      <div class="playhead-line"></div>
      <div class="playhead-handle"></div>
    </div>

    <!-- Time markers -->
    <div class="time-markers">
      {#each Array(Math.ceil(duration / zoom)) as _, i}
        <div class="time-marker" style="left: {(i * zoom / duration) * 100}%">
          <span class="marker-label">{formatTime(i * zoom)}</span>
        </div>
      {/each}
    </div>
  </div>
</div>

<style>
  .timeline {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-2);
    background: var(--color-bg-primary);
    border-radius: var(--radius-md);
    padding: var(--spacing-4);
  }

  .timeline-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .timeline-info {
    display: flex;
    align-items: baseline;
    gap: var(--spacing-2);
  }

  .time-display {
    font-size: var(--font-size-lg);
    font-family: var(--font-family-mono);
    font-weight: var(--font-weight-bold);
    color: var(--color-text-primary);
  }

  .duration-display {
    font-size: var(--font-size-sm);
    font-family: var(--font-family-mono);
    color: var(--color-text-secondary);
  }

  .timeline-controls {
    display: flex;
    align-items: center;
    gap: var(--spacing-2);
  }

  .zoom-level {
    min-width: 50px;
    text-align: center;
    font-size: var(--font-size-sm);
    font-family: var(--font-family-mono);
    color: var(--color-text-secondary);
  }

  .timeline-canvas {
    position: relative;
    height: 120px;
    background: var(--color-waveform-bg);
    border-radius: var(--radius-sm);
    cursor: pointer;
    overflow: hidden;
  }

  .waveform-canvas {
    width: 100%;
    height: 100%;
    opacity: 0.5;
  }

  .timeline-region {
    position: absolute;
    top: 0;
    bottom: 0;
    opacity: 0.3;
    display: flex;
    align-items: center;
    padding: 0 var(--spacing-2);
  }

  .region-label {
    font-size: var(--font-size-xs);
    color: var(--color-text-primary);
    font-weight: var(--font-weight-medium);
  }

  .playhead {
    position: absolute;
    top: 0;
    bottom: 0;
    pointer-events: none;
    z-index: var(--z-base + 1);
  }

  .playhead-line {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 2px;
    background: var(--color-accent-primary);
    box-shadow: 0 0 4px var(--color-accent-primary);
  }

  .playhead-handle {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 12px;
    height: 12px;
    background: var(--color-accent-primary);
    border-radius: 50%;
    box-shadow: 0 0 4px var(--color-accent-primary);
  }

  .time-markers {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
  }

  .time-marker {
    position: absolute;
    top: 0;
    bottom: 0;
    border-left: 1px solid var(--color-text-tertiary);
  }

  .marker-label {
    position: absolute;
    top: var(--spacing-1);
    left: var(--spacing-1);
    font-size: var(--font-size-xs);
    font-family: var(--font-family-mono);
    color: var(--color-text-tertiary);
  }
</style>
