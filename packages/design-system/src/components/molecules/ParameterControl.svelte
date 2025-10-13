<script lang="ts">
  import type { ParameterControlProps } from '../../types';
  import { cn } from '../../utils/cn';
  import Knob from '../atoms/Knob.svelte';
  import Fader from '../atoms/Fader.svelte';

  let {
    label,
    value = $bindable(0),
    type = 'knob',
    min = 0,
    max = 1,
    step = 0.01,
    onchange,
    class: className
  }: ParameterControlProps = $props();

  function handleChange(newValue: number) {
    value = newValue;
    if (onchange) {
      onchange(newValue);
    }
  }
</script>

<div class={cn('parameter-control', className)}>
  {#if type === 'knob'}
    <Knob
      bind:value={value}
      {label}
      {min}
      {max}
      {step}
      onchange={handleChange}
    />
  {:else}
    <Fader
      bind:value={value}
      {label}
      {min}
      {max}
      onchange={handleChange}
      height={120}
    />
  {/if}
</div>

<style>
  .parameter-control {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    padding: var(--spacing-2);
  }
</style>
