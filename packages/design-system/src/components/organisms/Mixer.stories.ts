import type { Meta, StoryObj } from '@storybook/svelte';
import Mixer from './Mixer.svelte';
import type { Track } from '../../types';

const meta = {
  title: 'Organisms/Mixer',
  component: Mixer,
  tags: ['autodocs']
} satisfies Meta<Mixer>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleTracks: Track[] = [
  {
    id: '1',
    name: 'Lead Vocals',
    color: '#00d9ff',
    volume: 0.8,
    pan: 0,
    muted: false,
    solo: false,
    armed: false,
    meterLevel: 0.6
  },
  {
    id: '2',
    name: 'Backing Vocals',
    color: '#ff006e',
    volume: 0.6,
    pan: -0.3,
    muted: false,
    solo: false,
    armed: false,
    meterLevel: 0.4
  },
  {
    id: '3',
    name: 'Acoustic Guitar',
    color: '#7000ff',
    volume: 0.7,
    pan: 0.2,
    muted: false,
    solo: false,
    armed: false,
    meterLevel: 0.5
  },
  {
    id: '4',
    name: 'Bass',
    color: '#00ff88',
    volume: 0.75,
    pan: 0,
    muted: false,
    solo: false,
    armed: false,
    meterLevel: 0.7
  },
  {
    id: '5',
    name: 'Drums',
    color: '#ffaa00',
    volume: 0.85,
    pan: 0,
    muted: false,
    solo: false,
    armed: false,
    meterLevel: 0.8
  }
];

export const Default: Story = {
  args: {
    tracks: sampleTracks
  }
};

export const Empty: Story = {
  args: {
    tracks: []
  }
};

export const SingleTrack: Story = {
  args: {
    tracks: [sampleTracks[0]]
  }
};

export const ManyTracks: Story = {
  args: {
    tracks: [
      ...sampleTracks,
      {
        id: '6',
        name: 'Synth Pad',
        color: '#ff3366',
        volume: 0.5,
        pan: -0.5,
        muted: false,
        solo: false,
        armed: false,
        meterLevel: 0.3
      },
      {
        id: '7',
        name: 'Lead Synth',
        color: '#33ff99',
        volume: 0.6,
        pan: 0.5,
        muted: false,
        solo: false,
        armed: false,
        meterLevel: 0.4
      }
    ]
  }
};
