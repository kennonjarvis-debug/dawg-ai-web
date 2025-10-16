<script lang="ts">
  /**
   * Track Manager Demo Page
   * Demonstrates Module 3: Track Manager functionality
   */
  import {
    Button,
    Icon,
    Label,
    Knob,
    Fader,
    Toggle,
    theme
  } from '$lib/design-system';
  import { TrackList } from '$lib/tracks/components';
  import {
    trackManager,
    selectedTrack,
    trackCount,
    orderedTracks
  } from '$lib/tracks/trackManagerStore';

  let isDark = $state(true);

  function handleThemeToggle() {
    theme.toggle();
    isDark = !isDark;
  }

  function handleClearAll() {
    if (confirm('Delete all tracks?')) {
      $orderedTracks.forEach(track => {
        trackManager.deleteTrack(track.id);
      });
    }
  }

  // Create some demo tracks on mount
  import { onMount } from 'svelte';

  onMount(() => {
    if ($trackCount === 0) {
      // Add demo tracks
      const kick = trackManager.createTrack('audio', 'Kick');
      const snare = trackManager.createTrack('audio', 'Snare');
      const hihat = trackManager.createTrack('audio', 'Hi-Hat');
      const bass = trackManager.createTrack('midi', 'Bass');
      const synth = trackManager.createTrack('midi', 'Synth');
      const fx = trackManager.createTrack('aux', 'Reverb Send');

      // Select the first track
      trackManager.selectTrack(kick.id);
    }
  });
</script>

<svelte:head>
  <title>Track Manager - DAWG AI</title>
</svelte:head>

<div class="min-h-screen p-8">
  <!-- Header -->
  <div class="glass-purple rounded-panel p-6 mb-8 flex items-center justify-between">
    <div>
      <h1 class="text-4xl font-bold mb-2 bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent">
        Module 3: Track Manager
      </h1>
      <p class="text-white/70">Track creation, organization, and management</p>
    </div>

    <div class="flex gap-3">
      <Button variant="secondary" size="md" onclick={handleClearAll}>
        <Icon name="trash" size="sm" />
        <span class="ml-2">Clear All</span>
      </Button>

      <Button variant="secondary" size="md" onclick={handleThemeToggle}>
        <Icon name={isDark ? 'sun' : 'moon'} size="sm" />
        <span class="ml-2">{isDark ? 'Light' : 'Dark'}</span>
      </Button>
    </div>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
    <!-- Track List (2/3 width) -->
    <div class="lg:col-span-2">
      <TrackList />
    </div>

    <!-- Inspector Panel (1/3 width) -->
    <div class="glass-strong rounded-panel p-6">
      <Label size="lg" weight="bold" class="mb-4 block">Track Inspector</Label>

      {#if $selectedTrack}
        <div class="space-y-6">
          <!-- Track Info -->
          <div>
            <Label size="sm" weight="semibold" class="mb-2 block">Track Info</Label>
            <div class="glass rounded-control p-3 space-y-2">
              <div class="flex justify-between items-center">
                <Label size="xs" color="var(--color-text-secondary)">Name:</Label>
                <Label size="sm" weight="medium">{$selectedTrack.name}</Label>
              </div>
              <div class="flex justify-between items-center">
                <Label size="xs" color="var(--color-text-secondary)">Type:</Label>
                <Label size="sm" weight="medium" class="capitalize">{$selectedTrack.type}</Label>
              </div>
              <div class="flex justify-between items-center">
                <Label size="xs" color="var(--color-text-secondary)">Clips:</Label>
                <Label size="sm" weight="medium">{$selectedTrack.clips?.length || 0}</Label>
              </div>
            </div>
          </div>

          <!-- Track Color -->
          <div>
            <Label size="sm" weight="semibold" class="mb-2 block">Track Color</Label>
            <div class="flex gap-2">
              {#each ['#ff006e', '#00d9ff', '#00ff88', '#a855f7', '#ffaa00', '#ff3366', '#c084fc', '#ffd700'] as color}
                <button
                  class="w-8 h-8 rounded-control transition-transform hover:scale-110 {$selectedTrack.color === color ? 'ring-2 ring-white' : ''}"
                  style="background-color: {color};"
                  onclick={() => trackManager.setTrackColor($selectedTrack.id, color)}
                  aria-label="Set color to {color}"
                ></button>
              {/each}
            </div>
          </div>

          <!-- Track Settings -->
          <div>
            <Label size="sm" weight="semibold" class="mb-3 block">Track Settings</Label>
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <Label size="sm">Volume</Label>
                <Label size="xs" mono class="text-accent-primary">
                  {$selectedTrack.settings.volume.toFixed(1)} dB
                </Label>
              </div>

              <div class="flex items-center justify-between">
                <Label size="sm">Pan</Label>
                <Label size="xs" mono class="text-accent-primary">
                  {($selectedTrack.settings.pan * 100).toFixed(0)}%
                </Label>
              </div>

              <div class="flex items-center justify-between">
                <Label size="sm">Mute</Label>
                <Toggle
                  checked={$selectedTrack.settings.mute}
                  size="sm"
                  onchange={(checked) => trackManager.updateTrackSettings($selectedTrack.id, { mute: checked })}
                />
              </div>

              <div class="flex items-center justify-between">
                <Label size="sm">Solo</Label>
                <Toggle
                  checked={$selectedTrack.settings.solo}
                  size="sm"
                  onchange={(checked) => trackManager.updateTrackSettings($selectedTrack.id, { solo: checked })}
                />
              </div>

              <div class="flex items-center justify-between">
                <Label size="sm">Record Arm</Label>
                <Toggle
                  checked={$selectedTrack.settings.recordArm}
                  size="sm"
                  onchange={(checked) => trackManager.updateTrackSettings($selectedTrack.id, { recordArm: checked })}
                />
              </div>
            </div>
          </div>

          <!-- Track Height -->
          <div>
            <Label size="sm" weight="semibold" class="mb-2 block">Track Height</Label>
            <div class="flex gap-2">
              {#each ['collapsed', 'small', 'medium', 'large'] as height}
                <Button
                  variant={$selectedTrack.height === height ? 'primary' : 'secondary'}
                  size="xs"
                  onclick={() => trackManager.setTrackHeight($selectedTrack.id, height)}
                >
                  {height.charAt(0).toUpperCase()}
                </Button>
              {/each}
            </div>
          </div>
        </div>
      {:else}
        <div class="glass rounded-control p-8 text-center">
          <Icon name="waveform" size="xl" class="mb-3 opacity-30" />
          <Label size="sm" color="var(--color-text-secondary)">
            No track selected
          </Label>
        </div>
      {/if}
    </div>
  </div>

  <!-- Stats -->
  <div class="glass rounded-control p-4 mt-8 flex items-center justify-between">
    <Label size="sm" color="var(--color-text-secondary)">
      Module 3: Track Manager • {$trackCount} tracks
    </Label>
    <Label size="xs" color="var(--color-text-tertiary)">
      Drag tracks to reorder • Double-click to rename
    </Label>
  </div>
</div>
