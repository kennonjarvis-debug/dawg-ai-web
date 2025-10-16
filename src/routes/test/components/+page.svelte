<script lang="ts">
/**
 * Component Testing Page
 * Comprehensive visual testing for all atoms, molecules, and organisms
 */

// Atoms
import Button from '$lib/design-system/atoms/Button.svelte';
import Fader from '$lib/design-system/atoms/Fader.svelte';
import Icon from '$lib/design-system/atoms/Icon.svelte';
import Input from '$lib/design-system/atoms/Input.svelte';
import Knob from '$lib/design-system/atoms/Knob.svelte';
import Label from '$lib/design-system/atoms/Label.svelte';
import Meter from '$lib/design-system/atoms/Meter.svelte';
import Toggle from '$lib/design-system/atoms/Toggle.svelte';

// Molecules
import EffectSlot from '$lib/design-system/molecules/EffectSlot.svelte';
import FaderChannel from '$lib/design-system/molecules/FaderChannel.svelte';
import PianoKey from '$lib/design-system/molecules/PianoKey.svelte';
import TrackHeader from '$lib/design-system/molecules/TrackHeader.svelte';
import TransportControls from '$lib/design-system/molecules/TransportControls.svelte';
import WaveformDisplay from '$lib/design-system/molecules/WaveformDisplay.svelte';

// Organisms
import BrowserPanel from '$lib/design-system/organisms/BrowserPanel.svelte';
import EffectsRack from '$lib/design-system/organisms/EffectsRack.svelte';
import InspectorPanel from '$lib/design-system/organisms/InspectorPanel.svelte';
import Mixer from '$lib/design-system/organisms/Mixer.svelte';

let testValues = {
  fader: 0.7,
  knob: 0.5,
  toggle: false,
  input: '',
  meter: 0.8,
  channelVolume: 0.75,
  trackName: 'Test Track',
  tempo: 120,
  isPlaying: false,
  isRecording: false
};

// Test data for organisms
const testTracks = [
  { id: '1', name: 'Drums', volume: 0.8, pan: 0, isMuted: false, isSolo: false },
  { id: '2', name: 'Bass', volume: 0.7, pan: -0.3, isMuted: false, isSolo: false },
  { id: '3', name: 'Synth', volume: 0.6, pan: 0.3, isMuted: false, isSolo: false }
];

const testEffects = [
  { id: '1', name: 'Reverb', type: 'reverb', enabled: true, parameters: {} },
  { id: '2', name: 'EQ', type: 'eq', enabled: true, parameters: {} }
];

let selectedSection: 'atoms' | 'molecules' | 'organisms' = 'atoms';
</script>

<svelte:head>
  <title>Component Testing | DAWG AI</title>
</svelte:head>

