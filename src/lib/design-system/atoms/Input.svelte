<script lang="ts">
  /**
   * Input Component - Text/number input field
   */
  import type { Size } from '../types/design';

  type InputProps = {
    type?: 'text' | 'number' | 'email' | 'password' | 'search';
    value?: string | number;
    placeholder?: string;
    label?: string;
    error?: string;
    disabled?: boolean;
    required?: boolean;
    size?: Size;
    min?: number;
    max?: number;
    step?: number;
    class?: string;
    oninput?: (value: string | number) => void;
    onchange?: (value: string | number) => void;
  };

  let {
    type = 'text',
    value = $bindable(''),
    placeholder = '',
    label = '',
    error = '',
    disabled = false,
    required = false,
    size = 'md',
    min,
    max,
    step,
    class: className = '',
    oninput,
    onchange
  } = $props();

  const sizeClasses = {
    xs: 'px-2 py-1 text-2xs',
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-3 text-base',
    xl: 'px-6 py-4 text-lg'
  };

  function handleInput(e: Event) {
    const target = e.target as HTMLInputElement;
    const newValue = type === 'number' ? parseFloat(target.value) : target.value;
    value = newValue;
    oninput?.(newValue);
  }

  function handleChange(e: Event) {
    const target = e.target as HTMLInputElement;
    const newValue = type === 'number' ? parseFloat(target.value) : target.value;
    value = newValue;
    onchange?.(newValue);
  }
</script>

<div class="input-wrapper w-full">
  {#if label}
    <label class="block text-sm font-medium text-white/90 mb-1">
      {label}
      {#if required}
        <span class="text-danger">*</span>
      {/if}
    </label>
  {/if}

  <input
    {type}
    {placeholder}
    {disabled}
    {required}
    {min}
    {max}
    {step}
    value={value}
    oninput={handleInput}
    onchange={handleChange}
    class="
      w-full
      glass
      rounded-control
      border
      transition-all
      duration-200
      font-sans
      text-white
      placeholder:text-white/30
      focus:outline-none
      focus:border-accent-primary
      focus:ring-2
      focus:ring-accent-primary/20
      disabled:opacity-50
      disabled:cursor-not-allowed
      {error ? 'border-danger focus:border-danger focus:ring-danger/20' : 'border-transparent'}
      {sizeClasses[size]}
      {className}
    "
    aria-invalid={!!error}
    aria-describedby={error ? 'input-error' : undefined}
  />

  {#if error}
    <p id="input-error" class="mt-1 text-xs text-danger">
      {error}
    </p>
  {/if}
</div>

<style>
  input {
    font-family: var(--font-sans);
  }

  input[type='number']::-webkit-inner-spin-button,
  input[type='number']::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  input[type='number'] {
    -moz-appearance: textfield;
  }
</style>
