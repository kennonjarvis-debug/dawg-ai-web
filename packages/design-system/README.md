# DAWG AI Design System

A comprehensive, production-ready design system for music production applications, built with **Svelte 5**, **TypeScript**, and **Tailwind CSS**.

## Features

- 🎨 **20+ Production-Ready Components** - Atoms, Molecules, and Organisms following atomic design principles
- 🎛️ **Music Production Focused** - Specialized components (Knobs, Faders, Meters, Piano Roll, Mixer)
- ♿ **WCAG 2.1 AA Compliant** - Full accessibility support with keyboard navigation and ARIA labels
- 🌙 **Dark Mode First** - Optimized for producer-friendly dark interfaces
- 📖 **Storybook Integration** - Interactive component documentation
- ✅ **Fully Typed** - Complete TypeScript type definitions
- 🧪 **Tested** - Comprehensive test coverage with Vitest
- 🎯 **60 FPS Optimized** - Smooth animations and real-time updates

## Installation

```bash
pnpm add @dawg-ai/design-system
# or
npm install @dawg-ai/design-system
# or
yarn add @dawg-ai/design-system
```

## Quick Start

```svelte
<script lang="ts">
  import { Button, Knob, TransportControls } from '@dawg-ai/design-system';
  import '@dawg-ai/design-system/styles';

  let volume = $state(0.75);
  let playing = $state(false);
</script>

<TransportControls
  bind:playing
  onPlayPause={() => console.log('Play/Pause')}
/>

<Knob
  bind:value={volume}
  label="Volume"
  min={0}
  max={1}
/>

<Button variant="primary" onclick={() => alert('Hello!')}>
  Click me
</Button>
```

## Component Hierarchy

### Atoms (8 components)
Basic building blocks for music production UI:

- **Button** - Primary, secondary, danger, ghost variants
- **Knob** - Rotary control with drag interaction
- **Fader** - Vertical slider for volume/pan
- **Toggle** - On/off switch
- **Input** - Text/number input with validation
- **Label** - Text label with tooltip support
- **Icon** - SVG icon system
- **Meter** - Audio level meter with peak detection

### Molecules (6 components)
Composed components combining atoms:

- **FaderChannel** - Fader + Meter + Label
- **TrackHeader** - Track name + controls + color
- **TransportControls** - Play/pause/stop/record buttons
- **ParameterControl** - Label + Knob/Fader
- **EffectSlot** - Effect selector + bypass + remove
- **VolumeControl** - Fader + numeric input

### Organisms (6 components)
Complex, feature-complete components:

- **Mixer** - Multi-channel mixer with faders and meters
- **Timeline** - Waveform display with playhead and regions
- **PianoRoll** - MIDI note editor with piano keys
- **EffectsRack** - Chain of effects with drag-and-drop reordering
- **TrackList** - List of tracks with selection and reordering
- **InspectorPanel** - Property editor for selected items

## Theme Customization

The design system uses CSS variables for theming:

```css
:root {
  /* Background Colors */
  --color-bg-primary: #0a0a0a;
  --color-bg-secondary: #1a1a1a;
  --color-bg-tertiary: #2a2a2a;

  /* Text Colors */
  --color-text-primary: #ffffff;
  --color-text-secondary: #a0a0a0;
  --color-text-tertiary: #606060;

  /* Accent Colors */
  --color-accent-primary: #00d9ff;
  --color-accent-secondary: #ff006e;
  --color-accent-tertiary: #7000ff;

  /* Status Colors */
  --color-success: #00ff88;
  --color-warning: #ffaa00;
  --color-error: #ff3366;

  /* Audio-Specific */
  --color-meter-green: #00ff88;
  --color-meter-yellow: #ffaa00;
  --color-meter-red: #ff3366;
}
```

### Light Mode

```html
<body data-theme="light">
  <!-- Your app -->
</body>
```

## Usage Examples

### Creating a Mixer

```svelte
<script lang="ts">
  import { Mixer } from '@dawg-ai/design-system';
  import type { Track } from '@dawg-ai/design-system';

  const tracks: Track[] = [
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
    // ... more tracks
  ];

  function handleTrackUpdate(trackId: string, updates: Partial<Track>) {
    console.log('Update track', trackId, updates);
  }
</script>

<Mixer {tracks} onTrackUpdate={handleTrackUpdate} />
```

### Building a Transport Bar

```svelte
<script lang="ts">
  import { TransportControls } from '@dawg-ai/design-system';

  let playing = $state(false);
  let recording = $state(false);
  let bpm = $state(120);
</script>

<TransportControls
  bind:playing
  bind:recording
  bind:bpm
  onPlayPause={() => console.log('Toggle playback')}
  onStop={() => console.log('Stop playback')}
  onRecord={() => console.log('Toggle recording')}
  onBpmChange={(newBpm) => console.log('BPM changed:', newBpm)}
/>
```

### Creating a Piano Roll

```svelte
<script lang="ts">
  import { PianoRoll } from '@dawg-ai/design-system';
  import type { MidiNote } from '@dawg-ai/design-system';

  let notes: MidiNote[] = [
    { id: '1', pitch: 60, start: 0, duration: 1, velocity: 100 },
    { id: '2', pitch: 64, start: 1, duration: 1, velocity: 90 },
  ];

  let selectedNotes: string[] = [];
</script>

<PianoRoll
  {notes}
  duration={16}
  bind:selectedNotes
  onNoteAdd={(note) => notes = [...notes, note]}
  onNoteUpdate={(id, updates) => console.log('Update note', id, updates)}
  onNoteDelete={(id) => notes = notes.filter(n => n.id !== id)}
/>
```

## Accessibility

All components are built with accessibility in mind:

- ✅ Keyboard navigation support
- ✅ ARIA labels and roles
- ✅ Focus management
- ✅ Color contrast WCAG AA compliant
- ✅ Screen reader friendly
- ✅ Reduced motion support

### Keyboard Shortcuts

- **Knob/Fader**: Arrow keys to adjust value
- **Toggle**: Space/Enter to toggle
- **Transport**: Space for play/pause
- **Piano Roll**: Arrow keys for note selection

## Development

```bash
# Install dependencies
pnpm install

# Run Storybook
pnpm storybook

# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Build the library
pnpm build

# Type check
pnpm typecheck

# Lint
pnpm lint
```

## Testing

The design system includes comprehensive tests using Vitest and Testing Library:

```bash
# Run all tests
pnpm test

# Run with coverage
pnpm test:coverage

# Watch mode
pnpm test:watch
```

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance

All components are optimized for real-time audio applications:

- 60 FPS animations
- Debounced drag interactions
- Efficient re-renders with Svelte 5 runes
- Minimal bundle size (~50KB gzipped)

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

## License

MIT License - see [LICENSE](LICENSE) for details.

## Credits

Built with love by the DAWG AI team for music producers worldwide.

---

**Made for producers, by producers** 🎵
