<script lang="ts">
  import type { LabelProps } from '../../types';
  import { cn } from '../../utils/cn';

  let {
    text,
    tooltip = '',
    required = false,
    for: htmlFor = '',
    class: className
  }: LabelProps = $props();

  let showTooltip = $state(false);
</script>

<div class={cn('label-wrapper', className)}>
  <label
    class="label"
    for={htmlFor}
  >
    {text}
    {#if required}
      <span class="required-indicator">*</span>
    {/if}

    {#if tooltip}
      <span
        class="tooltip-trigger"
        role="button"
        tabindex="0"
        aria-label="More information"
        onmouseenter={() => showTooltip = true}
        onmouseleave={() => showTooltip = false}
        onfocus={() => showTooltip = true}
        onblur={() => showTooltip = false}
      >
        ?
      </span>
    {/if}
  </label>

  {#if tooltip && showTooltip}
    <div class="tooltip" role="tooltip">
      {tooltip}
    </div>
  {/if}
</div>

<style>
  .label-wrapper {
    position: relative;
    display: inline-flex;
    align-items: center;
  }

  .label {
    font-size: var(--font-size-sm);
    color: var(--color-text-primary);
    font-weight: var(--font-weight-medium);
    display: inline-flex;
    align-items: center;
    gap: var(--spacing-1);
  }

  .required-indicator {
    color: var(--color-error);
  }

  .tooltip-trigger {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    font-size: 11px;
    font-weight: var(--font-weight-bold);
    color: var(--color-text-secondary);
    background: var(--color-bg-tertiary);
    border: 1px solid var(--color-text-tertiary);
    border-radius: 50%;
    cursor: help;
    transition: all var(--transition-fast);
  }

  .tooltip-trigger:hover,
  .tooltip-trigger:focus {
    color: var(--color-text-primary);
    border-color: var(--color-accent-primary);
    outline: none;
  }

  .tooltip {
    position: absolute;
    top: calc(100% + var(--spacing-1));
    left: 0;
    min-width: 200px;
    max-width: 300px;
    padding: var(--spacing-2) var(--spacing-3);
    font-size: var(--font-size-xs);
    color: var(--color-text-primary);
    background: var(--color-bg-tertiary);
    border: 1px solid var(--color-text-tertiary);
    border-radius: var(--radius-sm);
    box-shadow: var(--shadow-lg);
    z-index: var(--z-tooltip);
    animation: fadeIn var(--transition-fast);
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-4px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
