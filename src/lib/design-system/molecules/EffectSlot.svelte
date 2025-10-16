<script lang="ts">
  /**
   * EffectSlot - Single effect slot in effects rack
   */
  import Button from '../atoms/Button.svelte';
  import Toggle from '../atoms/Toggle.svelte';
  import Icon from '../atoms/Icon.svelte';
  import Label from '../atoms/Label.svelte';

  type EffectSlotProps = {
    id: string;
    name: string;
    type: string;
    enabled?: boolean;
    preset?: string;
    onToggle?: () => void;
    onRemove?: () => void;
    onClick?: () => void;
  };

  let {
    id,
    name,
    type,
    enabled = $bindable(true),
    preset = 'Default',
    onToggle,
    onRemove,
    onClick
  }: EffectSlotProps = $props();

  function handleToggle() {
    enabled = !enabled;
    onToggle?.();
  }

  function handleRemove(e: Event) {
    e.stopPropagation();
    onRemove?.();
  }

  function handleClick() {
    onClick?.();
  }
</script>

<div
  class="
    effect-slot
    glass
    rounded-control
    p-3
    flex
    items-center
    gap-3
    cursor-pointer
    hover:glass-purple
    transition-all
    {enabled ? '' : 'opacity-60'}
  "
  onclick={handleClick}
  role="button"
  tabindex="0"
  aria-label="Effect: {name}"
>
  <!-- Enable/disable toggle -->
  <Toggle
    bind:checked={enabled}
    size="sm"
    onchange={handleToggle}
  />

  <!-- Effect info -->
  <div class="flex-1 min-w-0">
    <Label size="sm" weight="semibold" class="block truncate">
      {name}
    </Label>
    <Label size="xs" color="var(--color-text-secondary)" class="block truncate">
      {preset}
    </Label>
  </div>

  <!-- Type badge -->
  <div class="glass-purple px-2 py-1 rounded-control">
    <Label size="xs" uppercase>{type}</Label>
  </div>

  <!-- Remove button -->
  <Button
    variant="ghost"
    size="xs"
    onclick={handleRemove}
    aria-label="Remove effect"
  >
    <Icon name="x" size="sm" />
  </Button>
</div>
