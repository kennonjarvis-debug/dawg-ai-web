import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import Button from './Button.svelte';

describe('Button', () => {
  it('renders with default props', () => {
    const { container } = render(Button, { children: 'Click me' });
    const button = container.querySelector('button');

    expect(button).toBeTruthy();
    expect(button?.textContent).toContain('Click me');
  });

  it('applies variant classes', () => {
    const { container } = render(Button, { variant: 'primary' });
    const button = container.querySelector('button');

    expect(button?.className).toContain('primary');
  });

  it('applies size classes', () => {
    const { container } = render(Button, { size: 'lg' });
    const button = container.querySelector('button');

    expect(button?.className).toContain('lg');
  });

  it('handles click events', async () => {
    const handleClick = vi.fn();
    const { container } = render(Button, {
      onclick: handleClick,
      children: 'Click me'
    });

    const button = container.querySelector('button');
    await fireEvent.click(button!);

    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('disables when disabled prop is true', () => {
    const { container } = render(Button, { disabled: true });
    const button = container.querySelector('button');

    expect(button?.disabled).toBe(true);
  });

  it('shows loading spinner when loading', () => {
    const { container } = render(Button, { loading: true });
    const spinner = container.querySelector('.loading-spinner');

    expect(spinner).toBeTruthy();
  });

  it('applies fullWidth class', () => {
    const { container } = render(Button, { fullWidth: true });
    const button = container.querySelector('button');

    expect(button?.className).toContain('w-full');
  });
});