<div class="test-page">
  <header class="test-header">
    <h1>🧪 Component Testing Lab</h1>
    <p>Visual testing for DAWG AI Design System</p>

    <nav class="section-nav">
      <button
        class:active={selectedSection === 'atoms'}
        on:click={() => selectedSection = 'atoms'}
      >
        Atoms (8)
      </button>
      <button
        class:active={selectedSection === 'molecules'}
        on:click={() => selectedSection = 'molecules'}
      >
        Molecules (6)
      </button>
      <button
        class:active={selectedSection === 'organisms'}
        on:click={() => selectedSection = 'organisms'}
      >
        Organisms (4)
      </button>
    </nav>
  </header>

  <main class="test-content">
    {#if selectedSection === 'atoms'}
      <section class="test-section">
        <h2>⚛️ Atoms</h2>
        <p class="section-desc">Basic building blocks - smallest UI components</p>

        <!-- Button Tests -->
        <div class="component-test">
          <h3>Button</h3>
          <div class="test-grid">
            <div class="test-item">
              <Label size="sm">Variants</Label>
              <div class="button-row">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="danger">Danger</Button>
              </div>
            </div>

            <div class="test-item">
              <Label size="sm">Sizes</Label>
              <div class="button-row">
                <Button size="xs">XS</Button>
                <Button size="sm">SM</Button>
                <Button size="md">MD</Button>
                <Button size="lg">LG</Button>
                <Button size="xl">XL</Button>
              </div>
            </div>

            <div class="test-item">
              <Label size="sm">States</Label>
              <div class="button-row">
                <Button>Normal</Button>
                <Button disabled>Disabled</Button>
                <Button loading>Loading</Button>
              </div>
            </div>
          </div>
        </div>

        <!-- Fader Test -->
        <div class="component-test">
          <h3>Fader</h3>
          <div class="test-grid">
            <div class="test-item">
              <Label size="sm">Value: {testValues.fader.toFixed(2)}</Label>
              <Fader bind:value={testValues.fader} label="Volume" />
            </div>
            <div class="test-item">
              <Label size="sm">Disabled</Label>
              <Fader value={0.5} disabled label="Disabled" />
            </div>
          </div>
        </div>

        <!-- Knob Test -->
        <div class="component-test">
          <h3>Knob</h3>
          <div class="test-grid">
            <div class="test-item">
              <Label size="sm">Value: {testValues.knob.toFixed(2)}</Label>
              <Knob bind:value={testValues.knob} label="Pan" size="md" />
            </div>
            <div class="test-item">
              <Label size="sm">Bipolar Mode</Label>
              <Knob value={0} label="Pan" bipolar size="md" />
            </div>
            <div class="test-item">
              <Label size="sm">Different Sizes</Label>
              <div class="knob-row">
                <Knob value={0.5} label="SM" size="sm" />
                <Knob value={0.5} label="MD" size="md" />
                <Knob value={0.5} label="LG" size="lg" />
              </div>
            </div>
          </div>
        </div>

        <!-- Toggle Test -->
        <div class="component-test">
          <h3>Toggle</h3>
          <div class="test-grid">
            <div class="test-item">
              <Label size="sm">State: {testValues.toggle ? 'ON' : 'OFF'}</Label>
              <Toggle bind:checked={testValues.toggle} label="Enable Effect" />
            </div>
            <div class="test-item">
              <Label size="sm">Disabled</Label>
              <Toggle checked={false} disabled label="Disabled" />
            </div>
          </div>
        </div>

        <!-- Input Test -->
        <div class="component-test">
          <h3>Input</h3>
          <div class="test-grid">
            <div class="test-item">
              <Label size="sm">Text Input</Label>
              <Input bind:value={testValues.input} placeholder="Type something..." />
            </div>
            <div class="test-item">
              <Label size="sm">Number Input</Label>
              <Input type="number" value="120" />
            </div>
            <div class="test-item">
              <Label size="sm">Password Input</Label>
              <Input type="password" placeholder="Enter password" />
            </div>
            <div class="test-item">
              <Label size="sm">Disabled</Label>
              <Input value="Disabled field" disabled />
            </div>
          </div>
        </div>

        <!-- Label Test -->
        <div class="component-test">
          <h3>Label</h3>
          <div class="test-grid">
            <div class="test-item">
              <Label size="xs">Extra Small</Label>
              <Label size="sm">Small</Label>
              <Label size="md">Medium</Label>
              <Label size="lg">Large</Label>
              <Label size="xl">Extra Large</Label>
            </div>
            <div class="test-item">
              <Label weight="normal">Normal Weight</Label>
              <Label weight="medium">Medium Weight</Label>
              <Label weight="semibold">Semibold Weight</Label>
              <Label weight="bold">Bold Weight</Label>
            </div>
          </div>
        </div>

        <!-- Icon Test -->
        <div class="component-test">
          <h3>Icon</h3>
          <div class="test-grid">
            <div class="test-item">
              <Label size="sm">Transport Icons</Label>
              <div class="icon-row">
                <Icon name="play" size="md" />
                <Icon name="pause" size="md" />
                <Icon name="stop" size="md" />
                <Icon name="record" size="md" />
              </div>
            </div>
            <div class="test-item">
              <Label size="sm">Tool Icons</Label>
              <div class="icon-row">
                <Icon name="cut" size="md" />
                <Icon name="copy" size="md" />
                <Icon name="paste" size="md" />
                <Icon name="delete" size="md" />
              </div>
            </div>
            <div class="test-item">
              <Label size="sm">Sizes</Label>
              <div class="icon-row">
                <Icon name="play" size="sm" />
                <Icon name="play" size="md" />
                <Icon name="play" size="lg" />
              </div>
            </div>
          </div>
        </div>

        <!-- Meter Test -->
        <div class="component-test">
          <h3>Meter</h3>
          <div class="test-grid">
            <div class="test-item">
              <Label size="sm">Level: {(testValues.meter * 100).toFixed(0)}%</Label>
              <Meter value={testValues.meter} height={200} />
            </div>
            <div class="test-item">
              <Label size="sm">Peak at 0.95</Label>
              <Meter value={0.95} height={200} />
            </div>
            <div class="test-item">
              <Label size="sm">Clipping</Label>
              <Meter value={1.0} height={200} />
            </div>
          </div>
        </div>
      </section>

    {:else if selectedSection === 'molecules'}
      <section class="test-section">
        <h2>🧬 Molecules</h2>
        <p class="section-desc">Combinations of atoms forming complex UI elements</p>

        <!-- FaderChannel Test -->
        <div class="component-test">
          <h3>Fader Channel</h3>
          <div class="test-grid">
            <div class="test-item">
              <FaderChannel
                label="Track 1"
                volume={testValues.channelVolume}
                pan={0}
                isMuted={false}
                isSolo={false}
              />
            </div>
            <div class="test-item">
              <FaderChannel
                label="Track 2"
                volume={0.6}
                pan={-0.5}
                isMuted={true}
                isSolo={false}
              />
            </div>
            <div class="test-item">
              <FaderChannel
                label="Track 3"
                volume={0.8}
                pan={0.5}
                isMuted={false}
                isSolo={true}
              />
            </div>
          </div>
        </div>

        <!-- TrackHeader Test -->
        <div class="component-test">
          <h3>Track Header</h3>
          <div class="test-grid vertical">
            <TrackHeader
              trackName={testValues.trackName}
              isMuted={false}
              isSolo={false}
              isArmed={false}
            />
            <TrackHeader
              trackName="Recording Track"
              isMuted={false}
              isSolo={false}
              isArmed={true}
            />
            <TrackHeader
              trackName="Muted Track"
              isMuted={true}
              isSolo={false}
              isArmed={false}
            />
          </div>
        </div>

        <!-- TransportControls Test -->
        <div class="component-test">
          <h3>Transport Controls</h3>
          <div class="test-grid">
            <div class="test-item">
              <TransportControls
                isPlaying={testValues.isPlaying}
                isRecording={testValues.isRecording}
                tempo={testValues.tempo}
              />
            </div>
          </div>
        </div>

        <!-- WaveformDisplay Test -->
        <div class="component-test">
          <h3>Waveform Display</h3>
          <div class="test-grid">
            <div class="test-item">
              <WaveformDisplay
                waveformData={new Float32Array(1000).fill(0).map(() => Math.random() * 2 - 1)}
                width={600}
                height={120}
              />
            </div>
          </div>
        </div>

        <!-- PianoKey Test -->
        <div class="component-test">
          <h3>Piano Key</h3>
          <div class="test-grid">
            <div class="test-item">
              <Label size="sm">White Keys</Label>
              <div class="piano-row">
                <PianoKey note={60} isBlack={false} isActive={false} />
                <PianoKey note={62} isBlack={false} isActive={false} />
                <PianoKey note={64} isBlack={false} isActive={true} />
              </div>
            </div>
            <div class="test-item">
              <Label size="sm">Black Keys</Label>
              <div class="piano-row">
                <PianoKey note={61} isBlack={true} isActive={false} />
                <PianoKey note={63} isBlack={true} isActive={true} />
                <PianoKey note={66} isBlack={true} isActive={false} />
              </div>
            </div>
          </div>
        </div>

        <!-- EffectSlot Test -->
        <div class="component-test">
          <h3>Effect Slot</h3>
          <div class="test-grid">
            <div class="test-item">
              <EffectSlot
                effectName="Reverb"
                isEnabled={true}
              />
            </div>
            <div class="test-item">
              <EffectSlot
                effectName="Delay"
                isEnabled={false}
              />
            </div>
          </div>
        </div>
      </section>

    {:else}
      <section class="test-section">
        <h2>🏛️ Organisms</h2>
        <p class="section-desc">Complete UI sections combining molecules and atoms</p>

        <!-- Mixer Test -->
        <div class="component-test full-width">
          <h3>Mixer</h3>
          <div class="organism-container">
            <Mixer tracks={testTracks} />
          </div>
        </div>

        <!-- EffectsRack Test -->
        <div class="component-test full-width">
          <h3>Effects Rack</h3>
          <div class="organism-container">
            <EffectsRack trackId="1" effects={testEffects} />
          </div>
        </div>

        <!-- BrowserPanel Test -->
        <div class="component-test full-width">
          <h3>Browser Panel</h3>
          <div class="organism-container">
            <BrowserPanel />
          </div>
        </div>

        <!-- InspectorPanel Test -->
        <div class="component-test full-width">
          <h3>Inspector Panel</h3>
          <div class="organism-container">
            <InspectorPanel selectedTrackId="1" />
          </div>
        </div>
      </section>
    {/if}
  </main>
</div>

<style>
.test-page {
  min-height: 100vh;
  background: var(--color-background);
  color: var(--color-text);
  padding: 2rem;
}

.test-header {
  margin-bottom: 3rem;
  text-align: center;
}

.test-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-light));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.test-header p {
  color: var(--color-text-secondary);
  font-size: 1.125rem;
  margin-bottom: 2rem;
}

