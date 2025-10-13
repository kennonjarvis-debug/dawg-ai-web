<script lang="ts">
  import type { EffectsRackProps, Effect } from '../../types';
  import { cn } from '../../utils/cn';
  import Button from '../atoms/Button.svelte';
  import Icon from '../atoms/Icon.svelte';
  import EffectSlot from '../molecules/EffectSlot.svelte';
  import ParameterControl from '../molecules/ParameterControl.svelte';

  let {
    effects = [],
    availableEffects = ['Reverb', 'Delay', 'Chorus', 'EQ', 'Compressor', 'Distortion', 'Filter'],
    onEffectAdd,
    onEffectUpdate,
    onEffectRemove,
    onEffectReorder,
    class: className
  }: EffectsRackProps = $props();

  let draggedIndex = $state<number | null>(null);
  let selectedEffectId = $state<string | null>(null);

  const selectedEffect = $derived(
    effects.find(e => e.id === selectedEffectId) || null
  );

  function handleEffectSelect(effectType: string, index: number) {
    if (onEffectUpdate) {
      onEffectUpdate(effects[index].id, { name: effectType, type: effectType.toLowerCase() });
    }
  }

  function handleAddEffect() {
    if (onEffectAdd) {
      onEffectAdd('empty');
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

    if (draggedIndex !== null && draggedIndex !== dropIndex && onEffectReorder) {
      onEffectReorder(draggedIndex, dropIndex);
    }

    draggedIndex = null;
  }

  function handleParameterChange(paramName: string, value: number) {
    if (!selectedEffect || !onEffectUpdate) return;

    onEffectUpdate(selectedEffect.id, {
      parameters: {
        ...selectedEffect.parameters,
        [paramName]: value
      }
    });
  }
</script>

<div class={cn('effects-rack', className)}>
  <div class="rack-header">
    <h3 class="rack-title">Effects Rack</h3>
    {#if onEffectAdd}
      <Button variant="primary" size="sm" onclick={handleAddEffect}>
        <Icon name="add" size="sm" />
        Add Effect
      </Button>
    {/if}
  </div>

  <div class="effects-chain">
    {#each effects as effect, index (effect.id)}
      <div
        class="effect-wrapper"
        class:selected={effect.id === selectedEffectId}
        class:dragging={draggedIndex === index}
        draggable="true"
        ondragstart={(e) => handleDragStart(e, index)}
        ondragover={handleDragOver}
        ondrop={(e) => handleDrop(e, index)}
        onclick={() => selectedEffectId = effect.id}
      >
        <div class="drag-indicator">
          <Icon name="chevronUp" size="sm" />
          <Icon name="chevronDown" size="sm" />
        </div>

        <EffectSlot
          effectName={effect.name}
          bind:bypassed={effect.bypassed}
          {availableEffects}
          onEffectSelect={(type) => handleEffectSelect(type, index)}
          onBypassToggle={() => onEffectUpdate && onEffectUpdate(effect.id, { bypassed: !effect.bypassed })}
          onRemove={() => onEffectRemove && onEffectRemove(effect.id)}
        />

        {#if index < effects.length - 1}
          <div class="signal-flow">
            <Icon name="chevronDown" size="sm" />
          </div>
        {/if}
      </div>
    {/each}

    {#if effects.length === 0}
      <div class="empty-state">
        <p>No effects added</p>
        {#if onEffectAdd}
          <Button variant="primary" size="sm" onclick={handleAddEffect}>
            <Icon name="add" size="sm" />
            Add your first effect
          </Button>
        {/if}
      </div>
    {/if}
  </div>

  {#if selectedEffect && selectedEffect.parameters}
    <div class="parameter-panel">
      <div class="panel-header">
        <h4 class="panel-title">{selectedEffect.name} Parameters</h4>
      </div>

      <div class="parameters-grid">
        {#each Object.entries(selectedEffect.parameters) as [name, value]}
          <ParameterControl
            label={name}
            value={value}
            type="knob"
            onchange={(val) => handleParameterChange(name, val)}
          />
        {/each}
      </div>
    </div>
  {/if}
</div>

<style>
  .effects-rack {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-4);
    padding: var(--spacing-4);
    background: var(--color-bg-primary);
    border-radius: var(--radius-md);
  }

  .rack-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: var(--spacing-2);
    border-bottom: 1px solid var(--color-text-tertiary);
  }

  .rack-title {
    margin: 0;
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-bold);
    color: var(--color-text-primary);
  }

  .effects-chain {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-2);
  }

  .effect-wrapper {
    position: relative;
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

  .effect-wrapper:hover {
    background: var(--color-bg-tertiary);
  }

  .effect-wrapper.selected {
    border-color: var(--color-accent-primary);
    box-shadow: 0 0 0 1px var(--color-accent-primary);
  }

  .effect-wrapper.dragging {
    opacity: 0.5;
  }

  .drag-indicator {
    display: flex;
    flex-direction: column;
    gap: 0;
    color: var(--color-text-tertiary);
    cursor: grab;
  }

  .drag-indicator:active {
    cursor: grabbing;
  }

  .signal-flow {
    position: absolute;
    bottom: -18px;
    left: 50%;
    transform: translateX(-50%);
    color: var(--color-accent-primary);
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

  .parameter-panel {
    padding: var(--spacing-4);
    background: var(--color-bg-secondary);
    border-radius: var(--radius-sm);
    border: 1px solid var(--color-accent-primary);
  }

  .panel-header {
    margin-bottom: var(--spacing-3);
    padding-bottom: var(--spacing-2);
    border-bottom: 1px solid var(--color-text-tertiary);
  }

  .panel-title {
    margin: 0;
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-bold);
    color: var(--color-text-primary);
  }

  .parameters-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: var(--spacing-4);
  }
</style>
