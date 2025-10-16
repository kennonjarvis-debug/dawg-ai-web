<script lang="ts">
  /**
   * Mixer - Multi-channel mixer with master fader
   */
  import FaderChannel from '../molecules/FaderChannel.svelte';
  import Label from '../atoms/Label.svelte';

  type Channel = {
    id: string;
    label: string;
    volume: number;
    pan: number;
    mute: boolean;
    solo: boolean;
    peak: number;
    color: string;
  };

  type MixerProps = {
    channels?: Channel[];
    masterVolume?: number;
    masterPeak?: number;
    onMasterVolumeChange?: (value: number) => void;
  };

  let {
    channels = [],
    masterVolume = $bindable(0),
    masterPeak = -20,
    onMasterVolumeChange
  }: MixerProps = $props();

  function handleMasterVolumeChange(value: number) {
    masterVolume = value;
    onMasterVolumeChange?.(value);
  }
</script>

<div class="mixer glass-strong rounded-panel p-6">
  <Label size="lg" weight="bold" class="mb-4 block">Mixer</Label>

  <div class="mixer-channels flex gap-4 overflow-x-auto custom-scrollbar pb-4">
    <!-- Channel strips -->
    {#each channels as channel (channel.id)}
      <FaderChannel
        {...channel}
      />
    {/each}

    <!-- Master fader -->
    <div class="mixer-master ml-4 pl-4 border-l border-white/10">
      <FaderChannel
        id="master"
        label="Master"
        bind:volume={masterVolume}
        pan={0}
        mute={false}
        solo={false}
        peak={masterPeak}
        color="#a855f7"
        onVolumeChange={handleMasterVolumeChange}
      />
    </div>
  </div>
</div>

<style>
  .mixer {
    min-height: 400px;
  }

  .mixer-channels {
    min-width: 100%;
  }
</style>
