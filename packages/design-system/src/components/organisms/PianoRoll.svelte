<script lang="ts">
  import type { PianoRollProps, MidiNote } from '../../types';
  import { cn } from '../../utils/cn';
  import Button from '../atoms/Button.svelte';
  import Icon from '../atoms/Icon.svelte';

  let {
    notes = [],
    duration,
    selectedNotes = [],
    onNoteAdd,
    onNoteUpdate,
    onNoteDelete,
    onSelectionChange,
    class: className
  }: PianoRollProps = $props();

  let pianoRollElement = $state<HTMLDivElement>();
  let zoom = $state(1);

  const PIANO_KEYS = 128; // MIDI range
  const KEY_HEIGHT = 20;
  const BEAT_WIDTH = 100;

  function handleCanvasClick(e: MouseEvent) {
    if (!pianoRollElement || !onNoteAdd) return;

    const rect = pianoRollElement.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const pitch = PIANO_KEYS - 1 - Math.floor(y / KEY_HEIGHT);
    const start = (x / BEAT_WIDTH) * zoom;

    const newNote: MidiNote = {
      id: `note-${Date.now()}`,
      pitch,
      start,
      duration: 0.25, // Quarter note
      velocity: 100
    };

    onNoteAdd(newNote);
  }

  function handleNoteClick(e: MouseEvent, noteId: string) {
    e.stopPropagation();

    if (e.shiftKey) {
      const newSelection = selectedNotes.includes(noteId)
        ? selectedNotes.filter(id => id !== noteId)
        : [...selectedNotes, noteId];

      if (onSelectionChange) {
        onSelectionChange(newSelection);
      }
    } else {
      if (onSelectionChange) {
        onSelectionChange([noteId]);
      }
    }
  }

  function handleZoomIn() {
    zoom = Math.min(zoom * 1.5, 10);
  }

  function handleZoomOut() {
    zoom = Math.max(zoom / 1.5, 0.1);
  }

  function getNoteColor(pitch: number): string {
    const note = pitch % 12;
    // Black keys
    if ([1, 3, 6, 8, 10].includes(note)) {
      return 'var(--color-accent-secondary)';
    }
    // White keys
    return 'var(--color-accent-primary)';
  }

  function isBlackKey(pitch: number): boolean {
    const note = pitch % 12;
    return [1, 3, 6, 8, 10].includes(note);
  }
</script>

<div class={cn('piano-roll', className)}>
  <div class="piano-roll-header">
    <h3 class="piano-roll-title">Piano Roll</h3>

    <div class="piano-roll-controls">
      <Button variant="ghost" size="sm" onclick={handleZoomOut}>
        <Icon name="remove" size="sm" />
      </Button>
      <span class="zoom-level">{(zoom * 100).toFixed(0)}%</span>
      <Button variant="ghost" size="sm" onclick={handleZoomIn}>
        <Icon name="add" size="sm" />
      </Button>
    </div>
  </div>

  <div class="piano-roll-container">
    <!-- Piano keys (sidebar) -->
    <div class="piano-keys">
      {#each Array(PIANO_KEYS) as _, i}
        {@const pitch = PIANO_KEYS - 1 - i}
        <div
          class="piano-key"
          class:black={isBlackKey(pitch)}
          style="height: {KEY_HEIGHT}px"
        >
          {#if pitch % 12 === 0}
            <span class="note-label">C{Math.floor(pitch / 12) - 1}</span>
          {/if}
        </div>
      {/each}
    </div>

    <!-- Note grid -->
    <div
      class="note-grid"
      bind:this={pianoRollElement}
      onclick={handleCanvasClick}
      style="height: {PIANO_KEYS * KEY_HEIGHT}px"
    >
      <!-- Grid lines -->
      <svg class="grid-lines" width="100%" height="100%">
        {#each Array(Math.ceil(duration / zoom)) as _, i}
          <line
            x1="{i * BEAT_WIDTH}px"
            y1="0"
            x2="{i * BEAT_WIDTH}px"
            y2="100%"
            stroke="var(--color-text-tertiary)"
            stroke-width="1"
            opacity="0.2"
          />
        {/each}

        {#each Array(PIANO_KEYS) as _, i}
          <line
            x1="0"
            y1="{i * KEY_HEIGHT}px"
            x2="100%"
            y2="{i * KEY_HEIGHT}px"
            stroke="var(--color-text-tertiary)"
            stroke-width="1"
            opacity="0.1"
          />
        {/each}
      </svg>

      <!-- Notes -->
      {#each notes as note (note.id)}
        {@const y = (PIANO_KEYS - 1 - note.pitch) * KEY_HEIGHT}
        {@const x = (note.start / zoom) * BEAT_WIDTH}
        {@const width = (note.duration / zoom) * BEAT_WIDTH}

        <div
          class="midi-note"
          class:selected={selectedNotes.includes(note.id)}
          style="
            left: {x}px;
            top: {y}px;
            width: {width}px;
            height: {KEY_HEIGHT - 2}px;
            background-color: {getNoteColor(note.pitch)};
            opacity: {note.velocity / 127};
          "
          onclick={(e) => handleNoteClick(e, note.id)}
          ondblclick={() => onNoteDelete && onNoteDelete(note.id)}
          role="button"
          tabindex="0"
          aria-label={`Note ${note.pitch}, start ${note.start.toFixed(2)}`}
        >
          <div class="note-resize-handle left"></div>
          <div class="note-resize-handle right"></div>
        </div>
      {/each}
    </div>
  </div>
</div>

<style>
  .piano-roll {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-3);
    background: var(--color-bg-primary);
    border-radius: var(--radius-md);
    padding: var(--spacing-4);
  }

  .piano-roll-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .piano-roll-title {
    margin: 0;
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-bold);
    color: var(--color-text-primary);
  }

  .piano-roll-controls {
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

  .piano-roll-container {
    display: flex;
    overflow: auto;
    max-height: 600px;
    background: var(--color-bg-secondary);
    border-radius: var(--radius-sm);
  }

  .piano-keys {
    position: sticky;
    left: 0;
    z-index: var(--z-sticky);
    background: var(--color-bg-tertiary);
  }

  .piano-key {
    display: flex;
    align-items: center;
    padding: 0 var(--spacing-2);
    border-bottom: 1px solid var(--color-bg-primary);
    background: var(--color-bg-secondary);
    font-size: var(--font-size-xs);
    color: var(--color-text-tertiary);
  }

  .piano-key.black {
    background: var(--color-bg-tertiary);
  }

  .note-label {
    font-family: var(--font-family-mono);
  }

  .note-grid {
    position: relative;
    flex: 1;
    min-width: 1000px;
    cursor: crosshair;
  }

  .grid-lines {
    position: absolute;
    top: 0;
    left: 0;
    pointer-events: none;
  }

  .midi-note {
    position: absolute;
    background: var(--color-accent-primary);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 2px;
    cursor: move;
    transition: transform var(--transition-fast);
  }

  .midi-note:hover {
    transform: scale(1.02);
    z-index: 1;
  }

  .midi-note.selected {
    border: 2px solid var(--color-text-primary);
    box-shadow: 0 0 4px var(--color-accent-primary);
    z-index: 2;
  }

  .note-resize-handle {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 4px;
    background: rgba(255, 255, 255, 0.5);
    cursor: ew-resize;
    opacity: 0;
    transition: opacity var(--transition-fast);
  }

  .note-resize-handle.left {
    left: 0;
  }

  .note-resize-handle.right {
    right: 0;
  }

  .midi-note:hover .note-resize-handle {
    opacity: 1;
  }
</style>
