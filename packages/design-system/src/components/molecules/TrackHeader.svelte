<script lang="ts">
  import type { TrackHeaderProps } from '../../types';
  import { cn } from '../../utils/cn';
  import Button from '../atoms/Button.svelte';
  import Icon from '../atoms/Icon.svelte';
  import Input from '../atoms/Input.svelte';

  let {
    name = $bindable(''),
    color = '#00d9ff',
    muted = $bindable(false),
    solo = $bindable(false),
    armed = $bindable(false),
    onNameChange,
    onMuteToggle,
    onSoloToggle,
    onArmToggle,
    onColorChange,
    class: className
  }: TrackHeaderProps = $props();

  let isEditingName = $state(false);

  function handleNameBlur() {
    isEditingName = false;
    if (onNameChange) {
      onNameChange(name);
    }
  }

  function handleMuteClick() {
    muted = !muted;
    if (onMuteToggle) {
      onMuteToggle();
    }
  }

  function handleSoloClick() {
    solo = !solo;
    if (onSoloToggle) {
      onSoloToggle();
    }
  }

  function handleArmClick() {
    armed = !armed;
    if (onArmToggle) {
      onArmToggle();
    }
  }
</script>

<div class={cn('track-header', className)} style="border-left: 4px solid {color};">
  <div class="track-info">
    {#if isEditingName}
      <Input
        bind:value={name}
        type="text"
        placeholder="Track name"
        class="track-name-input"
      />
    {:else}
      <button
        class="track-name"
        onclick={() => isEditingName = true}
        ondblclick={() => isEditingName = true}
      >
        {name || 'Unnamed Track'}
      </button>
    {/if}
  </div>

  <div class="track-controls">
    <Button
      variant={armed ? 'danger' : 'ghost'}
      size="sm"
      onclick={handleArmClick}
      class="control-btn"
    >
      <Icon name="record" size="sm" />
    </Button>

    <Button
      variant={muted ? 'secondary' : 'ghost'}
      size="sm"
      onclick={handleMuteClick}
      class="control-btn"
    >
      <Icon name="mute" size="sm" />
    </Button>

    <Button
      variant={solo ? 'primary' : 'ghost'}
      size="sm"
      onclick={handleSoloClick}
      class="control-btn"
    >
      <Icon name="solo" size="sm" />
    </Button>
  </div>

  {#if onColorChange}
    <input
      type="color"
      value={color}
      oninput={(e) => onColorChange((e.target as HTMLInputElement).value)}
      class="color-picker"
      title="Change track color"
    />
  {/if}
</div>

<style>
  .track-header {
    display: flex;
    align-items: center;
    gap: var(--spacing-3);
    padding: var(--spacing-3);
    background: var(--color-bg-secondary);
    border-radius: var(--radius-sm);
  }

  .track-info {
    flex: 1;
    min-width: 0;
  }

  .track-name {
    width: 100%;
    padding: var(--spacing-2);
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-medium);
    color: var(--color-text-primary);
    background: transparent;
    border: 1px solid transparent;
    border-radius: var(--radius-sm);
    text-align: left;
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .track-name:hover {
    background: var(--color-bg-tertiary);
    border-color: var(--color-text-tertiary);
  }

  .track-name:focus {
    outline: 2px solid var(--color-accent-primary);
    outline-offset: 2px;
  }

  .track-controls {
    display: flex;
    gap: var(--spacing-2);
  }

  .color-picker {
    width: 32px;
    height: 32px;
    padding: 0;
    border: 2px solid var(--color-text-tertiary);
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: border-color var(--transition-fast);
  }

  .color-picker:hover {
    border-color: var(--color-accent-primary);
  }

  .color-picker::-webkit-color-swatch-wrapper {
    padding: 0;
  }

  .color-picker::-webkit-color-swatch {
    border: none;
    border-radius: 2px;
  }
</style>
