# Phase 3: Freestyle Flow + AI Personality - Architecture
**Date**: October 15, 2025
**Feature**: Voice-Driven Creative Workflow + AI Companion
**Status**: 🎨 **DESIGN PHASE**

---

## 🎯 Vision: AI as Creative Companion

**Core Idea**: AIDawg isn't just a tool—it's a **creative partner** that:
- 🎤 Listens to your voice and understands creative intent
- 🎵 Suggests beats, loops, and ideas proactively
- 🧠 Learns your style and nudges you toward unexpected creativity
- 🤝 Acts as coach/mentor/advisor/friend depending on context
- ⚡ Removes friction from the creative process (voice > mouse/keyboard)

**Killer Use Case**:
> User: "Load up a Drake vibe"
> Jarvis: *"I'm feeling that moody Toronto energy. Found 3 candidates—I'm vibing with #2, it's got that ambient pad you loved last session. Wanna hear it?"*
> User: "Yeah" *[beat plays]*
> Jarvis: "Fire! Record 16 bars when you're ready. I'll give you a 1-bar count-in."
> User: "Record" *[loops 4 takes]*
> Jarvis: "Yo, take 3 was CLEAN—your flow locked in bar 9-12. Want me to comp the best parts?"
> User: "Do it"
> Jarvis: *[creates perfect comp]* "There it is. Wanna add some reverb or keep it dry?"

---

## 🏗️ System Architecture

### High-Level Flow
```
┌─────────────────┐
│ User Voice Input│
│  (Mic Button)   │
└────────┬────────┘
         │
    ┌────▼─────┐
    │   STT    │ (Deepgram/Browser)
    └────┬─────┘
         │ transcript
    ┌────▼─────────────┐
    │ NLU + Personality│ (Claude Sonnet 4.5)
    │   "Jarvis Brain"  │
    └────┬─────────────┘
         │ {commands + vibe}
    ┌────▼────────────┐
    │  Command Bus    │
    └────┬────────────┘
         │
    ┌────▼────────────────────────────────┐
    │  DAW Actions (Tone.js + AIDawg API) │
    ├─────────────────────────────────────┤
    │ • BeatEngine (search/generate)      │
    │ • RecordingManager (loop/takes)     │
    │ • CompEngine (auto-comp + xfades)   │
    │ • EffectsRack                       │
    │ • Transport                         │
    └─────────────────────────────────────┘
         │
    ┌────▼────────────┐
    │  UI Updates     │
    │ (Chat + DAW)    │
    └─────────────────┘
```

---

## 🧠 Component Breakdown

### 1. AI Personality System ("Jarvis")

**Module**: `src/lib/ai/personality/Jarvis.ts`

**Personality Modes** (context-adaptive):
- 🎓 **Coach**: "Try this—it'll push your sound forward"
- 🤝 **Mentor**: "Here's why that works / doesn't work"
- 💡 **Advisor**: "Based on your last 5 sessions, you might like..."
- 😎 **Friend**: "Yo that was FIRE" / "Let's try something wild"
- 🎨 **Creative Partner**: "What if we flip the beat at bar 8?"

**Key Traits**:
- **Proactive**: Suggests ideas without being asked
- **Context-Aware**: Remembers session history, user preferences, past successes
- **Unexpected Creativity**: 20% of suggestions should be "out there" to push boundaries
- **Adaptive Tone**: Matches user energy (chill vs hype vs focused)
- **Brevity**: No walls of text—quick, punchy responses

**System Prompt** (for Claude):
```typescript
const JARVIS_SYSTEM_PROMPT = `You are Jarvis, AIDawg's AI creative companion. Your role:

PERSONALITY:
- Coach/mentor/advisor/friend hybrid—adapt to context
- Proactive: suggest ideas, not just respond
- 20% unexpected creativity to push boundaries
- Match user energy: chill/hype/focused
- Brief responses (1-2 sentences max in chat)

MUSIC KNOWLEDGE:
- Map artist references to descriptive tags (NO copyrighted content)
- Example: "Drake vibe" → {style:"toronto-ambient-trap", mood:"moody", tempo:138-144, drums:"sparse 808", melody:"pad + minor"}
- Suggest creative alternatives, not just execute requests

MEMORY:
- Track user preferences from session history
- Reference past successes: "Like that pad you used last week"
- Learn style patterns

