## 🎛️ Instance 11: Mixing Console + Automation

```markdown
# Claude Code Prompt: Mixing Console & Automation

## Mission
Build professional mixing console with faders, pan, solo/mute, and automation recording.

## Context Files
1. Comprehensive spec: Mixing section
2. Architecture doc: Module 8

## Deliverables

### 1. Mixer Core (`src/lib/audio/mixer/Mixer.ts`)

```typescript
interface ChannelStrip {
  trackId: string;
  volume: number;      // dB
  pan: number;         // -1 to 1
  solo: boolean;
  mute: boolean;
  sends: Map<string, number>;  // Send levels
  insert: Effect[];
}

class Mixer {
  private channels: Map<string, ChannelStrip> = new Map();
  private masterChannel: ChannelStrip;

  addChannel(trackId: string): ChannelStrip;
  removeChannel(trackId: string): void;

  setVolume(trackId: string, volumeDb: number): void;
  setPan(trackId: string, pan: number): void;
  setSolo(trackId: string, solo: boolean): void;
  setMute(trackId: string, mute: boolean): void;

  // Send/return effects
  createSend(name: string, effect: Effect): string;
  setSendLevel(trackId: string, sendId: string, level: number): void;
}
```

### 2. Automation System (`src/lib/audio/automation/Automation.ts`)

```typescript
interface AutomationPoint {
  time: number;    // In beats
  value: number;   // Parameter value
}

interface AutomationLane {
  parameter: string;  // 'volume', 'pan', 'effect.reverb.mix', etc.
  points: AutomationPoint[];
  mode: 'read' | 'write' | 'touch' | 'latch';
}

class AutomationManager {
  private lanes: Map<string, AutomationLane> = new Map();
  private isRecording: boolean = false;

  startRecording(parameter: string, mode: 'write' | 'touch' | 'latch'): void;
  stopRecording(): void;

  addPoint(parameter: string, time: number, value: number): void;
  removePoint(parameter: string, pointId: string): void;

  // Playback
  getValueAtTime(parameter: string, time: number): number;

  // Interpolation
  private interpolate(p1: AutomationPoint, p2: AutomationPoint, time: number): number {
    const t = (time - p1.time) / (p2.time - p1.time);
    return p1.value + (p2.value - p1.value) * t;
  }
}
```

### 3. Mixer UI (`src/lib/components/mixer/MixerConsole.svelte`)

```typescript
<script lang="ts">
  let tracks: Track[] = $state([]);

  function handleFaderChange(trackId: string, value: number) {
    mixer.setVolume(trackId, value);

    // Record automation if in write mode
    if (automation.isRecording(trackId, 'volume')) {
      automation.addPoint(trackId, Tone.Transport.position, value);
    }
  }
</script>

<div class="mixer-console">
  {#each tracks as track}
    <div class="channel-strip">
      <h3>{track.name}</h3>

      <!-- Fader -->
      <Fader
        value={track.volume}
        onchange={(v) => handleFaderChange(track.id, v)}
      />

      <!-- Pan knob -->
      <Knob
        value={track.pan}
        onchange={(v) => mixer.setPan(track.id, v)}
      />

      <!-- Solo/Mute -->
      <div class="controls">
        <button
          class:active={track.solo}
          onclick={() => mixer.setSolo(track.id, !track.solo)}
        >S</button>
        <button
          class:active={track.mute}
          onclick={() => mixer.setMute(track.id, !track.mute)}
        >M</button>
      </div>

      <!-- Meter -->
      <Meter peakDb={track.peakDb} />
    </div>
  {/each}

  <!-- Master channel -->
  <div class="master-channel">
    <h3>Master</h3>
    <Fader value={masterVolume} onchange={(v) => setMasterVolume(v)} />
    <Meter peakDb={masterPeakDb} />
  </div>
</div>
```

### 4. Automation UI (`src/lib/components/automation/AutomationLane.svelte`)

Canvas-based envelope editor:

```typescript
<script lang="ts">
  let points: AutomationPoint[] = $state([]);

  function drawAutomation(ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = '#00d9ff';
    ctx.lineWidth = 2;

    ctx.beginPath();
    points.forEach((point, i) => {
      const x = (point.time / totalDuration) * canvas.width;
      const y = (1 - point.value) * canvas.height;

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Draw points
    points.forEach(point => {
      const x = (point.time / totalDuration) * canvas.width;
      const y = (1 - point.value) * canvas.height;

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    });
  }
</script>

<canvas bind:this={canvas}></canvas>
```

## Testing

### Unit Tests
- Volume/pan calculations
- Solo/mute logic
- Automation interpolation
- Send routing

### Integration Tests
- Fader changes apply to audio
- Solo isolates tracks
- Automation playback works
- Meters reflect audio levels

## Git Branch
`mixing-console`

## Success Criteria
- ✅ All faders smooth and responsive
- ✅ Solo/mute work correctly
- ✅ Automation recording captures movements
- ✅ Automation playback accurate (<5ms)
- ✅ Meters update at 60fps
- ✅ Send/return effects functional

**Start with mixer core, then build UI components.**
```

---

