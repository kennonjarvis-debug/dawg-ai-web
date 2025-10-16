<script lang="ts">
  /**
   * TrackHeader - Track control header for timeline/arrangement view
   */
  import Icon from '../atoms/Icon.svelte';
  import Button from '../atoms/Button.svelte';
  import Input from '../atoms/Input.svelte';
  import type { TrackType } from '../../types/core';

  type TrackHeaderProps = {
    id: string;
    name: string;
    color: string;
    icon?: string;
    type: TrackType;
    armed?: boolean;
    mute?: boolean;
    solo?: boolean;
    selected?: boolean;
    onSelect?: () => void;
    onRename?: (name: string) => void;
    onDelete?: () => void;
    onArmToggle?: () => void;
    onMuteToggle?: () => void;
    onSoloToggle?: () => void;
  };

  let {
    id,
    name = $bindable(''),
    color,
    icon,
    type,
    armed = $bindable(false),
    mute = $bindable(false),
    solo = $bindable(false),
    selected = false,
    onSelect,
    onRename,
    onDelete,
    onArmToggle,
    onMuteToggle,
    onSoloToggle
  }: TrackHeaderProps = $props();

  let isEditing = $state(false);
  let editingName = $state(name);

  function handleClick() {
    onSelect?.();
  }

  function handleDoubleClick() {
    isEditing = true;
    editingName = name;
  }

  function handleNameChange(newName: string | number) {
    name = newName as string;
    onRename?.(name);
    isEditing = false;
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      handleNameChange(editingName);
    } else if (e.key === 'Escape') {
      isEditing = false;
    }
  }

  const typeIcons: Record<TrackType, string> = {
    audio: 'audio',
    midi: 'midi',
    aux: 'volume',
    folder: 'folder'
  };
</script>

<div
  class="
    track-header
    glass-purple
    rounded-control
    p-2
    flex
    items-center
    gap-2
    cursor-pointer
    transition-all
    {selected ? 'ring-2 ring-accent-primary shadow-glass-md' : ''}
  "
  onclick={handleClick}
  ondblclick={handleDoubleClick}
  role="button"
  tabindex="0"
  aria-label="Track {name}"
  aria-selected={selected}
>
  <!-- Color indicator -->
  <div
    class="w-1 h-8 rounded-full flex-shrink-0"
    style="background-color: {color};"
  ></div>

  <!-- Type icon -->
  <Icon name={icon || typeIcons[type]} size="sm" />

  <!-- Track name (editable) -->
  <div class="flex-1 min-w-0">
    {#if isEditing}
      <Input
        bind:value={editingName}
        size="sm"
        onchange={handleNameChange}
        onkeydown={handleKeyDown}
        class="w-full"
      />
    {:else}
      <span class="text-sm font-medium truncate">{name}</span>
    {/if}
  </div>

  <!-- Controls -->
  <div class="flex gap-1">
    {#if type === 'audio' || type === 'midi'}
      <Button
        variant={armed ? 'danger' : 'ghost'}
        size="xs"
        onclick={(e) => {
          e.stopPropagation();
          armed = !armed;
          onArmToggle?.();
        }}
      >
        <Icon name="record" size="xs" />
      </Button>
    {/if}

    <Button
      variant={mute ? 'danger' : 'ghost'}
      size="xs"
      onclick={(e) => {
        e.stopPropagation();
        mute = !mute;
        onMuteToggle?.();
      }}
    >
      M
    </Button>

    <Button
      variant={solo ? 'primary' : 'ghost'}
      size="xs"
      onclick={(e) => {
        e.stopPropagation();
        solo = !solo;
        onSoloToggle?.();
      }}
    >
      S
    </Button>
  </div>
</div>
