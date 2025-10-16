<script lang="ts">
  /**
   * FaderChannel - Complete mixer channel strip
   */
  import Fader from '../atoms/Fader.svelte';
  import Knob from '../atoms/Knob.svelte';
  import Button from '../atoms/Button.svelte';
  import Meter from '../atoms/Meter.svelte';
  import Label from '../atoms/Label.svelte';

  type FaderChannelProps = {
    id: string;
    label: string;
    volume?: number;
    pan?: number;
    mute?: boolean;
    solo?: boolean;
    peak?: number;
    color?: string;
    onVolumeChange?: (value: number) => void;
    onPanChange?: (value: number) => void;
    onMuteToggle?: () => void;
    onSoloToggle?: () => void;
  };

  let {
    id,
    label,
    volume = $bindable(-6),
    pan = $bindable(0),
    mute = $bindable(false),
    solo = $bindable(false),
    peak = -20,
    color = '#a855f7',
    onVolumeChange,
    onPanChange,
    onMuteToggle,
    onSoloToggle
  }: FaderChannelProps = $props();

  function handleVolumeChange(newValue: number) {
    volume = newValue;
    onVolumeChange?.(newValue);
  }

  function handlePanChange(newValue: number) {
    pan = newValue;
    onPanChange?.(newValue);
  }

  function handleMuteToggle() {
    mute = !mute;
    onMuteToggle?.();
  }

  function handleSoloToggle() {
    solo = !solo;
    onSoloToggle?.();
  }
</script>

<div class="fader-channel glass-purple rounded-panel p-3 flex flex-col items-center gap-3 w-20">
  <!-- Label with color indicator -->
  <div class="flex flex-col items-center gap-1 w-full">
    <div class="w-full h-1 rounded-full" style="background-color: {color};"></div>
    <Label size="xs" class="text-center truncate w-full">{label}</Label>
  </div>

  <!-- Meter -->
  <Meter value={peak} {peak} height={120} width={12} />

  <!-- Pan Knob -->
  <Knob
    bind:value={pan}
    min={-1}
    max={1}
    step={0.01}
    label="Pan"
    unit=""
    size="sm"
    bipolar={true}
    onchange={handlePanChange}
  />

  <!-- Fader -->
  <Fader
    bind:value={volume}
    min={-90}
    max={12}
    step={0.1}
    unit="dB"
    height={150}
    width={40}
    onchange={handleVolumeChange}
  />

  <!-- Mute/Solo Buttons -->
  <div class="flex gap-1 w-full">
    <Button
      variant={mute ? 'danger' : 'secondary'}
      size="xs"
      fullWidth
      onclick={handleMuteToggle}
    >
      M
    </Button>
    <Button
      variant={solo ? 'primary' : 'secondary'}
      size="xs"
      fullWidth
      onclick={handleSoloToggle}
    >
      S
    </Button>
  </div>
</div>

<style>
  .fader-channel {
    min-width: 80px;
  }
</style>