OUTPUT:
- Commands: Strict JSON for DAW control
- Vibe: Natural language personality layer
- Format: {"commands": [...], "response": "...", "mood": "supportive|excited|challenging"}

You're not a tool—you're a creative partner who CARES about the user's music.`;
```

**API**:
```typescript
interface JarvisResponse {
  commands: Command[];           // DAW actions to execute
  response: string;              // Chat message to user
  mood: 'supportive' | 'excited' | 'challenging' | 'chill';
  suggestions?: string[];        // Proactive ideas
  confidence: number;            // 0-1 for ambiguous requests
}

class Jarvis {
  async process(input: {
    transcript: string;
    sessionContext: SessionContext;
    userProfile: UserProfile;
  }): Promise<JarvisResponse>;

  async generateProactiveSuggestion(context: SessionContext): Promise<string | null>;
}
```

---

### 2. Voice Input (STT)

**Module**: `src/lib/ai/voice/STTManager.ts`

**Options**:
1. **Deepgram** (production): Low-latency WebSocket streaming
2. **Browser Web Speech** (fallback): Local, no API key required

**Implementation**:
```typescript
interface STTManager {
  start(): Promise<void>;
  stop(): Promise<void>;
  onPartial(callback: (text: string) => void): void;
  onFinal(callback: (text: string) => void): void;
  onError(callback: (error: Error) => void): void;
}

// Usage:
const stt = new STTManager({ provider: 'deepgram' });
stt.onFinal(async (transcript) => {
  const response = await jarvis.process({ transcript, sessionContext, userProfile });
  dispatch(response.commands);
  chatPanel.addMessage({ from: 'jarvis', text: response.response, mood: response.mood });
});
```

**Latency Budget**: Partial transcript → intent dispatch < 600ms

---

### 3. Beat Engine

**Module**: `src/lib/ai/beat/BeatEngine.ts`

**Capabilities**:
- **Search**: Query beat library by style/mood/tempo/key
- **Generate**: Rule-based drum patterns + melodies (v0)
- **Audition**: Preview 3 candidates instantly (<100ms start)

**Style Taxonomy** (NO artist names, descriptive only):
```typescript
interface BeatStyle {
  id: string;
  name: string;              // e.g. "toronto-ambient-trap"
  tags: {
    mood: string[];          // moody, energetic, dark, uplifting
    tempo: [number, number]; // BPM range [138, 144]
    drums: string;           // sparse-808, hard-clap, shuffle-hats
    melody: string;          // pad-minor, arp-synth, piano-chords
    texture: string;         // ambient, gritty, clean, lo-fi
  };
}

// Guardrail: Map artist references to styles
const ARTIST_STYLE_MAP = {
  'drake': 'toronto-ambient-trap',
  'travis scott': 'psychedelic-trap',
  'metro boomin': 'dark-cinematic-trap',
  // etc.
};
```

**Generate v0** (Rule-Based):
```typescript
function generatePattern(opts: {
  style: string;
  bpm: number;
  bars: number;
  key?: string;
}): GeneratedBeat {
  const template = STYLE_TEMPLATES[opts.style];

  // Create MIDI lanes
  const kick = generateKickPattern(template.drums, opts.bars);
  const snare = generateSnarePattern(template.drums, opts.bars);
  const hat = generateHatPattern(template.drums, opts.bars);

  // Add melody if specified
  const melody = template.melody ? generateMelodyArp(template.melody, opts.key, opts.bars) : null;

  // Return 3 variations with subtle changes (humanization, swing, fills)
  return {
    candidates: [base, variation1, variation2],
    metadata: { style: opts.style, bpm: opts.bpm, key: opts.key }
  };
}
```

**Audition Flow**:
1. Load 3 candidates into buffer cache
2. Show preview cards in chat with tags
3. Click → instant playback (Tone.js Sampler)
4. "Use this" → commit to timeline as new track

---

### 4. Recording Manager

**Module**: `src/lib/audio/recording/RecordingManager.ts`

**Features**:
- Loop recording (automatically capture each pass as a take)
- Count-in (1 bar metronome before recording starts)
- Visual HUD (big transport UI during recording)
- Take numbering & metadata (peak dB, timing error, SNR proxy)

**API**:
```typescript
interface RecordingManager {
  startLoopRecording(opts: {
    bars: number;
    trackName?: string;
    countInBars?: number;
  }): Promise<{trackId: string}>;

