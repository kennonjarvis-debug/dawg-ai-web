## 🎚️ Instance 8: Effects Processor

```markdown
# Claude Code Prompt: Effects Processor System

## Mission
Implement professional audio effects with Tone.js integration and real-time parameter control.

## Context Files
1. Comprehensive spec: Effects Processor section
2. `TESTING_FINAL_STATUS.md` for effect rendering patterns

## Deliverables

### 1. Effect Base Class (`src/lib/audio/effects/Effect.ts`)

```typescript
abstract class Effect {
  protected toneEffect: Tone.Effect;
  protected parameters: Map<string, number>;

  abstract applyToOfflineContext(
    ctx: OfflineAudioContext,
    source: AudioNode,
    destination: AudioNode
  ): AudioNode;

  setParameter(name: string, value: number): void;
  getParameter(name: string): number;
  toJSON(): any;
  fromJSON(data: any): void;
}
```

### 2. Core Effects

Implement with offline rendering support:
- **Reverb.ts**: Convolution reverb with decay control
- **Delay.ts**: Standard, ping-pong, tape modes
- **Compressor.ts**: Threshold, ratio, attack, release
- **EQ.ts**: Multi-band parametric EQ
- **Distortion.ts**: Saturation and distortion
- **Limiter.ts**: Loudness control

Each effect MUST implement `applyToOfflineContext()` for export/bounce.

### 3. Effects Rack (`src/lib/audio/effects/EffectsRack.ts`)

```typescript
class EffectsRack {
  private effects: Effect[] = [];

  addEffect(effect: Effect, position?: number): void;
  removeEffect(effectId: string): void;
  reorderEffects(fromIndex: number, toIndex: number): void;

  connectToTrack(track: Track): void;
  applyToOfflineContext(ctx: OfflineAudioContext, source: AudioNode): AudioNode;
}
```

### 4. Effect UI Components

Create Svelte components for effect controls:
- `EffectSlot.svelte`: Container with enable/bypass/remove
- `ReverbControls.svelte`: Decay, mix, pre-delay
- `EQControls.svelte`: Visual frequency response curve
- `CompressorControls.svelte`: Threshold, ratio, gain reduction meter

## Testing

### Unit Tests
- Effect parameter validation
- Offline rendering produces output
- Effect chain ordering

### Integration Tests
- Effects apply to real audio
- Parameter automation works
- Preset save/load

### Quality Tests
```
[ ] Reverb tail length matches decay setting
[ ] Compressor reduces dynamic range correctly
[ ] EQ frequency response matches curve
[ ] No audio artifacts (aliasing, clipping)
```

## Git Branch
`effects-processor`

## Success Criteria
- ✅ All 6 core effects implemented
- ✅ Offline rendering working (for export)
- ✅ Real-time parameter changes smooth
- ✅ Effect presets save/load
- ✅ UI controls intuitive and responsive
- ✅ CPU usage <30% for 5 effects per track

**Reference existing reverb implementation in AudioEngine.ts for offline rendering patterns.**
```

---