.section-nav {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.section-nav button {
  padding: 0.75rem 1.5rem;
  background: transparent;
  border: 2px solid var(--color-border);
  border-radius: 0.5rem;
  color: var(--color-text);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.section-nav button:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.section-nav button.active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

.test-section h2 {
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.section-desc {
  color: var(--color-text-secondary);
  margin-bottom: 2rem;
}

.component-test {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.component-test.full-width {
  width: 100%;
}

.component-test h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--color-border);
}

.test-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.test-grid.vertical {
  grid-template-columns: 1fr;
}

.test-item {
  padding: 1rem;
  background: var(--color-background);
  border-radius: 0.5rem;
  border: 1px solid var(--color-border);
}

.button-row,
.icon-row,
.knob-row,
.piano-row {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  flex-wrap: wrap;
  margin-top: 0.5rem;
}

.organism-container {
  min-height: 400px;
  background: var(--color-background);
  border-radius: 0.5rem;
  padding: 1rem;
  border: 1px solid var(--color-border);
}

/* Responsive */
@media (max-width: 768px) {
  .test-page {
    padding: 1rem;
  }

  .test-header h1 {
    font-size: 1.75rem;
  }

  .section-nav {
    flex-direction: column;
  }

  .test-grid {
    grid-template-columns: 1fr;
  }
}
</style>
