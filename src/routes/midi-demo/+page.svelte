<script lang="ts">
/**
 * MIDI Editor Demo Page
 * Module 4: MIDI Editor Demo
 */

import { onMount } from 'svelte';
import PianoRoll from '$lib/components/midi/PianoRoll.svelte';
import { Button } from '$lib/design-system';
import * as Tone from 'tone';

let initialized = false;

async function initializeAudio() {
  await Tone.start();
  initialized = true;
}
</script>

<svelte:head>
  <title>MIDI Editor Demo - DAWG AI</title>
</svelte:head>

<div class="min-h-screen p-8">
  <div class="mb-8">
    <h1 class="text-4xl font-bold mb-2 bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent">
      MIDI Editor Demo
    </h1>
    <p class="text-white/70">Module 4: Piano Roll Editor</p>
  </div>

  {#if !initialized}
    <div class="glass-strong rounded-panel p-12 text-center">
      <h2 class="text-2xl font-bold mb-4">Audio Not Initialized</h2>
      <p class="text-white/70 mb-6">
        Click the button below to initialize the audio engine
      </p>
      <Button variant="primary" size="lg" onclick={initializeAudio}>
        Initialize Audio
      </Button>
    </div>
  {:else}
    <div class="glass-strong rounded-panel p-4" style="height: 800px;">
      <PianoRoll trackId="demo-track" notes={[]} />
    </div>

    <div class="mt-8 glass rounded-panel p-6">
      <h3 class="text-xl font-bold mb-4">Keyboard Shortcuts</h3>
      <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div>
          <kbd class="kbd">V</kbd> - Select Tool
        </div>
        <div>
          <kbd class="kbd">B</kbd> - Draw Tool
        </div>
        <div>
          <kbd class="kbd">E</kbd> - Erase Tool
        </div>
        <div>
          <kbd class="kbd">Cmd/Ctrl+Q</kbd> - Quantize
        </div>
        <div>
          <kbd class="kbd">Cmd/Ctrl+A</kbd> - Select All
        </div>
        <div>
          <kbd class="kbd">Delete/Backspace</kbd> - Delete Selected
        </div>
      </div>
    </div>

    <div class="mt-4 glass rounded-panel p-6">
      <h3 class="text-xl font-bold mb-4">Features</h3>
      <ul class="list-disc list-inside space-y-2 text-white/70">
        <li>Click and drag to draw MIDI notes</li>
        <li>Select notes with selection tool</li>
        <li>Erase notes with eraser tool</li>
        <li>Quantize to grid (1/4, 1/8, 1/16, 1/32, triplets)</li>
        <li>Snap to scale (Major, Minor, Pentatonic, Blues, etc.)</li>
        <li>Edit note velocities in velocity editor</li>
        <li>Piano keyboard shows note names</li>
        <li>Grid lines for timing reference</li>
      </ul>
    </div>
  {/if}
</div>

<style>
  .kbd {
    display: inline-block;
    padding: 0.25rem 0.5rem;
    background: var(--color-surface-elevated);
    border: 1px solid var(--color-border);
    border-radius: 4px;
    font-family: monospace;
    font-size: 0.875rem;
  }
</style>