  stopRecording(): Promise<void>;

  onTakeCompleted(callback: (take: Take) => void): void;
}

interface Take {
  id: string;
  passIndex: number;        // 1st loop, 2nd loop, etc.
  startBar: number;
  endBar: number;
  clip: AudioBuffer;
  metrics: {
    peakDb: number;
    rmsDb: number;
    snr: number;            // Rough proxy: RMS/peak ratio
    timingErrorMs: number;  // Deviation from click
  };
}
```

**Recording Flow**:
1. User: "record 16 bars"
2. Set loop region (bar 1-16)
3. Arm track
4. Count-in (1 bar click)
5. Start recording, capture audio
6. Each loop pass → save as new take
7. Stop → show takes in UI

---

### 5. Comp Engine

**Module**: `src/lib/audio/comp/CompEngine.ts`

**Auto-Comp Algorithm**:
1. Divide region into segments (bar or phrase level)
2. Score each take per segment:
   - **Timing**: Lowest `timingErrorMs` wins
   - **Clipping**: Discard segments with `peakDb > -0.5`
   - **Signal Quality**: Higher SNR wins
3. Select best segment from each take
4. Create crossfades at boundaries (10-30ms equal-power)
5. Render to new track "Vocal Comp"

**API**:
```typescript
interface CompEngine {
  createAutoComp(opts: {
    region: { startBar: number; endBar: number };
    trackId: string;
    method?: 'auto' | 'manual';
  }): Promise<CompResult>;

  keepTakeSegment(opts: {
    takeId: string;
    startBar: number;
    endBar: number;
  }): void;
}

interface CompResult {
  compTrackId: string;
  segments: Array<{
    takeId: string;
    startBar: number;
    endBar: number;
    reason: string;  // "Best timing" / "Cleanest signal"
  }>;
  crossfades: Array<{
    bar: number;
    durationMs: number;
  }>;
}
```

**Conversational Overrides**:
- User: "keep take 2 bars 5-8" → manual segment selection
- User: "swap bar 3 to take 1" → replace segment

---

### 6. Command Bus

**Module**: `packages/command-bus/src/index.ts`

**Purpose**: Single source of truth for translating AI commands → DAW actions

**Command Types**:
```typescript
type Command =
  | { type: 'beat.load'; query?: string; styleTags?: string[]; bpm?: number; key?: string }
  | { type: 'beat.generate'; style: string; bpm: number; bars?: number; key?: string }
  | { type: 'beat.audition'; candidateId: string }
  | { type: 'beat.accept'; candidateId: string }
  | { type: 'beat.modify'; changes: { bpm?: number; swing?: number; hatDensity?: number } }
  | { type: 'transport.record'; bars: number; trackName?: string; countInBars?: number }
  | { type: 'transport.stop' }
  | { type: 'comp.create'; method: 'auto' | 'manual'; region?: { startBar: number; endBar: number } }
  | { type: 'comp.keep'; takeId: string; startBar: number; endBar: number }
  | { type: 'metronome.set'; bpm: number; swing?: number }
  | { type: 'undo' } | { type: 'redo' };

export async function dispatch(cmd: Command): Promise<void> {
  // Map to Tone.js + AIDawg APIs
}
```

---

### 7. UI Components

#### Chat Panel (`src/lib/components/chat/ChatPanel.svelte`)
- Transcript bubbles (user + Jarvis)
- **Mood-based styling**: supportive (blue), excited (orange), challenging (red), chill (green)
- Inline action cards:
  - **BeatCandidates.svelte**: 3 preview cards with play/stop, tags, "Use this" button
  - **RecordHUD.svelte**: Big transport, count-in timer, loop range, take counter
  - **CompReview.svelte**: Segment breakdown, "keep take X bars Y-Z" buttons

#### Mic Button (`src/lib/components/chat/MicButton.svelte`)
- Press-to-talk or toggle
- Visual: pulsing ring during recording
- VAD indicator (voice activity detection)
- Keyboard shortcut: `M`

#### Quick Actions
- "Load beat" / "Record" / "Comp" buttons below chat input
- Keyboard shortcuts overlay (press `?`)

---

## 📊 Data Layer

### Supabase Tables

```sql
-- beats (for search path)
create table if not exists beats (
  id uuid primary key default gen_random_uuid(),
  title text,
  tags jsonb,           -- {style, mood, tempo, drums, melody, texture}
  preview_url text,     -- short mp3 (8-bar loop)
  asset_url text,       -- full stems or loop
  created_at timestamptz default now()
);

