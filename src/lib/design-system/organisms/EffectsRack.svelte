<script lang="ts">
  /**
   * EffectsRack - Chain of effects with drag-and-drop reordering
   */
  import EffectSlot from '../molecules/EffectSlot.svelte';
  import Button from '../atoms/Button.svelte';
  import Icon from '../atoms/Icon.svelte';
  import Label from '../atoms/Label.svelte';

  type Effect = {
    id: string;
    name: string;
    type: string;
    enabled: boolean;
    preset?: string;
  };

  type EffectsRackProps = {
    effects?: Effect[];
    onReorder?: (fromIndex: number, toIndex: number) => void;
    onAddEffect?: () => void;
  };

  let {
    effects = [],
    onReorder,
    onAddEffect
  }: EffectsRackProps = $props();

  function handleAddEffect() {
    onAddEffect?.();
  }
</script>

<div class="effects-rack glass-strong rounded-panel p-6">
  <div class="flex items-center justify-between mb-4">
    <Label size="lg" weight="bold">Effects</Label>
    <Button
      variant="primary"
      size="sm"
      onclick={handleAddEffect}
    >
      <Icon name="plus" size="sm" />
      <span class="ml-2">Add Effect</span>
    </Button>
  </div>

  <div class="effects-list flex flex-col gap-2">
    {#if effects.length === 0}
      <div class="glass rounded-control p-8 text-center">
        <Label size="sm" color="var(--color-text-secondary)">
          No effects added yet
        </Label>
      </div>
    {:else}
      {#each effects as effect, index (effect.id)}
        <EffectSlot {...effect} />
      {/each}
    {/if}
  </div>
</div>

<style>
  .effects-rack {
    min-height: 200px;
  }
</style>
