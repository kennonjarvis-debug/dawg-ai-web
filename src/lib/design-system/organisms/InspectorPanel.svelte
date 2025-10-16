<script lang="ts">
  /**
   * InspectorPanel - Property inspector for selected items
   */
  import Label from '../atoms/Label.svelte';
  import Input from '../atoms/Input.svelte';
  import Knob from '../atoms/Knob.svelte';
  import Fader from '../atoms/Fader.svelte';
  import Toggle from '../atoms/Toggle.svelte';

  type Property = {
    key: string;
    label: string;
    type: 'number' | 'text' | 'select' | 'toggle' | 'color' | 'knob' | 'fader';
    value: any;
    options?: { label: string; value: any }[];
    min?: number;
    max?: number;
    step?: number;
    unit?: string;
  };

  type InspectorPanelProps = {
    title?: string;
    properties?: Property[];
    onPropertyChange?: (key: string, value: any) => void;
  };

  let {
    title = 'Inspector',
    properties = [],
    onPropertyChange
  }: InspectorPanelProps = $props();

  function handlePropertyChange(key: string, value: any) {
    onPropertyChange?.(key, value);
  }
</script>

<div class="inspector-panel glass-strong rounded-panel p-4">
  <Label size="lg" weight="bold" class="mb-4 block">{title}</Label>

  <div class="properties-list flex flex-col gap-4">
    {#if properties.length === 0}
      <div class="glass rounded-control p-4 text-center">
        <Label size="sm" color="var(--color-text-secondary)">
          No item selected
        </Label>
      </div>
    {:else}
      {#each properties as prop (prop.key)}
        <div class="property-item">
          <Label size="sm" weight="medium" class="mb-2 block">{prop.label}</Label>

          {#if prop.type === 'text'}
            <Input
              type="text"
              value={prop.value}
              size="sm"
              onchange={(value) => handlePropertyChange(prop.key, value)}
            />
          {:else if prop.type === 'number'}
            <Input
              type="number"
              value={prop.value}
              min={prop.min}
              max={prop.max}
              step={prop.step}
              size="sm"
              onchange={(value) => handlePropertyChange(prop.key, value)}
            />
          {:else if prop.type === 'toggle'}
            <Toggle
              checked={prop.value}
              size="md"
              onchange={(checked) => handlePropertyChange(prop.key, checked)}
            />
          {:else if prop.type === 'knob'}
            <Knob
              value={prop.value}
              min={prop.min || 0}
              max={prop.max || 127}
              step={prop.step || 1}
              unit={prop.unit}
              size="md"
              onchange={(value) => handlePropertyChange(prop.key, value)}
            />
          {:else if prop.type === 'fader'}
            <Fader
              value={prop.value}
              min={prop.min || -90}
              max={prop.max || 12}
              step={prop.step || 0.1}
              unit={prop.unit || 'dB'}
              height={120}
              onchange={(value) => handlePropertyChange(prop.key, value)}
            />
          {:else if prop.type === 'color'}
            <Input
              type="text"
              value={prop.value}
              size="sm"
              onchange={(value) => handlePropertyChange(prop.key, value)}
            />
          {:else if prop.type === 'select'}
            <select
              class="glass rounded-control px-4 py-2 text-sm w-full"
              value={prop.value}
              onchange={(e) => handlePropertyChange(prop.key, e.currentTarget.value)}
            >
              {#each prop.options || [] as option}
                <option value={option.value}>{option.label}</option>
              {/each}
            </select>
          {/if}
        </div>
      {/each}
    {/if}
  </div>
</div>

<style>
  .inspector-panel {
    min-width: 250px;
    max-width: 350px;
  }

  select {
    font-family: var(--font-sans);
    background-color: var(--color-surface);
    color: var(--color-text-primary);
    border: 1px solid var(--color-border);
    transition: all 0.2s;
  }

  select:focus {
    outline: none;
    border-color: var(--color-accent-primary);
    ring: 2px;
    ring-color: rgba(168, 85, 247, 0.2);
  }
</style>
