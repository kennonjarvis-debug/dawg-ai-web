<script lang="ts">
  import type { InspectorPanelProps, Track, Effect, MidiNote } from '../../types';
  import { cn } from '../../utils/cn';
  import Input from '../atoms/Input.svelte';
  import Toggle from '../atoms/Toggle.svelte';
  import Knob from '../atoms/Knob.svelte';

  let {
    selectedItem,
    itemType,
    onUpdate,
    class: className
  }: InspectorPanelProps = $props();

  const hasSelection = $derived(selectedItem !== undefined);

  function handleUpdate(key: string, value: any) {
    if (onUpdate) {
      onUpdate({ [key]: value });
    }
  }

  const track = $derived(itemType === 'track' ? selectedItem as Track : null);
  const effect = $derived(itemType === 'effect' ? selectedItem as Effect : null);
  const note = $derived(itemType === 'note' ? selectedItem as MidiNote : null);
</script>

<div class={cn('inspector-panel', className)}>
  <div class="inspector-header">
    <h3 class="inspector-title">Inspector</h3>
    {#if hasSelection}
      <span class="item-type">{itemType}</span>
    {/if}
  </div>

  <div class="inspector-content">
    {#if !hasSelection}
      <div class="empty-state">
        <p>No selection</p>
        <span>Select a track, effect, or note to edit its properties</span>
      </div>
    {:else if track}
      <!-- Track Inspector -->
      <div class="property-group">
        <h4 class="group-title">Track Properties</h4>

        <div class="property">
          <Input
            label="Name"
            value={track.name}
            oninput={(value) => handleUpdate('name', value)}
          />
        </div>

        <div class="property">
          <label class="property-label">Color</label>
          <input
            type="color"
            value={track.color || '#00d9ff'}
            oninput={(e) => handleUpdate('color', (e.target as HTMLInputElement).value)}
            class="color-input"
          />
        </div>

        <div class="property">
          <Knob
            label="Volume"
            value={track.volume}
            onchange={(value) => handleUpdate('volume', value)}
          />
        </div>

        <div class="property">
          <Knob
            label="Pan"
            value={track.pan}
            min={-1}
            max={1}
            onchange={(value) => handleUpdate('pan', value)}
          />
        </div>

        <div class="property-row">
          <Toggle
            label="Muted"
            checked={track.muted}
            onchange={(value) => handleUpdate('muted', value)}
          />

          <Toggle
            label="Solo"
            checked={track.solo}
            onchange={(value) => handleUpdate('solo', value)}
          />

          <Toggle
            label="Armed"
            checked={track.armed}
            onchange={(value) => handleUpdate('armed', value)}
          />
        </div>
      </div>
    {:else if effect}
      <!-- Effect Inspector -->
      <div class="property-group">
        <h4 class="group-title">Effect Properties</h4>

        <div class="property">
          <Input
            label="Name"
            value={effect.name}
            oninput={(value) => handleUpdate('name', value)}
          />
        </div>

        <div class="property">
          <Input
            label="Type"
            value={effect.type}
            disabled
          />
        </div>

        <div class="property">
          <Toggle
            label="Bypassed"
            checked={effect.bypassed}
            onchange={(value) => handleUpdate('bypassed', value)}
          />
        </div>

        {#if effect.parameters}
          <div class="parameters-section">
            <h5 class="section-title">Parameters</h5>
            {#each Object.entries(effect.parameters) as [name, value]}
              <div class="property">
                <Knob
                  label={name}
                  value={value}
                  onchange={(val) => handleUpdate(`parameters.${name}`, val)}
                />
              </div>
            {/each}
          </div>
        {/if}
      </div>
    {:else if note}
      <!-- MIDI Note Inspector -->
      <div class="property-group">
        <h4 class="group-title">Note Properties</h4>

        <div class="property">
          <Input
            label="Pitch"
            type="number"
            value={note.pitch}
            min={0}
            max={127}
            oninput={(value) => handleUpdate('pitch', value)}
          />
        </div>

        <div class="property">
          <Input
            label="Start Time"
            type="number"
            value={note.start}
            step={0.01}
            oninput={(value) => handleUpdate('start', value)}
          />
        </div>

        <div class="property">
          <Input
            label="Duration"
            type="number"
            value={note.duration}
            min={0.01}
            step={0.01}
            oninput={(value) => handleUpdate('duration', value)}
          />
        </div>

        <div class="property">
          <Input
            label="Velocity"
            type="number"
            value={note.velocity}
            min={0}
            max={127}
            oninput={(value) => handleUpdate('velocity', value)}
          />
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  .inspector-panel {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-3);
    padding: var(--spacing-4);
    background: var(--color-bg-primary);
    border-radius: var(--radius-md);
    min-width: 280px;
    max-width: 400px;
  }

  .inspector-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: var(--spacing-2);
    border-bottom: 1px solid var(--color-text-tertiary);
  }

  .inspector-title {
    margin: 0;
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-bold);
    color: var(--color-text-primary);
  }

  .item-type {
    font-size: var(--font-size-sm);
    font-family: var(--font-family-mono);
    color: var(--color-accent-primary);
    text-transform: uppercase;
  }

  .inspector-content {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-4);
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-2);
    min-height: 300px;
    padding: var(--spacing-6);
    color: var(--color-text-tertiary);
    text-align: center;
  }

  .empty-state p {
    margin: 0;
    font-size: var(--font-size-lg);
  }

  .empty-state span {
    font-size: var(--font-size-sm);
  }

  .property-group {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-3);
  }

  .group-title {
    margin: 0 0 var(--spacing-2) 0;
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-bold);
    color: var(--color-text-primary);
  }

  .property {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-1);
  }

  .property-label {
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    color: var(--color-text-primary);
  }

  .property-row {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-3);
  }

  .color-input {
    width: 100%;
    height: 40px;
    padding: var(--spacing-1);
    border: 2px solid var(--color-text-tertiary);
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: border-color var(--transition-fast);
  }

  .color-input:hover {
    border-color: var(--color-accent-primary);
  }

  .color-input::-webkit-color-swatch-wrapper {
    padding: 0;
  }

  .color-input::-webkit-color-swatch {
    border: none;
    border-radius: 4px;
  }

  .parameters-section {
    margin-top: var(--spacing-2);
  }

  .section-title {
    margin: 0 0 var(--spacing-3) 0;
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-medium);
    color: var(--color-text-secondary);
  }
</style>
