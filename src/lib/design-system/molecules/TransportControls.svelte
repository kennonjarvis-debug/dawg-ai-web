<script lang="ts">
  /**
   * TransportControls - Play, stop, record, loop controls
   */
  import Button from '../atoms/Button.svelte';
  import Icon from '../atoms/Icon.svelte';
  import Input from '../atoms/Input.svelte';
  import Label from '../atoms/Label.svelte';

  type TransportControlsProps = {
    playing?: boolean;
    recording?: boolean;
    looping?: boolean;
    tempo?: number;
    position?: string;
    onPlay?: () => void;
    onStop?: () => void;
    onRecord?: () => void;
    onLoop?: () => void;
    onTempoChange?: (tempo: number) => void;
  };

  let {
    playing = $bindable(false),
    recording = $bindable(false),
    looping = $bindable(false),
    tempo = $bindable(120),
    position = '00:00:00',
    onPlay,
    onStop,
    onRecord,
    onLoop,
    onTempoChange
  }: TransportControlsProps = $props();

  function handlePlay() {
    playing = !playing;
    onPlay?.();
  }

  function handleStop() {
    playing = false;
    recording = false;
    onStop?.();
  }

  function handleRecord() {
    recording = !recording;
    if (recording) {
      playing = true;
    }
    onRecord?.();
  }

  function handleLoop() {
    looping = !looping;
    onLoop?.();
  }

  function handleTempoChange(value: string | number) {
    tempo = value as number;
    onTempoChange?.(tempo);
  }
</script>

<div class="transport-controls glass-purple rounded-panel p-4 flex items-center gap-6">
  <!-- Transport buttons -->
  <div class="flex items-center gap-2">
    <Button
      variant={playing ? 'primary' : 'secondary'}
      size="md"
      onclick={handlePlay}
      aria-label={playing ? 'Pause' : 'Play'}
    >
      <Icon name={playing ? 'pause' : 'play'} size="md" />
    </Button>

    <Button
      variant="secondary"
      size="md"
      onclick={handleStop}
      aria-label="Stop"
    >
      <Icon name="stop" size="md" />
    </Button>

    <Button
      variant={recording ? 'danger' : 'secondary'}
      size="md"
      onclick={handleRecord}
      aria-label="Record"
    >
      <Icon name="record" size="md" />
    </Button>

    <Button
      variant={looping ? 'primary' : 'secondary'}
      size="md"
      onclick={handleLoop}
      aria-label="Loop"
    >
      <Icon name="loop" size="md" />
    </Button>
  </div>

  <!-- Position display -->
  <div class="glass rounded-control px-4 py-2">
    <Label size="lg" mono class="text-accent-primary">
      {position}
    </Label>
  </div>

  <!-- Tempo control -->
  <div class="flex items-center gap-2">
    <Label size="sm">BPM:</Label>
    <div class="w-20">
      <Input
        type="number"
        bind:value={tempo}
        min={20}
        max={300}
        step={1}
        size="sm"
        onchange={handleTempoChange}
      />
    </div>
  </div>
</div>

<style>
  .transport-controls {
    box-shadow: var(--shadow-glass-lg);
  }
</style>
