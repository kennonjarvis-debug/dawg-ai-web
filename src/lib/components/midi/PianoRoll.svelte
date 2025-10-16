<script lang="ts">
/**
 * Piano Roll Component
 * Module 4: MIDI Editor
 *
 * Full-featured piano roll MIDI editor with tools, quantization, and velocity editing
 */

import { onMount, onDestroy } from 'svelte';
import { MIDIEditor, VelocityEditor, type Tool, type GridDivision, type MIDINote } from '$lib/midi';
import { Button, Icon, Toggle } from '$lib/design-system';
import type { UUID } from '$lib/types/core';

export let trackId: UUID;
export let notes: MIDINote[] = [];

let pianoRollCanvas: HTMLCanvasElement;
let velocityCanvas: HTMLCanvasElement;
let editor: MIDIEditor;
let velocityEditor: VelocityEditor;

// Tool state
let tool: Tool = $state('draw');
let gridDivision: GridDivision = $state('1/16');
let snapToGrid = $state(true);
let snapToScale = $state(false);

// Keyboard state
let showKeyboard = $state(true);

// Scale selection
let selectedScale = $state('major');
let rootNote = $state(60); // C4

const scales: Record<string, number[]> = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
  harmonic_minor: [0, 2, 3, 5, 7, 8, 11],
  pentatonic: [0, 2, 4, 7, 9],
  blues: [0, 3, 5, 6, 7, 10],
  chromatic: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
};

onMount(() => {
  // Initialize piano roll editor
  editor = new MIDIEditor(pianoRollCanvas, {
    width: 2400,
    height: 600,
    pixelsPerBeat: 100,
    lowestNote: 24, // C1
    highestNote: 96  // C7
  });

  // Initialize velocity editor
  velocityEditor = new VelocityEditor(velocityCanvas, 100);

  // Set initial notes if provided
  if (notes.length > 0) {
    editor.setNotes(notes);
  }

  // Listen for changes
  pianoRollCanvas.addEventListener('notesChange', handleNotesChange as EventListener);
  velocityCanvas.addEventListener('velocityChange', handleVelocityChange as EventListener);

  // Update velocity editor with initial notes
  updateVelocityEditor();

  return () => {
    pianoRollCanvas.removeEventListener('notesChange', handleNotesChange as EventListener);
    velocityCanvas.removeEventListener('velocityChange', handleVelocityChange as EventListener);
  };
});

function handleNotesChange(e: CustomEvent) {
  notes = e.detail.notes;
  updateVelocityEditor();
}

function handleVelocityChange(e: CustomEvent) {
  notes = e.detail.notes;
  editor.setNotes(notes);
}

function updateVelocityEditor() {
  if (velocityEditor && editor) {
    velocityEditor.setNotes(editor.getNotes(), new Set(editor.getSelectedNotes()));
  }
}

function setTool(newTool: Tool) {
  tool = newTool;
  editor.setTool(newTool);
}

function setGridDivision(division: GridDivision) {
  gridDivision = division;
  editor.setGridDivision(division);
}

function toggleSnapToGrid() {
  snapToGrid = !snapToGrid;
  editor.setSnapToGrid(snapToGrid);
}

function toggleSnapToScale() {
  snapToScale = !snapToScale;
  editor.setSnapToScale(snapToScale);
}

function handleScaleChange(event: Event) {
  const select = event.target as HTMLSelectElement;
  selectedScale = select.value;
  editor.setScale(scales[selectedScale], rootNote);
}

function quantizeNotes() {
  editor.quantizeSelectedNotes();
  updateVelocityEditor();
}

function clearNotes() {
  if (confirm('Clear all notes?')) {
    editor.setNotes([]);
    notes = [];
  }
}

function selectAll() {
  const allNotes = editor.getNotes();
  allNotes.forEach(note => editor.selectNote(note.id, true));
  updateVelocityEditor();
}

// Keyboard shortcuts
function handleKeyDown(e: KeyboardEvent) {
  // Only handle shortcuts if not in input field
  if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) {
    return;
  }

  switch (e.key) {
    case 'v':
      setTool('select');
      break;
    case 'b':
      setTool('draw');
      break;
    case 'e':
      setTool('erase');
      break;
    case 'q':
      if (e.metaKey || e.ctrlKey) {
        e.preventDefault();
        quantizeNotes();
      }
      break;
    case 'a':
      if (e.metaKey || e.ctrlKey) {
        e.preventDefault();
        selectAll();
      }
      break;
  }
}

onMount(() => {
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
});
</script>

