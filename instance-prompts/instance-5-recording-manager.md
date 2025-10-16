## 🎤 Instance 5: Recording Manager + Takes

```markdown
# Claude Code Prompt: Loop Recording & Takes System

## Mission
Implement professional loop recording with automatic take management and count-in.

## Context Files
1. `PHASE_3_FREESTYLE_FLOW_ARCHITECTURE.md` (section 4: Recording Manager)
2. Audio Recording section from comprehensive spec

## Deliverables

### 1. Recording Manager (`src/lib/audio/recording/RecordingManager.ts`)

```typescript
interface RecordingOptions {
  bars: number;
  trackName?: string;
  countInBars?: number;
  metronomeVolume?: number;
}

interface Take {
  id: string;
  passIndex: number;
  startBar: number;
  endBar: number;
  clip: AudioBuffer;
  metrics: {
    peakDb: number;
    rmsDb: number;
    snr: number;
    timingErrorMs: number;
  };
  timestamp: Date;
}

class RecordingManager {
  async startLoopRecording(opts: RecordingOptions): Promise<{trackId: string}> {
    // 1. Set loop region
    // 2. Set up metronome
    // 3. Count-in
    // 4. Start recording
    // 5. Listen for loop events
  }

  async stopRecording() {
    // Return all takes
  }

  private async countIn(bars: number, metronome: Tone.MetalSynth) {
    // Visual count-in with metronome clicks
  }

  private async processTake(audioData: Blob, passIndex: number): Promise<Take> {
    // Convert to AudioBuffer
    // Calculate metrics
    // Save to database
  }
}
```

### 2. Recording HUD Component (`src/lib/components/recording/RecordHUD.svelte`)

```typescript
<script lang="ts">
  interface Props {
    isRecording: boolean;
    countInState?: { beat: number; bar: number };
    currentTake: number;
    loopRange: { start: number; end: number };
  }
</script>

<div class="recording-hud">
  {#if countInState}
    <div class="count-in">
      <div class="bar">{countInState.bar}</div>
      <div class="beat">{countInState.beat}</div>
    </div>
  {:else if isRecording}
    <div class="recording-status">
      <div class="rec-indicator">● REC</div>
      <div class="take-number">Take {currentTake}</div>
    </div>
  {/if}
</div>
```

## Supabase Schema

```sql
create table if not exists takes (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null,
  track_id text not null,
  pass_index int not null,
  peak_db float,
  rms_db float,
  snr float,
  timing_err_ms float,
  created_at timestamptz default now()
);
```

## Git Branch
`recording-takes`

## Success Criteria
- ✅ Count-in plays at correct tempo
- ✅ Recording starts sample-accurately after count-in
- ✅ Multiple takes captured per loop
- ✅ Take metrics calculated correctly
- ✅ Recording HUD provides clear visual feedback

**Start with basic recording, then add loop/take logic, finally metrics.**
```

---

