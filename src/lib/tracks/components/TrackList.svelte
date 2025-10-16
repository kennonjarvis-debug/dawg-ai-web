<script lang="ts">
  /**
   * TrackList - Main track list with drag-and-drop reordering
   */
  import { trackManager, orderedTracks } from '../trackManagerStore';
  import TrackRow from './TrackRow.svelte';
  import { Button, Icon, Label } from '$lib/design-system';
  import type { TrackType } from '../types';

  let showAddMenu = $state(false);

  function handleAddTrack(type: TrackType) {
    trackManager.createTrack(type);
    showAddMenu = false;
  }

  function handleDragStart(e: DragEvent, trackId: string) {
    if (!e.dataTransfer) return;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', trackId);
  }

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    if (!e.dataTransfer) return;
    e.dataTransfer.dropEffect = 'move';
  }

  function handleDrop(e: DragEvent, targetTrackId: string) {
    e.preventDefault();
    if (!e.dataTransfer) return;

    const sourceTrackId = e.dataTransfer.getData('text/plain');
    const targetIndex = $orderedTracks.findIndex(t => t.id === targetTrackId);

    if (targetIndex !== -1) {
      trackManager.reorderTrack(sourceTrackId, targetIndex);
    }
  }
</script>

<div class="track-list glass-strong rounded-panel">
  <!-- Header -->
  <div class="track-list-header glass rounded-control p-4 mb-2 flex items-center justify-between">
    <Label size="lg" weight="bold">Tracks ({$orderedTracks.length})</Label>

    <div class="relative">
      <Button
        variant="primary"
        size="sm"
        onclick={() => showAddMenu = !showAddMenu}
      >
        <Icon name="plus" size="sm" />
        <span class="ml-2">Add Track</span>
      </Button>

      {#if showAddMenu}
        <div class="add-menu glass-purple rounded-control p-2 absolute right-0 mt-2 z-10 min-w-48">
          <button
            class="menu-item"
            onclick={() => handleAddTrack('audio')}
          >
            <Icon name="audio" size="sm" />
            <span>Audio Track</span>
          </button>
          <button
            class="menu-item"
            onclick={() => handleAddTrack('midi')}
          >
            <Icon name="midi" size="sm" />
            <span>MIDI Track</span>
          </button>
          <button
            class="menu-item"
            onclick={() => handleAddTrack('aux')}
          >
            <Icon name="volume" size="sm" />
            <span>Aux Track</span>
          </button>
          <button
            class="menu-item"
            onclick={() => handleAddTrack('folder')}
          >
            <Icon name="folder" size="sm" />
            <span>Folder</span>
          </button>
        </div>
      {/if}
    </div>
  </div>

  <!-- Tracks -->
  <div class="tracks-container">
    {#if $orderedTracks.length === 0}
      <div class="empty-state glass rounded-control p-12 text-center">
        <Icon name="waveform" size="xl" class="mb-4 opacity-30" />
        <Label size="lg" color="var(--color-text-secondary)" class="block mb-2">
          No tracks yet
        </Label>
        <Label size="sm" color="var(--color-text-tertiary)">
          Click "Add Track" to get started
        </Label>
      </div>
    {:else}
      {#each $orderedTracks as track (track.id)}
        <div
          draggable="true"
          ondragstart={(e) => handleDragStart(e, track.id)}
          ondragover={handleDragOver}
          ondrop={(e) => handleDrop(e, track.id)}
        >
          <TrackRow {track} />
        </div>
      {/each}
    {/if}
  </div>
</div>

<style>
  .track-list {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 400px;
  }

  .tracks-container {
    flex: 1;
    overflow-y: auto;
    padding: 4px;
  }

  .add-menu {
    display: flex;
    flex-direction: column;
    gap: 2px;
    box-shadow: var(--shadow-glass-lg);
  }

  .menu-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    text-align: left;
    font-size: 14px;
    border-radius: var(--radius-control);
    transition: all 0.2s;
    cursor: pointer;
    background: transparent;
    border: none;
    color: var(--color-text-primary);
    font-family: var(--font-sans);
  }

  .menu-item:hover {
    background: rgba(168, 85, 247, 0.2);
  }

  .empty-state {
    margin: 32px auto;
    max-width: 400px;
  }
</style>