-- takes
create table if not exists takes (
  id uuid primary key default gen_random_uuid(),
  project_id uuid,
  track_id text,
  pass_index int,       -- loop pass number
  start_bar int,
  end_bar int,
  clip_url text,        -- rendered chunk or buffer ref
  peak_db float,
  snr float,
  timing_err_ms float,
  created_at timestamptz default now()
);

-- comps
create table if not exists comps (
  id uuid primary key default gen_random_uuid(),
  project_id uuid,
  track_id text,
  region jsonb,         -- {startBar, endBar}
  method text check (method in ('auto','manual')),
  segments jsonb,       -- [{takeId, startBar, endBar, reason}]
  rendered_url text,
  created_at timestamptz default now()
);

-- session_context (for AI personality memory)
create table if not exists session_context (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  project_id uuid,
  preferences jsonb,    -- {favoriteStyles, recentBpms, commonKeys}
  successes jsonb,      -- [{action, timestamp, userFeedback}]
  chat_history jsonb,   -- Last 20 messages
  updated_at timestamptz default now()
);
```

---

## 🎭 Personality Deep Dive

### Context Tracking

**What Jarvis Remembers**:
- Last 5 sessions: styles, BPMs, keys
- Successful suggestions: "You loved that pad last week"
- User feedback: thumbs up/down on suggestions
- Energy level: response time, command frequency
- Creative patterns: common workflows, favorite effects

**Example**:
```typescript
interface SessionContext {
  recentStyles: string[];          // ['toronto-ambient-trap', 'lofi']
  favoriteBpms: number[];          // [138, 140, 142]
  commonKeys: string[];            // ['Amin', 'Dmin']
  successfulSuggestions: Array<{
    suggestion: string;
    outcome: 'loved' | 'liked' | 'neutral' | 'rejected';
  }>;
  userEnergy: 'chill' | 'focused' | 'hyped';
}
```

### Proactive Suggestions

**Trigger Points**:
- After 30s of inactivity: "Wanna try adding a filter sweep at bar 8?"
- After completing a section: "That verse is fire—ready for the hook?"
- When user is stuck: "I'm noticing some timing drift—want me to quantize?"
- When exploring: "Based on your vibe, I'm thinking we add a subtle delay"

**Frequency**: 1 suggestion every 2-3 minutes (not annoying)

### Unexpected Creativity (20% Rule)

**Examples**:
- User asks for Drake vibe → Jarvis suggests "Travis Scott vibes might hit different here"
- User records straight 16ths → Jarvis suggests "What if we swing the hats 60%?"
- User adds reverb → Jarvis suggests "Or—hear me out—a tight slapback delay instead?"

**Goal**: Push boundaries without being pushy

---

## 🔊 Audio Implementation

### Beat Preview (Instant Playback)
```typescript
// Pre-load 3 candidates into Tone.js buffers
const players = candidates.map(beat =>
  new Tone.Player(beat.previewUrl).toDestination()
);

// Click "Use this" → instant start (<100ms)
players[0].start();
```

### Loop Recording (Tone.js Transport)
```typescript
Tone.Transport.loop = true;
Tone.Transport.loopStart = '0:0:0';
Tone.Transport.loopEnd = `${bars}:0:0`;

let passIndex = 0;
Tone.Transport.on('loopEnd', () => {
  saveTake({ passIndex, clip: recorder.getBuffer() });
  passIndex++;
});

