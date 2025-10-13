<script lang="ts">
  import type { TrackListProps } from '../../types';
  import { cn } from '../../utils/cn';
  import Button from '../atoms/Button.svelte';
  import Icon from '../atoms/Icon.svelte';
  import TrackHeader from '../molecules/TrackHeader.svelte';

  let {
    tracks = [],
    selectedTrackId = '',
    onTrackSelect,
    onTrackAdd,
    onTrackDelete,
    onTrackReorder,
    class: className
  }: TrackListProps = $props();

  let draggedIndex = $state<number | null>(null);

  function handleTrackClick(trackId: string) {
    if (onTrackSelect) {
      onTrackSelect(trackId);
    }
  }

  function handleDragStart(e: DragEvent, index: number) {
    draggedIndex = index;
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
    }
  }

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'move';
    }
  }

  function handleDrop(e: DragEvent, dropIndex: number) {
    e.preventDefault();

    if (draggedIndex !== null && draggedIndex !== dropIndex && onTrackReorder) {
      onTrackReorder(draggedIndex, dropIndex);
    }

    draggedIndex = null;
  }
</script>

<div class={cn('track-list', className)}>
  <div class="track-list-header">
    <h3 class="track-list-title">Tracks</h3>
    {#if onTrackAdd}
      <Button variant="primary" size="sm" onclick={onTrackAdd}>
        <Icon name="add" size="sm" />
        Add Track
      </Button>
    {/if}
  </div>

  <div class="tracks">
    {#each tracks as track, index (track.id)}
      <div
        class="track-item"
        class:selected={track.id === selectedTrackId}
        class:dragging={draggedIndex === index}
        draggable="true"
        ondragstart={(e) => handleDragStart(e, index)}
        ondragover={handleDragOver}
        ondrop={(e) => handleDrop(e, index)}
        onclick={() => handleTrackClick(track.id)}
        role="button"
        tabindex="0"
      >
        <div class="drag-handle">
          <Icon name="chevronUp" size="sm" />
          <Icon name="chevronDown" size="sm" />
        </div>

        <TrackHeader
          name={track.name}
          color={track.color}
          muted={track.muted}
          solo={track.solo}
          armed={track.armed}
        />

        {#if onTrackDelete}
          <Button
            variant="ghost"
            size="sm"
            onclick={(e) => {
              e.stopPropagation();
              onTrackDelete(track.id);
            }}
            aria-label="Delete track"
            class="delete-btn"
          >
            <Icon name="remove" size="sm" />
          </Button>
        {/if}
      </div>
    {/each}

    {#if tracks.length === 0}
      <div class="empty-state">
        <p>No tracks yet</p>
        {#if onTrackAdd}
          <Button variant="primary" size="sm" onclick={onTrackAdd}>
            <Icon name="add" size="sm" />
            Create your first track
          </Button>
        {/if}
      </div>
    {/if}
  </div>
</div>

<style>
  .track-list {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-3);
    padding: var(--spacing-4);
    background: var(--color-bg-primary);
    border-radius: var(--radius-md);
  }

  .track-list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: var(--spacing-2);
    border-bottom: 1px solid var(--color-text-tertiary);
  }

  .track-list-title {
    margin: 0;
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-bold);
    color: var(--color-text-primary);
  }

  .tracks {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-2);
  }

  .track-item {
    display: flex;
    align-items: center;
    gap: var(--spacing-2);
    padding: var(--spacing-2);
    background: var(--color-bg-secondary);
    border: 2px solid transparent;
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .track-item:hover {
    background: var(--color-bg-tertiary);
  }

  .track-item.selected {
    border-color: var(--color-accent-primary);
    box-shadow: 0 0 0 1px var(--color-accent-primary);
  }

  .track-item.dragging {
    opacity: 0.5;
  }

  .drag-handle {
    display: flex;
    flex-direction: column;
    gap: 0;
    color: var(--color-text-tertiary);
    cursor: grab;
  }

  .drag-handle:active {
    cursor: grabbing;
  }

  .delete-btn {
    margin-left: auto;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-4);
    min-height: 200px;
    padding: var(--spacing-8);
    color: var(--color-text-tertiary);
    text-align: center;
  }

  .empty-state p {
    margin: 0;
    font-size: var(--font-size-lg);
  }
</style>
