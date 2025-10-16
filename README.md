# DAWG AI Design System

A comprehensive design system for DAWG AI, a browser-based music production application. Built with **Svelte 5**, **TypeScript**, and **Tailwind CSS**, featuring a glassmorphic purple aesthetic inspired by BeatStars, Suno, and Pro Tools.

## Features

- **Glassmorphic Purple Theme** - Modern glassmorphism with purple accents
- **Dark/Light Mode** - Seamless theme switching with persistence
- **Atomic Design** - Scalable component architecture (Atoms → Molecules → Organisms)
- **Accessibility First** - WCAG 2.1 AA compliant
- **Music Production Focused** - Custom audio controls (knobs, faders, meters)
- **TypeScript** - Full type safety
- **Responsive** - Desktop-first with tablet support

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

Visit `http://localhost:5173` to see the design system in action.

## Project Structure

```
src/lib/design-system/
├── atoms/              # Basic building blocks
│   ├── Button.svelte
│   ├── Knob.svelte
│   ├── Fader.svelte
│   ├── Toggle.svelte
│   ├── Input.svelte
│   ├── Label.svelte
│   ├── Icon.svelte
│   └── Meter.svelte
├── molecules/          # Combinations of atoms
│   ├── FaderChannel.svelte
│   ├── TrackHeader.svelte
│   ├── TransportControls.svelte
│   ├── EffectSlot.svelte
│   ├── WaveformDisplay.svelte
│   └── PianoKey.svelte
├── organisms/          # Complex components
│   ├── Mixer.svelte
│   ├── EffectsRack.svelte
│   ├── BrowserPanel.svelte
│   └── InspectorPanel.svelte
├── theme/             # Theme system
│   ├── variables.css
│   ├── theme.css
│   ├── ThemeProvider.svelte
│   └── themeStore.ts
├── utils/             # Utility functions
│   ├── knobDrag.ts
│   ├── faderDrag.ts
│   └── canvasUtils.ts
└── types/             # TypeScript definitions
    └── design.ts
```

## Usage Examples

### Theme Provider

Wrap your app with the `ThemeProvider` to enable theme switching:

```svelte
<script lang="ts">
  import { ThemeProvider, theme } from '$lib/design-system';
  import { onMount } from 'svelte';

  onMount(() => {
    theme.initialize();
  });
</script>

<ThemeProvider>
  <slot />
</ThemeProvider>
```

### Toggle Theme

```svelte
<script lang="ts">
  import { theme } from '$lib/design-system';

  function handleThemeToggle() {
    theme.toggle();
  }
</script>

<button onclick={handleThemeToggle}>
  Toggle Theme
</button>
```

### Button Component

```svelte
<script lang="ts">
  import { Button } from '$lib/design-system';
</script>

<Button variant="primary" size="md" onclick={() => console.log('clicked')}>
  Click Me
</Button>
```

### Knob Component

```svelte
<script lang="ts">
  import { Knob } from '$lib/design-system';

  let cutoff = $state(64);
</script>

<Knob
  bind:value={cutoff}
  min={0}
  max={127}
  label="Cutoff"
  unit="Hz"
  onchange={(value) => console.log('Cutoff:', value)}
/>
```

### Fader Component

```svelte
<script lang="ts">
  import { Fader } from '$lib/design-system';

  let volume = $state(-6);
</script>

<Fader
  bind:value={volume}
  min={-90}
  max={12}
  label="Volume"
  unit="dB"
  height={200}
  onchange={(value) => console.log('Volume:', value)}
/>
```

### Transport Controls

```svelte
<script lang="ts">
  import { TransportControls } from '$lib/design-system';

  let playing = $state(false);
  let recording = $state(false);
  let looping = $state(false);
  let tempo = $state(120);
</script>

<TransportControls
  bind:playing
  bind:recording
  bind:looping
  bind:tempo
  position="00:00:00"
  onPlay={() => console.log('Play')}
  onStop={() => console.log('Stop')}
  onRecord={() => console.log('Record')}
/>
```

### Mixer

```svelte
<script lang="ts">
  import { Mixer } from '$lib/design-system';

  const channels = [
    { id: '1', label: 'Kick', volume: -10, pan: 0, mute: false, solo: false, peak: -12, color: '#ff006e' },
    { id: '2', label: 'Snare', volume: -8, pan: 0.2, mute: false, solo: false, peak: -15, color: '#00d9ff' }
  ];
</script>

<Mixer {channels} masterVolume={0} masterPeak={-8} />
```

## Design Principles

### Colors

- **Background**: Deep black (#0a0a0a) / White (#ffffff)
- **Surface**: Dark gray (#1a1a1a) / Light gray (#f5f5f5)
- **Accent Primary**: Purple (#a855f7)
- **Accent Secondary**: Light purple (#c084fc)
- **Status Colors**: Success (#00ff88), Warning (#ffaa00), Danger (#ff3366)

### Typography

- **Primary Font**: Inter (body, UI)
- **Monospace Font**: JetBrains Mono (values, code)
- **Size Scale**: 11px, 12px, 14px, 16px, 18px, 24px
- **Weights**: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)

### Spacing

- **Base Unit**: 4px
- **Scale**: 4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px

### Border Radius

- **Controls**: 4px
- **Panels**: 8px
- **Modals**: 12px

### Shadows

Glassmorphic shadows with purple tints:
- **Small**: `0 2px 16px rgba(168, 85, 247, 0.1)`
- **Medium**: `0 4px 24px rgba(168, 85, 247, 0.15)`
- **Large**: `0 8px 32px rgba(168, 85, 247, 0.2)`

## Accessibility

All components are built with accessibility in mind:

- **ARIA Labels**: All interactive elements have proper ARIA labels
- **Keyboard Navigation**: Full keyboard support (Tab, Arrow keys, Enter)
- **Focus Indicators**: 2px cyan outline on focus
- **Screen Reader Support**: Semantic HTML and ARIA announcements
- **Reduced Motion**: Respects `prefers-reduced-motion`

## Interaction Patterns

### Knobs
- **Click + Drag Vertical**: Drag up to increase, down to decrease
- **Mouse Wheel**: Scroll to adjust value
- **Sensitivity**: 100 pixels per full range (configurable)

### Faders
- **Click + Drag**: Drag up/down to adjust
- **Click on Track**: Jump to value
- **Mouse Wheel**: Scroll to adjust

### Transport
- **Keyboard Shortcuts**:
  - `Space`: Play/Pause
  - `R`: Record
  - `L`: Loop

## CSS Variables

The design system uses CSS variables for theming:

```css
--color-background
--color-surface
--color-accent-primary
--glass-purple-medium
--shadow-glass-md
/* ...and many more */
```

Override these in your own stylesheets to customize the theme.

## Performance

- **Bundle Size**: < 50KB for entire design system
- **60 FPS Interactions**: Optimized for smooth real-time audio applications
- **Canvas Rendering**: High-DPI support for waveforms and visualizations

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Contributing

1. Follow the atomic design methodology
2. Ensure accessibility compliance
3. Add TypeScript types for all props
4. Test on mid-range devices for performance
5. Document component usage

## License

Proprietary - DAWG AI

## Acknowledgments

Design inspired by:
- **BeatStars** - Glassmorphic aesthetics
- **Suno** - Theme toggle and color scheme
- **Pro Tools** - Professional audio interface design

---

Built with ❤️ for music producers

**Module 1 Complete** ✅

