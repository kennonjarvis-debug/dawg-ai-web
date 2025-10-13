<script lang="ts">
  import type { ToggleProps } from '../../types';
  import { cn } from '../../utils/cn';

  let {
    checked = $bindable(false),
    label = '',
    disabled = false,
    onchange,
    class: className
  }: ToggleProps = $props();

  function handleClick() {
    if (disabled) return;
    checked = !checked;
    if (onchange) {
      onchange(checked);
    }
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (disabled) return;
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      handleClick();
    }
  }
</script>

<div class={cn('toggle-container', className)}>
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    aria-disabled={disabled}
    class="toggle"
    class:checked
    class:disabled
    tabindex={disabled ? -1 : 0}
    onclick={handleClick}
    onkeydown={handleKeyDown}
  >
    <span class="toggle-thumb" />
  </button>

  {#if label}
    <label class="toggle-label">{label}</label>
  {/if}
</div>

<style>
  .toggle-container {
    display: inline-flex;
    align-items: center;
    gap: var(--spacing-2);
  }

  .toggle {
    position: relative;
    width: 44px;
    height: 24px;
    background: var(--color-bg-tertiary);
    border: 2px solid var(--color-text-tertiary);
    border-radius: var(--radius-full);
    cursor: pointer;
    transition: all var(--transition-fast);
    padding: 0;
  }

  .toggle:hover:not(.disabled) {
    border-color: var(--color-text-secondary);
  }

  .toggle.checked {
    background: var(--color-accent-primary);
    border-color: var(--color-accent-primary);
  }

  .toggle.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .toggle-thumb {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 16px;
    height: 16px;
    background: var(--color-text-primary);
    border-radius: 50%;
    transition: transform var(--transition-fast);
    pointer-events: none;
  }

  .toggle.checked .toggle-thumb {
    transform: translateX(20px);
  }

  .toggle-label {
    font-size: var(--font-size-sm);
    color: var(--color-text-primary);
    user-select: none;
  }

  .toggle:focus-visible {
    outline: 2px solid var(--color-accent-primary);
    outline-offset: 2px;
  }
</style>
