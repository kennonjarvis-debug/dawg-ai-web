<script lang="ts">
  import type { TransportControlsProps } from '../../types';
  import { cn } from '../../utils/cn';
  import Button from '../atoms/Button.svelte';
  import Icon from '../atoms/Icon.svelte';
  import Input from '../atoms/Input.svelte';

  let {
    playing = $bindable(false),
    recording = $bindable(false),
    bpm = $bindable(120),
    onPlayPause,
    onStop,
    onRecord,
    onBpmChange,
    class: className
  }: TransportControlsProps = $props();

  function handlePlayPause() {
    playing = !playing;
    if (onPlayPause) {
      onPlayPause();
    }
  }

  function handleStop() {
    playing = false;
    recording = false;
    if (onStop) {
      onStop();
    }
  }

  function handleRecord() {
    recording = !recording;
    if (recording) {
      playing = true;
    }
    if (onRecord) {
      onRecord();
    }
  }

  function handleBpmChange(value: string | number) {
    const newBpm = typeof value === 'number' ? value : parseInt(value);
    if (!isNaN(newBpm) && newBpm >= 20 && newBpm <= 300) {
      bpm = newBpm;
      if (onBpmChange) {
        onBpmChange(newBpm);
      }
    }
  }
</script>

<div class={cn('transport-controls', className)}>
  <div class="transport-buttons">
    <Button
      variant="ghost"
      size="lg"
      onclick={handleStop}
      class="transport-btn"
      aria-label="Stop"
    >
      <Icon name="stop" size="lg" />
    </Button>

    <Button
      variant={playing ? 'primary' : 'ghost'}
      size="lg"
      onclick={handlePlayPause}
      class="transport-btn play-btn"
      aria-label={playing ? 'Pause' : 'Play'}
    >
      <Icon name={playing ? 'pause' : 'play'} size="lg" />
    </Button>

    <Button
      variant={recording ? 'danger' : 'ghost'}
      size="lg"
      onclick={handleRecord}
      class="transport-btn"
      aria-label={recording ? 'Stop recording' : 'Record'}
    >
      <Icon name="record" size="lg" />
    </Button>
  </div>

  <div class="transport-info">
    <div class="bpm-control">
      <label for="bpm-input" class="bpm-label">BPM</label>
      <Input
        type="number"
        value={bpm}
        min={20}
        max={300}
        step={1}
        oninput={handleBpmChange}
        class="bpm-input"
      />
    </div>

    {#if playing}
      <div class="status-indicator playing">
        <span class="pulse"></span>
        {recording ? 'Recording' : 'Playing'}
      </div>
    {/if}
  </div>
</div>

<style>
  .transport-controls {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--spacing-6);
    padding: var(--spacing-4);
    background: var(--color-bg-secondary);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-md);
  }

  .transport-buttons {
    display: flex;
    gap: var(--spacing-3);
  }

  .play-btn {
    transform: scale(1.1);
  }

  .transport-info {
    display: flex;
    align-items: center;
    gap: var(--spacing-4);
  }

  .bpm-control {
    display: flex;
    align-items: center;
    gap: var(--spacing-2);
  }

  .bpm-label {
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    color: var(--color-text-secondary);
  }

  .bpm-input {
    width: 70px;
  }

  .status-indicator {
    display: flex;
    align-items: center;
    gap: var(--spacing-2);
    padding: var(--spacing-2) var(--spacing-3);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    color: var(--color-text-primary);
    background: var(--color-bg-tertiary);
    border-radius: var(--radius-sm);
  }

  .pulse {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--color-success);
    animation: pulse 1.5s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.5;
      transform: scale(0.8);
    }
  }
</style>
