<script lang="ts">
  import type { EffectSlotProps } from '../../types';
  import { cn } from '../../utils/cn';
  import Button from '../atoms/Button.svelte';
  import Icon from '../atoms/Icon.svelte';
  import Toggle from '../atoms/Toggle.svelte';

  let {
    effectName = '',
    bypassed = $bindable(false),
    availableEffects = [],
    onEffectSelect,
    onBypassToggle,
    onRemove,
    class: className
  }: EffectSlotProps = $props();

  let showDropdown = $state(false);

  function handleEffectSelect(effect: string) {
    showDropdown = false;
    if (onEffectSelect) {
      onEffectSelect(effect);
    }
  }

  function handleBypassToggle() {
    bypassed = !bypassed;
    if (onBypassToggle) {
      onBypassToggle();
    }
  }
</script>

<div class={cn('effect-slot', bypassed && 'bypassed', className)}>
  <div class="effect-header">
    {#if effectName}
      <span class="effect-name">{effectName}</span>
    {:else}
      <button
        class="effect-selector"
        onclick={() => showDropdown = !showDropdown}
      >
        <Icon name="add" size="sm" />
        <span>Select Effect</span>
      </button>
    {/if}

    {#if showDropdown && availableEffects.length > 0}
      <div class="effect-dropdown">
        {#each availableEffects as effect}
          <button
            class="dropdown-item"
            onclick={() => handleEffectSelect(effect)}
          >
            {effect}
          </button>
        {/each}
      </div>
    {/if}
  </div>

  {#if effectName}
    <div class="effect-controls">
      <Toggle
        bind:checked={bypassed}
        label="Bypass"
        onchange={handleBypassToggle}
      />

      {#if onRemove}
        <Button
          variant="ghost"
          size="sm"
          onclick={onRemove}
          aria-label="Remove effect"
        >
          <Icon name="remove" size="sm" />
        </Button>
      {/if}
    </div>
  {/if}
</div>

<style>
  .effect-slot {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: var(--spacing-2);
    padding: var(--spacing-3);
    background: var(--color-bg-secondary);
    border: 1px solid var(--color-text-tertiary);
    border-radius: var(--radius-sm);
    transition: all var(--transition-fast);
  }

  .effect-slot.bypassed {
    opacity: 0.5;
  }

  .effect-header {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .effect-name {
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-medium);
    color: var(--color-text-primary);
  }

  .effect-selector {
    display: flex;
    align-items: center;
    gap: var(--spacing-2);
    padding: var(--spacing-2);
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
    background: transparent;
    border: 1px dashed var(--color-text-tertiary);
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .effect-selector:hover {
    color: var(--color-text-primary);
    border-color: var(--color-accent-primary);
  }

  .effect-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    margin-top: var(--spacing-1);
    background: var(--color-bg-tertiary);
    border: 1px solid var(--color-text-tertiary);
    border-radius: var(--radius-sm);
    box-shadow: var(--shadow-lg);
    z-index: var(--z-dropdown);
    max-height: 200px;
    overflow-y: auto;
  }

  .dropdown-item {
    display: block;
    width: 100%;
    padding: var(--spacing-2) var(--spacing-3);
    font-size: var(--font-size-sm);
    color: var(--color-text-primary);
    background: transparent;
    border: none;
    text-align: left;
    cursor: pointer;
    transition: background var(--transition-fast);
  }

  .dropdown-item:hover {
    background: var(--color-bg-secondary);
  }

  .effect-controls {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: var(--spacing-2);
    border-top: 1px solid var(--color-text-tertiary);
  }
</style>
