<script lang="ts">
  import type { InputProps } from '../../types';
  import { cn } from '../../utils/cn';

  let {
    value = $bindable(''),
    type = 'text',
    placeholder = '',
    label = '',
    error = '',
    disabled = false,
    required = false,
    min,
    max,
    step,
    oninput,
    class: className
  }: InputProps = $props();

  function handleInput(e: Event) {
    const target = e.target as HTMLInputElement;
    if (type === 'number') {
      value = target.valueAsNumber || 0;
    } else {
      value = target.value;
    }

    if (oninput) {
      oninput(value);
    }
  }

  const inputClasses = $derived(
    cn(
      'input',
      error && 'error',
      disabled && 'disabled',
      className
    )
  );
</script>

<div class="input-container">
  {#if label}
    <label class="input-label" class:required>
      {label}
      {#if required}
        <span class="required-indicator">*</span>
      {/if}
    </label>
  {/if}

  <input
    class={inputClasses}
    {type}
    {placeholder}
    {disabled}
    {required}
    {min}
    {max}
    {step}
    value={value}
    aria-label={label}
    aria-invalid={!!error}
    aria-describedby={error ? 'error-message' : undefined}
    oninput={handleInput}
  />

  {#if error}
    <span id="error-message" class="input-error" role="alert">
      {error}
    </span>
  {/if}
</div>

<style>
  .input-container {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-1);
    width: 100%;
  }

  .input-label {
    font-size: var(--font-size-sm);
    color: var(--color-text-primary);
    font-weight: var(--font-weight-medium);
  }

  .required-indicator {
    color: var(--color-error);
    margin-left: 2px;
  }

  .input {
    width: 100%;
    padding: var(--spacing-2) var(--spacing-3);
    font-size: var(--font-size-base);
    font-family: var(--font-family-ui);
    color: var(--color-text-primary);
    background: var(--color-bg-secondary);
    border: 1px solid var(--color-text-tertiary);
    border-radius: var(--radius-sm);
    transition: all var(--transition-fast);
  }

  .input:hover:not(.disabled) {
    border-color: var(--color-text-secondary);
  }

  .input:focus {
    outline: none;
    border-color: var(--color-accent-primary);
    box-shadow: 0 0 0 2px rgba(0, 217, 255, 0.1);
  }

  .input.error {
    border-color: var(--color-error);
  }

  .input.error:focus {
    box-shadow: 0 0 0 2px rgba(255, 51, 102, 0.1);
  }

  .input.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .input::placeholder {
    color: var(--color-text-tertiary);
  }

  .input-error {
    font-size: var(--font-size-xs);
    color: var(--color-error);
  }
</style>