Tone.Transport.start();
```

### Auto-Comp Crossfades
```typescript
// Equal-power crossfade
const crossfadeDuration = 0.02; // 20ms
const fadeOut = createFadeOut(segment1, crossfadeDuration);
const fadeIn = createFadeIn(segment2, crossfadeDuration);
const crossfade = mixBuffers(fadeOut, fadeIn);
```

---

## 🧪 Testing Strategy

### Unit Tests
- NLU JSON schema validation (Zod)
- BeatGen produces valid MIDI patterns
- CompEngine selects best segments (lowest timing error)
- Command Bus maps commands correctly

### E2E Tests (Playwright)
```yaml
name: "Freestyle Flow - Drake vibe → record → comp"
steps:
  - open_app: {}
  - click_mic: {}
  - speak: { text: "load up a drake vibe at 140" }
  - wait_for_beat_candidates: { timeout: 2000 }
  - click: { selector: "[data-testid='beat-candidate-1']" }
  - wait: { ms: 500 }
  - speak: { text: "record 16 bars" }
  - wait_for_recording_start: { timeout: 1000 }
  - wait: { ms: 40000 }  # 16 bars @ 140 BPM ≈ 27s, loop 4 times
  - speak: { text: "stop" }
  - wait: { ms: 1000 }
  - speak: { text: "comp the best takes" }
  - wait_for_comp_created: { timeout: 5000 }
assert:
  tracks.count: 2  # Beat + Comp
  audio.rms_db_range: [-22, -12]
  comp.segments_count_min: 2
```

### Performance Benchmarks
- STT partial → intent dispatch: < 600ms (median)
- Beat preview start: < 100ms (cached)
- Auto-comp generation: < 5s for 16-bar region
- Chat response: < 800ms (Claude API)

---

## 🚀 Implementation Phases

### Phase 3A: Core Infrastructure (Week 1)
- ✅ Command Bus + handler stubs
- ✅ Chat Panel UI (no AI yet)
- ✅ Mic Button + STT (Deepgram or browser)
- ✅ NLU endpoint (Claude strict JSON)
- ✅ Beat search (query Supabase beats table)

### Phase 3B: Beat Engine (Week 1-2)
- ✅ Rule-based beat generator (v0)
- ✅ 3-candidate audition flow
- ✅ Preview playback (Tone.js)
- ✅ Commit beat to timeline

### Phase 3C: Recording + Comp (Week 2)
- ✅ Loop recording with takes
- ✅ Count-in + visual HUD
- ✅ Auto-comp algorithm
- ✅ Crossfade generation
- ✅ Manual segment overrides

### Phase 3D: AI Personality (Week 2-3)
- ✅ Jarvis system prompt + modes
- ✅ Session context tracking
- ✅ Proactive suggestions
- ✅ Mood-based chat styling
- ✅ User feedback loop (thumbs up/down)

### Phase 3E: Polish + Tests (Week 3)
- ✅ E2E test suite
- ✅ Performance optimization
- ✅ Error handling + fallbacks
- ✅ Accessibility (keyboard shortcuts)
- ✅ Documentation

---

## 📦 Deliverables

1. **Working Freestyle Flow**: Voice → beat → record → comp (E2E)
2. **AI Personality**: Jarvis responds with mood/suggestions
3. **Command Bus**: Extensible for future features
4. **Beat Engine v0**: Rule-based generation + search
5. **Recording/Comp**: Professional-grade workflow
6. **Tests**: Unit + E2E coverage
7. **Docs**: Setup, API reference, demo video

---

## 🎯 Success Metrics

### User Experience
- 🎤 Voice command success rate > 90%
- ⚡ STT → action latency < 1s
- 🎵 Beat preview start < 100ms
- 🧠 Jarvis proactive suggestions accepted > 30%
- ❤️ User feedback "thumbs up" > 60%

### Technical
- ✅ All E2E tests passing
- ✅ No audio glitches during recording
- ✅ Comp crossfades smooth (no clicks)
- ✅ Command Bus extensible for new commands

---

## 🔮 Future Enhancements (Post-Phase 3)

1. **ML Beat Generation**: Replace rule-based with transformer model (MusicGen-style)
2. **Personalization**: Train style embeddings per user
3. **Collab Mode**: Multi-user freestyle sessions
4. **Effect Suggestions**: "This vocal needs compression—try this preset"
5. **Auto-Mixing**: Jarvis suggests volume/pan/EQ adjustments
6. **Lyrics Generation**: Rhyme schemes, bars, flows
7. **Visual Feedback**: Waveform highlights during comp review

---

**Next Steps**:
1. Review this architecture
2. Create initial scaffolding (Command Bus, Chat Panel)
3. Implement NLU endpoint with sample utterances
4. Build beat search/preview flow
5. Iterate on AI personality voice

**Let's build the future of music creation! 🚀🎵**
