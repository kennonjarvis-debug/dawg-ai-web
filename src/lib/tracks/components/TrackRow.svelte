<script lang="ts">
  /**
   * TrackRow - Individual track row with header and controls
   */
  import { trackManager, selectedTrackId } from '../trackManagerStore';
  import { Icon, Button, Label, Input } from '$lib/design-system';
  import type { TrackData } from '../types';

  type TrackRowProps = {
    track: TrackData;
  };

  let { track }: TrackRowProps = $props();

  let isEditing = $state(false);
  let editingName = $state(track.name);
  let showMenu = $state(false);

  const isSelected = $derived($selectedTrackId === track.id);

  const typeIcons: Record<TrackData['type'], string> = {
    audio: 'audio',
    midi: 'midi',
    aux: 'volume',
    folder: 'folder'
  };

  function handleClick() {
    trackManager.selectTrack(track.id);
  }

  function handleDoubleClick() {
    isEditing = true;
    editingName = track.name;
  }

  function handleNameSubmit() {
    if (editingName.trim()) {
      trackManager.renameTrack(track.id, editingName.trim());
    }
    isEditing = false;
  }

  function handleDelete() {
    if (confirm(`Delete track "${track.name}"?`)) {
      trackManager.deleteTrack(track.id);
    }
    showMenu = false;
  }

  function handleDuplicate() {
    trackManager.duplicateTrack(track.id);
    showMenu = false;
  }

  function toggleMute() {
    trackManager.updateTrackSettings(track.id, {
      mute: !track.settings.mute
    });
  }

  function toggleSolo() {
    trackManager.updateTrackSettings(track.id, {
      solo: !track.settings.solo
    });
  }

  function toggleRecordArm() {
    trackManager.updateTrackSettings(track.id, {
      recordArm: !track.settings.recordArm
    });
  }
</script>

<div
  class="track-row glass rounded-control p-3 mb-2 cursor-pointer transition-all {isSelected ? 'ring-2 ring-accent-primary selected' : ''}"
  onclick={handleClick}
  ondblclick={handleDoubleClick}
  role="button"
  tabindex="0"
>
  <div class="track-content flex items-center gap-3">
    <!-- Color bar -->
    <div
      class="track-color w-1 h-12 rounded-full flex-shrink-0"
      style="background-color: {track.color};"
    ></div>

    <!-- Type icon -->
    <Icon name={typeIcons[track.type]} size="md" />

    <!-- Track name -->
    <div class="track-name flex-1 min-w-0">
      {#if isEditing}
        <Input
          type="text"
          bind:value={editingName}
          size="sm"
          onchange={handleNameSubmit}
          onkeydown={(e) => {
            if (e.key === 'Enter') handleNameSubmit();
            if (e.key === 'Escape') isEditing = false;
          }}
          class="w-full"
        />
      {:else}
        <Label size="sm" weight="semibold" class="block truncate">
          {track.name}
        </Label>
        <Label size="xs" color="var(--color-text-secondary)" class="block truncate">
          {track.type === 'folder' ? `${track.clips?.length || 0} tracks` : `${track.clips?.length || 0} clips`}
        </Label>
      {/if}
    </div>

    <!-- Controls -->
    <div class="track-controls flex gap-1">
      {#if track.type !== 'folder'}
        <Button
          variant={track.settings.recordArm ? 'danger' : 'ghost'}
          size="xs"
          onclick={(e) => {
            e.stopPropagation();
            toggleRecordArm();
          }}
          aria-label="Record arm"
        >
          <Icon name="record" size="xs" />
        </Button>
      {/if}

      <Button
        variant={track.settings.mute ? 'danger' : 'ghost'}
        size="xs"
        onclick={(e) => {
          e.stopPropagation();
          toggleMute();
        }}
        aria-label="Mute"
      >
        M
      </Button>

      <Button
        variant={track.settings.solo ? 'primary' : 'ghost'}
        size="xs"
        onclick={(e) => {
          e.stopPropagation();
          toggleSolo();
        }}
        aria-label="Solo"
      >
        S
      </Button>

      <!-- More menu -->
      <div class="relative">
        <Button
          variant="ghost"
          size="xs"
          onclick={(e) => {
            e.stopPropagation();
            showMenu = !showMenu;
          }}
        >
          <Icon name="settings" size="xs" />
        </Button>

        {#if showMenu}
          <div class="track-menu glass-purple rounded-control p-2 absolute right-0 mt-1 z-10 min-w-32">
            <button class="menu-item" onclick={handleDuplicate}>
              <span>Duplicate</span>
            </button>
            <button class="menu-item text-danger" onclick={handleDelete}>
              <span>Delete</span>
            </button>
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>

<style>
  .track-row {
    user-select: none;
  }

  .track-row:hover {
    background: var(--glass-purple-medium);
  }

  .track-row.selected {
    background: var(--glass-purple-strong);
  }

  .track-menu {
    box-shadow: var(--shadow-glass-md);
  }

  .menu-item {
    display: block;
    width: 100%;
    padding: 6px 12px;
    text-align: left;
    font-size: 13px;
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

  .menu-item.text-danger {
    color: var(--color-danger);
  }
</style>