<div class="piano-roll">
  <!-- Toolbar -->
  <div class="toolbar glass-strong">
    <!-- Tools -->
    <div class="tool-group">
      <span class="tool-label">Tools:</span>
      <Button
        variant={tool === 'select' ? 'primary' : 'secondary'}
        size="sm"
        onclick={() => setTool('select')}
        title="Select (V)"
      >
        <Icon name="cursor" size="sm" />
      </Button>
      <Button
        variant={tool === 'draw' ? 'primary' : 'secondary'}
        size="sm"
        onclick={() => setTool('draw')}
        title="Draw (B)"
      >
        <Icon name="pencil" size="sm" />
      </Button>
      <Button
        variant={tool === 'erase' ? 'primary' : 'secondary'}
        size="sm"
        onclick={() => setTool('erase')}
        title="Erase (E)"
      >
        <Icon name="eraser" size="sm" />
      </Button>
    </div>

    <!-- Grid Controls -->
    <div class="grid-controls">
      <span class="tool-label">Grid:</span>
      <select
        class="grid-select"
        value={gridDivision}
        onchange={(e) => setGridDivision((e.target as HTMLSelectElement).value as GridDivision)}
      >
        <option value="1/4">1/4</option>
        <option value="1/8">1/8</option>
        <option value="1/16">1/16</option>
        <option value="1/32">1/32</option>
        <option value="1/64">1/64</option>
        <option value="1/4T">1/4T</option>
        <option value="1/8T">1/8T</option>
        <option value="1/16T">1/16T</option>
      </select>

      <Toggle
        checked={snapToGrid}
        label="Snap to Grid"
        onchange={toggleSnapToGrid}
      />
    </div>

    <!-- Scale Controls -->
    <div class="scale-controls">
      <Toggle
        checked={snapToScale}
        label="Snap to Scale"
        onchange={toggleSnapToScale}
      />

      {#if snapToScale}
        <select class="scale-select" value={selectedScale} onchange={handleScaleChange}>
          <option value="major">Major</option>
          <option value="minor">Minor</option>
          <option value="harmonic_minor">Harmonic Minor</option>
          <option value="pentatonic">Pentatonic</option>
          <option value="blues">Blues</option>
          <option value="chromatic">Chromatic</option>
        </select>
      {/if}
    </div>

    <!-- Actions -->
    <div class="actions">
      <Button variant="secondary" size="sm" onclick={quantizeNotes} title="Quantize (Cmd+Q)">
        <Icon name="grid" size="sm" />
        Quantize
      </Button>
      <Button variant="ghost" size="sm" onclick={selectAll} title="Select All (Cmd+A)">
        Select All
      </Button>
      <Button variant="ghost" size="sm" onclick={clearNotes}>
        Clear
      </Button>
    </div>
  </div>

  <!-- Editor Container -->
  <div class="editor-container">
    <!-- Piano Roll Canvas -->
    <div class="piano-roll-canvas-wrapper">
      {#if showKeyboard}
        <div class="piano-keyboard">
          <!-- Piano keyboard will be rendered here -->
          {#each Array.from({ length: 72 }, (_, i) => 96 - i) as pitch}
            {@const isBlackKey = [1, 3, 6, 8, 10].includes(pitch % 12)}
            {@const isC = pitch % 12 === 0}
            <div
              class="piano-key"
              class:black={isBlackKey}
              class:white={!isBlackKey}
              class:c-key={isC}
            >
              {#if isC}
                <span class="note-label">C{Math.floor(pitch / 12) - 2}</span>
              {/if}
            </div>
          {/each}
        </div>
      {/if}

      <div class="canvas-scroll">
        <canvas
          bind:this={pianoRollCanvas}
          width="2400"
          height="600"
          class="piano-roll-canvas"
        ></canvas>
      </div>
    </div>

    <!-- Velocity Editor -->
    <div class="velocity-editor-wrapper">
      <div class="velocity-label">Velocity</div>
      <div class="velocity-canvas-scroll">
        <canvas
          bind:this={velocityCanvas}
          width="2400"
          height="120"
          class="velocity-canvas"
        ></canvas>
      </div>
    </div>
  </div>

  <!-- Status Bar -->
  <div class="status-bar glass">
    <span>Notes: {notes.length}</span>
    <span>Selected: {editor?.getSelectedNotes().length || 0}</span>
    <span>Tool: {tool}</span>
    <span>Grid: {gridDivision}</span>
  </div>
</div>

<style>
  .piano-roll {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: var(--color-background);
  }

  .toolbar {
    display: flex;
    gap: 1.5rem;
    padding: 0.75rem 1rem;
    border-bottom: 1px solid var(--color-border);
    align-items: center;
    flex-wrap: wrap;
  }

  .tool-group,
  .grid-controls,
  .scale-controls,
  .actions {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .tool-label {
    font-size: 0.875rem;
    color: var(--color-text-secondary);
    margin-right: 0.25rem;
  }

  .grid-select,
  .scale-select {
    padding: 0.375rem 0.75rem;
    background: var(--color-surface-elevated);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-control);
    color: var(--color-text);
    font-size: 0.875rem;
  }

  .editor-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .piano-roll-canvas-wrapper {
    flex: 1;
    display: flex;
    overflow: hidden;
  }

  .piano-keyboard {
    width: 60px;
    background: var(--color-surface);
    border-right: 1px solid var(--color-border);
    overflow-y: auto;
    flex-shrink: 0;
  }

  .piano-key {
    height: 8.33px; /* 600px / 72 notes */
    border-bottom: 1px solid #222;
    display: flex;
    align-items: center;
    padding: 0 4px;
    position: relative;
  }

  .piano-key.white {
    background: #f0f0f0;
  }

  .piano-key.black {
    background: #1a1a1a;
  }

  .piano-key.c-key {
    border-bottom: 2px solid #444;
  }

  .note-label {
    font-size: 8px;
    color: var(--color-text-secondary);
  }

  .canvas-scroll {
    flex: 1;
    overflow: auto;
  }

  .piano-roll-canvas {
    display: block;
    cursor: crosshair;
  }

  .velocity-editor-wrapper {
    height: 140px;
    border-top: 1px solid var(--color-border);
    display: flex;
    overflow: hidden;
  }

  .velocity-label {
    width: 60px;
    background: var(--color-surface);
    border-right: 1px solid var(--color-border);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    color: var(--color-text-secondary);
    writing-mode: vertical-rl;
    text-orientation: mixed;
  }

  .velocity-canvas-scroll {
    flex: 1;
    overflow-x: auto;
    overflow-y: hidden;
  }

  .velocity-canvas {
    display: block;
    cursor: ns-resize;
  }

  .status-bar {
    display: flex;
    gap: 2rem;
    padding: 0.5rem 1rem;
    border-top: 1px solid var(--color-border);
    font-size: 0.75rem;
    color: var(--color-text-secondary);
  }
</style>
