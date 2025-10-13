import type { Meta, StoryObj } from '@storybook/svelte';
import TransportControls from './TransportControls.svelte';

const meta = {
  title: 'Molecules/TransportControls',
  component: TransportControls,
  tags: ['autodocs'],
  argTypes: {
    playing: {
      control: 'boolean'
    },
    recording: {
      control: 'boolean'
    },
    bpm: {
      control: { type: 'number', min: 20, max: 300, step: 1 }
    }
  }
} satisfies Meta<TransportControls>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    playing: false,
    recording: false,
    bpm: 120
  }
};

export const Playing: Story = {
  args: {
    playing: true,
    recording: false,
    bpm: 120
  }
};

export const Recording: Story = {
  args: {
    playing: true,
    recording: true,
    bpm: 120
  }
};

export const FastTempo: Story = {
  args: {
    playing: false,
    recording: false,
    bpm: 180
  }
};

export const SlowTempo: Story = {
  args: {
    playing: false,
    recording: false,
    bpm: 60
  }
};
