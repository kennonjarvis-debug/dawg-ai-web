import type { Meta, StoryObj } from '@storybook/svelte';
import Button from './Button.svelte';

const meta = {
  title: 'Atoms/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'danger', 'ghost']
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg']
    },
    disabled: {
      control: 'boolean'
    },
    loading: {
      control: 'boolean'
    },
    fullWidth: {
      control: 'boolean'
    }
  }
} satisfies Meta<Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    size: 'md',
    disabled: false,
    loading: false
  }
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    size: 'md'
  }
};

export const Danger: Story = {
  args: {
    variant: 'danger',
    size: 'md'
  }
};

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    size: 'md'
  }
};

export const Small: Story = {
  args: {
    variant: 'primary',
    size: 'sm'
  }
};

export const Large: Story = {
  args: {
    variant: 'primary',
    size: 'lg'
  }
};

export const Loading: Story = {
  args: {
    variant: 'primary',
    size: 'md',
    loading: true
  }
};

export const Disabled: Story = {
  args: {
    variant: 'primary',
    size: 'md',
    disabled: true
  }
};

export const FullWidth: Story = {
  args: {
    variant: 'primary',
    size: 'md',
    fullWidth: true
  }
};
