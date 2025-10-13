<script lang="ts">
  import type { MixerProps, Track } from '../../types';
  import { cn } from '../../utils/cn';
  import FaderChannel from '../molecules/FaderChannel.svelte';

  let {
    tracks = [],
    onTrackUpdate,
    class: className
  }: MixerProps = $props();

  function handleVolumeChange(trackId: string, volume: number) {
    if (onTrackUpdate) {
      onTrackUpdate(trackId, { volume });
    }
  }
</script>

<div class={cn('mixer', className)}>
  <div class="mixer-header">
    <h3 class="mixer-title">Mixer</h3>
    <span class="track-count">{tracks.length} tracks</span>
  </div>

  <div class="mixer-channels">
    {#each tracks as track (track.id)}
      <FaderChannel
        label={track.name}
        value={track.volume}
        meterLevel={track.meterLevel || 0}
        color={track.color}
        onchange={(value) => handleVolumeChange(track.id, value)}
      />
    {/each}

    {#if tracks.length === 0}
      <div class="empty-state">
        <p>No tracks available</p>
        <span class="empty-hint">Add tracks to see them in the mixer</span>
      </div>
    {/if}
  </div>
</div>

<style>
  .mixer {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-4);
    padding: var(--spacing-4);
    background: var(--color-bg-primary);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-lg);
  }

  .mixer-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: var(--spacing-2);
    border-bottom: 1px solid var(--color-text-tertiary);
  }

  .mixer-title {
    margin: 0;
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-bold);
    color: var(--color-text-primary);
  }

  .track-count {
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
    font-family: var(--font-family-mono);
  }

  .mixer-channels {
    display: flex;
    gap: var(--spacing-3);
    overflow-x: auto;
    padding: var(--spacing-2);
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 200px;
    padding: var(--spacing-8);
    color: var(--color-text-tertiary);
    text-align: center;
  }

  .empty-state p {
    margin: 0 0 var(--spacing-2) 0;
    font-size: var(--font-size-lg);
  }

  .empty-hint {
    font-size: var(--font-size-sm);
  }
</style>
