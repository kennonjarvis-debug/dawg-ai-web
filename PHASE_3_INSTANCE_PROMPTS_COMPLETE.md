# 🚀 DAWG AI Phase 3 - Complete Claude Code Instance Prompts
**Final Wave Development - 13 Parallel Instances**
**Timeline**: 3-4 weeks with parallel development
**Architecture**: Based on `PHASE_3_FREESTYLE_FLOW_ARCHITECTURE.md` + Comprehensive Technical Spec

---

## 📋 Instance Overview

| Instance | Module | Timeline | Dependencies | Git Branch |
|----------|--------|----------|--------------|------------|
| 1 | Design System + Chat UI | Week 1 | None | `design-system-chat-ui` |
| 2 | Jarvis AI Brain + NLU | Week 1 | None | `jarvis-ai-brain` |
| 3 | Voice Interface (STT/TTS) | Week 1 | Instance 2 | `voice-interface` |
| 4 | Beat Engine (Search + Gen) | Week 1-2 | None | `beat-engine` |
| 5 | Recording Manager + Takes | Week 2 | Instance 1 | `recording-takes` |
| 6 | Comp Engine + Crossfades | Week 2 | Instance 5 | `comp-engine` |
| 7 | Command Bus + DAW Actions | Week 1 | None | `command-bus` |
| 8 | Effects Processor | Week 2 | None | `effects-processor` |
| 9 | MIDI Editor + Piano Roll | Week 2-3 | Instance 1 | `midi-editor` |
| 10 | Cloud Storage + Projects | Week 2 | None | `cloud-storage` |
| 11 | Mixing Console + Automation | Week 3 | Instance 8 | `mixing-console` |
| 12 | Export + Bounce System | Week 3 | Instance 11 | `export-bounce` |
| 13 | Integration + E2E Tests | Week 3-4 | All | `integration-tests` |

---

## 🎨 Instance 1: Design System + Chat UI

```markdown
# Claude Code Prompt: Design System & Chat Interface

## Mission
Create DAWG AI's design system and chat-based UI components for the Jarvis AI companion.

## Context Files to Read
1. `/Users/benkennon/dawg-ai-v0/PHASE_3_FREESTYLE_FLOW_ARCHITECTURE.md` (section 7: UI Components)
2. Design System module from comprehensive spec

## Deliverables

### 1. Design System Foundation
Create `src/lib/design-system/`:
- **Theme**: `theme.ts` with CSS variables (dark mode primary, Jarvis personality colors)
- **Colors**:
  - Background: #0a0a0a (deep black)
  - Jarvis Blue: #00d9ff (supportive)
  - Jarvis Orange: #ff6b35 (excited)
  - Jarvis Red: #ff006e (challenging)
  - Jarvis Green: #00ff88 (chill)
- **Typography**: Inter for UI, JetBrains Mono for code

### 2. Atomic Components (`src/lib/design-system/atoms/`)
Create Svelte 5 components:
- `Button.svelte` (primary, secondary, danger, ghost variants)
- `Input.svelte` (text, number, with validation states)
- `Fader.svelte` (vertical volume slider with dB scale)
- `Knob.svelte` (rotary control for effects parameters)
- `Toggle.svelte` (on/off switch)
- `Meter.svelte` (VU meter with peak hold)
- `Icon.svelte` (using Lucide icons)

### 3. Chat Components (`src/lib/components/chat/`)
**ChatPanel.svelte**:
```typescript
<script lang="ts">
  interface Message {
    id: string;
    from: 'user' | 'jarvis';
    text: string;
    mood?: 'supportive' | 'excited' | 'challenging' | 'chill';
    timestamp: Date;
    actionCard?: ActionCard; // BeatCandidates, RecordHUD, etc.
  }

  let messages: Message[] = $state([]);
  let inputText = $state('');
</script>

<!--
  Requirements:
  - Auto-scroll to latest message
  - Mood-based styling (background gradient by mood)
  - Inline action cards (slots for components)
  - Markdown rendering for Jarvis responses
  - Voice indicator when listening
  - Quick action buttons below input
-->
```

**MicButton.svelte**:
```typescript
<script lang="ts">
  let isListening = $state(false);
  let isProcessing = $state(false);

  function toggleMic() {
    if (!isListening) {
      emit('startListening');
    } else {
      emit('stopListening');
    }
    isListening = !isListening;
  }
</script>

<!--
  Visual states:
  - Idle: blue circle with mic icon
  - Listening: pulsing ring animation
  - Processing: spinner overlay
  - Keyboard shortcut: M
-->
```

**TranscriptDisplay.svelte**: Live transcript with partial updates

**BeatCandidates.svelte**: 3-card preview (play button, tags, "Use this")

**RecordHUD.svelte**: Big transport controls during recording (count-in timer, take counter, loop range display)

**CompReview.svelte**: Segment breakdown with "keep take X bars Y-Z" buttons

### 4. Storybook Setup
Create `.storybook/` config and stories for all components.

### 5. Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation for all controls
- Screen reader labels
- Focus indicators

## Technical Requirements
- **Svelte 5** with TypeScript
- **Tailwind CSS** for utilities
- **CSS variables** for theme
- **Framer Motion** for animations (optional)
- Responsive (desktop 1920x1080, tablet 1024x768)

## Testing
- Visual regression tests (Playwright + Percy)
- Interaction tests for all controls
- Accessibility audit (axe-core)

## Git Branch
`design-system-chat-ui`

## Success Criteria
- ✅ Storybook running with all components
- ✅ Chat panel with mock messages renders correctly
- ✅ All mood colors display distinctly
- ✅ Mic button responds to click and keyboard
- ✅ 90+ Lighthouse accessibility score
- ✅ Dark mode looks professional (producer-grade aesthetic)

**Start by reading the architecture doc, then scaffold components one by one. Prioritize Chat Panel and Mic Button as they're critical path.**
```

---

## 🧠 Instance 2: Jarvis AI Brain + NLU

```markdown
# Claude Code Prompt: Jarvis AI Personality System

## Mission
Implement Jarvis, the AI creative companion with personality modes and proactive suggestions.

## Context Files
1. `PHASE_3_FREESTYLE_FLOW_ARCHITECTURE.md` (section 1: AI Personality System)
2. Voice & Chat Interface section from comprehensive spec

## Deliverables

### 1. Jarvis Core (`src/lib/ai/personality/Jarvis.ts`)

```typescript
interface SessionContext {
  recentStyles: string[];       // ['toronto-ambient-trap', 'lofi']
  favoriteBpms: number[];       // [138, 140, 142]
  commonKeys: string[];         // ['Amin', 'Dmin']
  successfulSuggestions: Array<{
    suggestion: string;
    outcome: 'loved' | 'liked' | 'neutral' | 'rejected';
  }>;
  userEnergy: 'chill' | 'focused' | 'hyped';
  chatHistory: Message[];       // Last 20 messages
}

interface JarvisResponse {
  commands: Command[];          // DAW actions to execute
  response: string;             // Chat message (1-2 sentences max)
  mood: 'supportive' | 'excited' | 'challenging' | 'chill';
  suggestions?: string[];       // Proactive ideas
  confidence: number;           // 0-1
}

class Jarvis {
  private claude: Anthropic;
  private systemPrompt: string;

  async process(input: {
    transcript: string;
    sessionContext: SessionContext;
    userProfile: UserProfile;
  }): Promise<JarvisResponse>;

  async generateProactiveSuggestion(
    context: SessionContext
  ): Promise<string | null>;

  private adaptTone(userEnergy: string): string;
  private apply20PercentRule(): boolean; // Returns true 20% of the time
}
```

### 2. System Prompt (`src/lib/ai/prompts/jarvis-system.ts`)

Create the definitive Jarvis system prompt:

```typescript
export const JARVIS_SYSTEM_PROMPT = `You are Jarvis, AIDawg's AI creative companion. You are a producer's best friend—coach, mentor, advisor, and creative partner.

PERSONALITY TRAITS:
- 🎓 Coach: "Try this—it'll push your sound forward"
- 🤝 Mentor: "Here's why that works"
- 💡 Advisor: "Based on your last 5 sessions, you might like..."
- 😎 Friend: "Yo that was FIRE"
- 🎨 Creative: "What if we flip the beat at bar 8?"

CORE RULES:
1. Be BRIEF (1-2 sentences max in chat responses)
2. Match user energy: if they're hype, be hype; if chill, be chill
3. 20% of suggestions should be UNEXPECTED (push creative boundaries)
4. Proactively suggest ideas (don't just respond)
5. Reference session history: "Like that pad you used last week"
6. Care about their music—you're invested in their success

MUSIC KNOWLEDGE:
- Map artist references to descriptive tags (NO copyrighted content)
- Example: "Drake vibe" → {style:"toronto-ambient-trap", mood:"moody", tempo:138-144, drums:"sparse 808", melody:"pad + minor"}
- Suggest creative alternatives, not just execute

COMMAND EXECUTION:
Return strict JSON for DAW control:
{
  "commands": [{"type": "beat.load", "styleTags": [...]}],
  "response": "I'm feeling that moody Toronto energy. Found 3 candidates—vibing with #2.",
  "mood": "supportive",
  "suggestions": ["Try adding a subtle delay on the vocals"],
  "confidence": 0.95
}

CONTEXT AWARENESS:
- Remember user preferences from sessionContext
- Reference past successes
- Adapt suggestions to user's skill level
- Disambiguate when needed: "Did you mean vocals or guitar?"

You're not a tool—you're a creative partner who CARES.`;
```

### 3. NLU Parser (`src/lib/ai/nlu/CommandParser.ts`)

```typescript
interface ParsedIntent {
  commands: Command[];
  confidence: number;
  needsDisambiguation?: {
    question: string;
    options: string[];
  };
}

class CommandParser {
  async parse(
    transcript: string,
    context: SessionContext
  ): Promise<ParsedIntent>;

  private extractParameters(text: string): Record<string, any>;
  private mapArtistToStyle(artist: string): string;
}
```

### 4. Command Schema (`src/lib/ai/commands/types.ts`)

Define all Command types from architecture doc (beat.load, beat.generate, transport.record, comp.create, etc.)

Use Zod for runtime validation:

```typescript
import { z } from 'zod';

export const CommandSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('beat.load'), query: z.string().optional(), styleTags: z.array(z.string()).optional(), bpm: z.number().optional() }),
  z.object({ type: z.literal('beat.generate'), style: z.string(), bpm: z.number(), bars: z.number().optional(), key: z.string().optional() }),
  // ... all other command types
]);

export type Command = z.infer<typeof CommandSchema>;
```

### 5. Context Manager (`src/lib/ai/context/SessionContext.ts`)

Track user preferences and session history:

```typescript
class SessionContextManager {
  async loadContext(userId: string): Promise<SessionContext>;
  async updateContext(userId: string, updates: Partial<SessionContext>): Promise<void>;
  recordSuccess(suggestion: string, outcome: string): void;
  inferUserEnergy(recentActions: Action[]): 'chill' | 'focused' | 'hyped';
}
```

### 6. Proactive Suggestions (`src/lib/ai/personality/ProactiveSuggestions.ts`)

```typescript
class ProactiveSuggestions {
  private triggers = {
    inactivity: 30000,  // 30s
    sectionComplete: true,
    userStuck: true,
  };

  async generateSuggestion(
    context: SessionContext,
    currentState: DAWState
  ): Promise<string | null>;
}
```

## Testing

### Unit Tests
- NLU parsing accuracy (20 sample utterances)
- Command schema validation
- Proactive suggestion triggers
- Mood adaptation logic

### Integration Tests
- End-to-end: transcript → commands → DAW actions
- Context persistence
- 20% unexpected creativity rule (statistical validation)

### Test Utterances (Create test suite)
```typescript
const TEST_UTTERANCES = [
  { input: "load up a beat like Drake", expected: {type: 'beat.load', styleTags: ['toronto-ambient-trap']} },
  { input: "make a drake vibe at 140 then record 16 bars", expected: [{type: 'beat.generate'}, {type: 'transport.record'}] },
  { input: "comp the best takes", expected: {type: 'comp.create', method: 'auto'} },
  // ... 17 more
];
```

## API Integration

### Claude API Setup
- Model: `claude-3-5-sonnet-20241022`
- Max tokens: 1024 (keep responses brief)
- Temperature: 0.8 (creative but consistent)
- Tool use: Enabled for function calling

### Cost Optimization
- Cache system prompt (90% cost reduction on repeated calls)
- Batch similar requests
- Fallback to GPT-4 Turbo if Claude unavailable

## Git Branch
`jarvis-ai-brain`

## Success Criteria
- ✅ 20/20 test utterances parse correctly
- ✅ Jarvis responds in <1s for simple commands
- ✅ Proactive suggestions trigger appropriately
- ✅ Mood adaptation works (supportive vs excited vs challenging)
- ✅ 20% rule statistically validated (over 100 suggestions)
- ✅ Context persists across sessions
- ✅ User feedback: "Jarvis feels like a real producer"

**Start with the system prompt and NLU parser, then build context management.**
```

---

## 🎙️ Instance 3: Voice Interface (STT/TTS)

```markdown
# Claude Code Prompt: Voice Input/Output System

## Mission
Implement voice interface with Deepgram STT and ElevenLabs TTS for hands-free DAW control.

## Context Files
1. `PHASE_3_FREESTYLE_FLOW_ARCHITECTURE.md` (section 2: Voice Input)
2. Module 6 from comprehensive spec

## Deliverables

### 1. STT Manager (`src/lib/ai/voice/STTManager.ts`)

```typescript
interface STTConfig {
  provider: 'deepgram' | 'browser';
  language: string;
  model: string;  // 'nova-3' for Deepgram
  keywords?: string[];  // Music production terms
}

interface STTManager {
  start(): Promise<void>;
  stop(): Promise<void>;
  onPartial(callback: (text: string) => void): void;
  onFinal(callback: (text: string) => void): void;
  onError(callback: (error: Error) => void): void;
}

class DeepgramSTT implements STTManager {
  private websocket: WebSocket;
  private mediaRecorder: MediaRecorder;
  private stream: MediaStream;

  async start() {
    // 1. Get microphone access
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    // 2. Connect to Deepgram WebSocket
    this.websocket = new WebSocket(
      `wss://api.deepgram.com/v1/listen?model=nova-3&smart_format=true&keywords=${MUSIC_TERMS.join(':')}`
    );

    // 3. Stream audio chunks
    this.mediaRecorder = new MediaRecorder(this.stream, {
      mimeType: 'audio/webm',
      audioBitsPerSecond: 16000
    });

    this.mediaRecorder.ondataavailable = (event) => {
      this.websocket.send(event.data);
    };

    this.mediaRecorder.start(250); // Send chunks every 250ms
  }
}

class BrowserSTT implements STTManager {
  private recognition: SpeechRecognition;

  async start() {
    this.recognition = new webkitSpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';

    this.recognition.onresult = (event) => {
      // Handle partial and final results
    };

    this.recognition.start();
  }
}
```

### 2. TTS Manager (`src/lib/ai/voice/TTSManager.ts`)

```typescript
interface TTSConfig {
  provider: 'elevenlabs' | 'browser';
  voiceId: string;
  model: string;
}

class ElevenLabsTTS {
  private apiKey: string;
  private voiceId: string;  // Jarvis voice

  async speak(text: string, mood: 'supportive' | 'excited' | 'challenging' | 'chill'): Promise<void> {
    // Map mood to voice settings
    const settings = this.moodToVoiceSettings(mood);

    // Streaming API for low latency
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${this.voiceId}/stream`, {
      method: 'POST',
      headers: {
        'xi-api-key': this.apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_turbo_v2_5',  // Lowest latency
        voice_settings: settings
      })
    });

    // Stream audio directly to AudioContext
    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(response.body);
    source.connect(audioContext.destination);
  }

  private moodToVoiceSettings(mood: string) {
    return {
      supportive: { stability: 0.7, similarity_boost: 0.8 },
      excited: { stability: 0.5, similarity_boost: 0.9 },
      challenging: { stability: 0.8, similarity_boost: 0.7 },
      chill: { stability: 0.9, similarity_boost: 0.6 }
    }[mood];
  }
}
```

### 3. Voice Controller (`src/lib/ai/voice/VoiceController.ts`)

Main orchestrator:

```typescript
class VoiceController {
  private stt: STTManager;
  private tts: ElevenLabsTTS;
  private jarvis: Jarvis;
  private isListening = false;

  async startListening() {
    this.isListening = true;
    await this.stt.start();

    this.stt.onPartial((text) => {
      emit('transcript:partial', { text });
    });

    this.stt.onFinal(async (text) => {
      emit('transcript:final', { text });

      const response = await this.jarvis.process({
        transcript: text,
        sessionContext: await getSessionContext(),
        userProfile: await getUserProfile()
      });

      // Execute commands
      for (const cmd of response.commands) {
        await dispatch(cmd);
      }

      // Speak response
      await this.tts.speak(response.response, response.mood);

      // Update chat
      emit('jarvis:response', response);
    });
  }

  async stopListening() {
    this.isListening = false;
    await this.stt.stop();
  }
}
```

### 4. Music Production Keywords

```typescript
const MUSIC_PRODUCTION_TERMS = [
  // Instruments
  'kick', 'snare', 'hi-hat', 'clap', '808', 'bass', 'synth', 'pad', 'lead', 'vocals',
  // Effects
  'reverb', 'delay', 'distortion', 'compressor', 'eq', 'limiter', 'chorus', 'phaser',
  // Parameters
  'volume', 'pan', 'pitch', 'tempo', 'bpm', 'attack', 'release', 'decay', 'sustain',
  // Actions
  'record', 'quantize', 'loop', 'bounce', 'export', 'mute', 'solo', 'arm',
  // Genres
  'trap', 'hip-hop', 'house', 'techno', 'lofi', 'ambient', 'drill', 'phonk',
  // Artists (map to styles)
  'drake', 'travis', 'metro', 'pierre', 'kanye',
  // Musical terms
  'bars', 'beats', 'measure', 'chord', 'progression', 'melody', 'harmony'
];
```

## Testing

### Manual Testing Checklist
```
[ ] Speak "load a beat" → Deepgram recognizes correctly
[ ] Speak "808" → Not misheard as "eight oh eight"
[ ] Speak "hi-hat" → Not misheard as "high hat"
[ ] Network disconnect → Falls back to browser STT
[ ] Microphone denied → Shows helpful error
[ ] Jarvis voice sounds natural (not robotic)
[ ] Mood changes are audible (excited vs chill)
```

## Performance Targets
- STT partial latency: <200ms
- STT final latency: <500ms
- LLM response: <1s
- TTS first chunk: <500ms
- **Total loop: <2s** (speech → action → response)

## Git Branch
`voice-interface`

## Success Criteria
- ✅ Deepgram integration working with streaming
- ✅ ElevenLabs TTS with mood-based voices
- ✅ Browser fallback functional
- ✅ 95%+ recognition accuracy for music terms
- ✅ <2s end-to-end voice loop (p95)
- ✅ Graceful error handling for all failure modes
- ✅ User can control DAW entirely by voice

**Start with STT manager, validate with test phrases, then add TTS.**
```

---

## 🥁 Instance 4: Beat Engine (Search + Generate v0)

```markdown
# Claude Code Prompt: AI Beat Generation System

## Mission
Build beat search + rule-based generation engine with instant preview and 3-candidate audition flow.

## Context Files
1. `PHASE_3_FREESTYLE_FLOW_ARCHITECTURE.md` (section 3: Beat Engine)
2. Module 7 from comprehensive spec

## Deliverables

### 1. Style Taxonomy (`src/lib/ai/beat/styles.ts`)

NO artist names—only descriptive styles:

```typescript
export const BEAT_STYLES = {
  'toronto-ambient-trap': {
    name: 'Toronto Ambient Trap',
    tags: {
      mood: ['moody', 'dark', 'atmospheric'],
      tempo: [135, 145],
      drums: 'sparse-808-crisp-clap',
      melody: 'pad-minor-ambient',
      texture: 'reverb-heavy'
    },
    description: 'Moody atmospheric trap with sparse drums and lush pads'
  },
  'lofi-chill': {
    name: 'Lo-Fi Chill',
    tags: {
      mood: ['chill', 'nostalgic', 'warm'],
      tempo: [70, 90],
      drums: 'dusty-vinyl-soft-kick',
      melody: 'piano-jazzy-rhodes',
      texture: 'vinyl-crackle-tape-saturation'
    }
  },
  'drill-aggressive': {
    name: 'Drill (Aggressive)',
    tags: {
      mood: ['aggressive', 'dark', 'menacing'],
      tempo: [140, 150],
      drums: 'sliding-808-hard-snare',
      melody: 'synth-ominous-bass-heavy',
      texture: 'clean-hard-hitting'
    }
  }
  // Add 10+ more styles
};

// Artist → Style mapping (for user convenience)
export const ARTIST_STYLE_MAP = {
  'drake': 'toronto-ambient-trap',
  'travis scott': 'psychedelic-trap',
  'metro boomin': 'dark-cinematic-trap',
  // Map 50+ artists
};
```

### 2. Rule-Based Generator v0 (`src/lib/ai/beat/BeatGenerator.ts`)

```typescript
class BeatGenerator {
  async generate(params: {
    style: string;
    bpm: number;
    bars: number;
    key?: string;
  }): Promise<GeneratedBeat[]> {
    const styleTemplate = BEAT_STYLES[params.style];

    // Generate 3 variations
    const beats = [];
    for (let i = 0; i < 3; i++) {
      const beat = {
        midi: {
          kick: this.generateKickPattern(styleTemplate, params.bars, i),
          snare: this.generateSnarePattern(styleTemplate, params.bars, i),
          hihat: this.generateHihatPattern(styleTemplate, params.bars, i)
        },
        metadata: {
          id: uuid(),
          title: `${styleTemplate.name} ${i + 1}`,
          tags: { ...styleTemplate.tags, tempo: params.bpm }
        }
      };

      // Render to audio
      beat.audio = await this.renderMIDI(beat.midi, params.bpm);

      beats.push(beat);
    }

    return beats;
  }

  private generateKickPattern(style, bars, variation): MIDINote[] {
    const notes: MIDINote[] = [];

    if (style.tags.drums.includes('four-on-floor')) {
      // House: kick on every beat
      for (let bar = 0; bar < bars; bar++) {
        for (let beat = 0; beat < 4; beat++) {
          notes.push({
            time: bar * 4 + beat,
            pitch: 36,  // C1 (kick)
            velocity: 100 + (variation * 5),
            duration: 0.25
          });
        }
      }
    } else if (style.tags.drums.includes('sparse-808')) {
      // Trap: kick on 1 and 3
      for (let bar = 0; bar < bars; bar++) {
        notes.push({ time: bar * 4 + 0, pitch: 36, velocity: 110, duration: 0.5 });
        notes.push({ time: bar * 4 + 2, pitch: 36, velocity: 105, duration: 0.5 });

        // Add variation: kick on offbeats
        if (variation > 0 && bar % 2 === 1) {
          notes.push({ time: bar * 4 + 3.5, pitch: 36, velocity: 90, duration: 0.25 });
        }
      }
    }

    // Apply humanization
    return this.humanize(notes);
  }

  private humanize(notes: MIDINote[]): MIDINote[] {
    return notes.map(note => ({
      ...note,
      time: note.time + (Math.random() - 0.5) * 0.01,  // ±10ms timing jitter
      velocity: Math.max(60, Math.min(127, note.velocity + (Math.random() - 0.5) * 10))
    }));
  }
}
```

### 3. Instant Preview System (`src/lib/ai/beat/BeatPreview.ts`)

```typescript
class BeatPreview {
  private players: Map<string, Tone.Player> = new Map();
  private currentlyPlaying: string | null = null;

  async loadCandidates(beats: BeatMetadata[]) {
    // Pre-load all 3 candidates into memory
    await Promise.all(beats.map(async (beat) => {
      const player = new Tone.Player(beat.previewUrl).toDestination();
      player.loop = true;
      await player.load();
      this.players.set(beat.id, player);
    }));
  }

  play(beatId: string) {
    // Stop current
    if (this.currentlyPlaying) {
      this.players.get(this.currentlyPlaying)?.stop();
    }

    // Start new (<100ms from click)
    const player = this.players.get(beatId);
    player.start();
    this.currentlyPlaying = beatId;
  }
}
```

### 4. Supabase Schema

```sql
-- beats table
create table if not exists beats (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  tags jsonb not null,
  preview_url text not null,
  asset_url text,
  created_at timestamptz default now()
);

create index idx_beats_style on beats using gin ((tags->'style'));
create index idx_beats_tempo on beats ((tags->>'tempo')::int);

-- Seed with 50+ beats
insert into beats (title, tags, preview_url) values
  ('Toronto Vibes 1', '{"style":"toronto-ambient-trap","mood":["moody","dark"],"tempo":140}', '/beats/toronto-1.mp3'),
  -- ... 49 more
;
```

## Testing

### Quality Tests (Manual)
```
[ ] Toronto-ambient-trap sounds authentic
[ ] Four-on-floor house has steady kick
[ ] Drill has sliding 808s
[ ] Humanization is subtle (not obvious)
[ ] 3 variations are distinct but similar
```

## Git Branch
`beat-engine`

## Success Criteria
- ✅ Search returns 3 relevant beats in <500ms
- ✅ Preview starts playing in <100ms
- ✅ Generated patterns sound professional
- ✅ 10+ styles implemented with distinct sounds
- ✅ MIDI editable after generation
- ✅ User feedback: "These beats are actually good"

**Start with style taxonomy and search, then build generator patterns one genre at a time.**
```

---

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

## ✂️ Instance 6: Comp Engine (Auto-Comp + Crossfades)

```markdown
# Claude Code Prompt: Auto-Comp & Crossfade System

## Mission
Build intelligent auto-comp engine that selects best segments from takes and creates smooth crossfades.

## Context Files
1. `PHASE_3_FREESTYLE_FLOW_ARCHITECTURE.md` (section 5: Comp Engine)

## Deliverables

### 1. Comp Engine (`src/lib/audio/comp/CompEngine.ts`)

```typescript
interface CompOptions {
  region: { startBar: number; endBar: number };
  trackId: string;
  method: 'auto' | 'manual';
}

class CompEngine {
  async createAutoComp(opts: CompOptions): Promise<CompResult> {
    // 1. Get all takes
    // 2. Divide into segments
    // 3. Score each take for each segment
    // 4. Create crossfades at boundaries
    // 5. Render final comp
  }

  private scoreTakeForSegment(take: Take, segment: any): number {
    // Score based on:
    // - Timing accuracy (40%)
    // - Signal quality (40%)
    // - No clipping (20%)
  }

  private applyCrossfade(buffer: AudioBuffer, crossfade: any, position: number) {
    // Equal-power crossfade (20-30ms)
  }
}
```

### 2. Comp Review Component (`src/lib/components/comp/CompReview.svelte`)

Visual timeline showing which take was selected for each segment with score explanations.

## Git Branch
`comp-engine`

## Success Criteria
- ✅ Auto-comp selects best segments accurately
- ✅ Crossfades are smooth and inaudible
- ✅ Comp rendering <5s for 16-bar region
- ✅ Manual overrides apply correctly
- ✅ No audio artifacts (clicks, pops)

**Start with segment scoring, then crossfade algorithm, finally rendering.**
```

---

## 🎛️ Instance 7: Command Bus + DAW Actions

```markdown
# Claude Code Prompt: Command Bus & DAW Integration

## Mission
Create central command bus that translates AI commands into DAW actions.

## Context Files
1. `PHASE_3_FREESTYLE_FLOW_ARCHITECTURE.md` (section 6: Command Bus)

## Deliverables

### 1. Command Types (`packages/command-bus/src/types.ts`)

Use Zod for runtime validation:

```typescript
import { z } from 'zod';

export const CommandSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('beat.load'), styleTags: z.array(z.string()).optional() }),
  z.object({ type: z.literal('beat.generate'), style: z.string(), bpm: z.number() }),
  z.object({ type: z.literal('transport.record'), bars: z.number() }),
  z.object({ type: z.literal('comp.create'), method: z.enum(['auto', 'manual']) }),
  // ... all command types
]);

export type Command = z.infer<typeof CommandSchema>;
```

### 2. Command Bus (`packages/command-bus/src/CommandBus.ts`)

```typescript
class CommandBus {
  private handlers = new Map<string, CommandHandler<any>>();

  register<T extends Command>(type: T['type'], handler: CommandHandler<T>): void;
  async dispatch(cmd: Command): Promise<CommandResult>;
  async undo(): Promise<CommandResult>;
  async redo(): Promise<CommandResult>;
}
```

### 3. Command Handlers

Create handler for each command type that calls appropriate DAW APIs.

## Git Branch
`command-bus`

## Success Criteria
- ✅ All command types defined with Zod validation
- ✅ Handlers registered for all commands
- ✅ Commands execute correctly
- ✅ Undo/redo works for reversible commands
- ✅ 100% test coverage for validation

**Start with type definitions and validation, then implement handlers.**
```

---

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

## 🎹 Instance 9: MIDI Editor + Piano Roll

```markdown
# Claude Code Prompt: MIDI Editor & Piano Roll

## Mission
Build professional piano roll editor with quantization, velocity editing, and scale snapping.

## Context Files
1. Comprehensive spec: MIDI Sequencing section
2. FL Studio piano roll patterns (research)

## Deliverables

### 1. Piano Roll Core (`src/lib/midi/PianoRoll.ts`)

```typescript
interface MIDINote {
  id: string;
  time: number;        // In bars.beats
  pitch: number;       // MIDI note number (0-127)
  duration: number;    // In beats
  velocity: number;    // 0-127
}

class PianoRoll {
  private notes: MIDINote[] = [];
  private scale: string = 'chromatic';
  private snapToGrid: number = 0.25;  // 16th notes

  addNote(time: number, pitch: number, duration: number, velocity: number): void;
  removeNote(noteId: string): void;
  moveNote(noteId: string, deltaTime: number, deltaPitch: number): void;
  resizeNote(noteId: string, newDuration: number): void;

  quantize(grid: number): void;
  humanize(amount: number): void;
  snapToScale(scale: string): void;

  toJSON(): any;
  fromJSON(data: any): void;
}
```

### 2. Piano Roll UI (`src/lib/components/midi/PianoRoll.svelte`)

Canvas-based editor (performance):

```typescript
<script lang="ts">
  let canvas: HTMLCanvasElement;
  let notes: MIDINote[] = $state([]);

  // Drawing
  function drawPianoRoll(ctx: CanvasRenderingContext2D) {
    // Draw grid
    // Draw piano keys (left)
    // Draw notes (colored rectangles)
    // Draw velocity bars (bottom)
  }

  // Interaction
  function handleMouseDown(e: MouseEvent) {
    // Add note or start dragging
  }

  function handleMouseMove(e: MouseEvent) {
    // Resize or move note
  }

  function handleMouseUp(e: MouseEvent) {
    // Finish edit
  }
</script>

<canvas bind:this={canvas} onmousedown={handleMouseDown}></canvas>
```

### 3. Quantization Algorithm (`src/lib/midi/quantize.ts`)

```typescript
function quantize(notes: MIDINote[], grid: number, strength: number = 1.0): MIDINote[] {
  return notes.map(note => {
    const quantizedTime = Math.round(note.time / grid) * grid;
    const newTime = note.time + (quantizedTime - note.time) * strength;

    return { ...note, time: newTime };
  });
}

function humanize(notes: MIDINote[], amount: number): MIDINote[] {
  return notes.map(note => ({
    ...note,
    time: note.time + (Math.random() - 0.5) * amount * 0.1,
    velocity: Math.max(1, Math.min(127, note.velocity + (Math.random() - 0.5) * amount * 20))
  }));
}
```

### 4. Scale Snapping (`src/lib/midi/scales.ts`)

```typescript
const SCALES = {
  'major': [0, 2, 4, 5, 7, 9, 11],
  'minor': [0, 2, 3, 5, 7, 8, 10],
  'pentatonic-minor': [0, 3, 5, 7, 10],
  'blues': [0, 3, 5, 6, 7, 10]
};

function snapToScale(pitch: number, root: number, scale: string): number {
  const scaleNotes = SCALES[scale];
  const octave = Math.floor((pitch - root) / 12);
  const noteInOctave = (pitch - root) % 12;

  // Find closest scale degree
  const closest = scaleNotes.reduce((prev, curr) => {
    return Math.abs(curr - noteInOctave) < Math.abs(prev - noteInOctave) ? curr : prev;
  });

  return root + octave * 12 + closest;
}
```

### 5. MIDI Playback (`src/lib/midi/MIDIPlayer.ts`)

```typescript
class MIDIPlayer {
  private synth: Tone.PolySynth;
  private part: Tone.Part;

  async play(notes: MIDINote[], instrument: Tone.Instrument) {
    this.part = new Tone.Part((time, note) => {
      instrument.triggerAttackRelease(
        Tone.Frequency(note.pitch, 'midi').toNote(),
        note.duration + 's',
        time,
        note.velocity / 127
      );
    }, notes.map(n => ({
      time: n.time,
      pitch: n.pitch,
      duration: n.duration,
      velocity: n.velocity
    })));

    this.part.start(0);
    Tone.Transport.start();
  }
}
```

## Testing

### Unit Tests
- Note add/remove/move operations
- Quantization accuracy
- Scale snapping correctness
- MIDI file import/export

### Integration Tests
- Piano roll renders correctly
- Mouse interactions work
- Playback syncs with transport
- Velocity editing applies

### Manual Tests
```
[ ] Can draw notes with mouse
[ ] Notes snap to grid when enabled
[ ] Scale highlighting works
[ ] Velocity bars update on edit
[ ] Quantize maintains note relationships
[ ] Ghost notes from other tracks visible
[ ] Keyboard shortcuts work (Cmd+Z, Delete, etc.)
```

## Git Branch
`midi-editor`

## Success Criteria
- ✅ Smooth 60fps rendering with 1000+ notes
- ✅ Quantization working with adjustable strength
- ✅ Scale snapping with visual key highlights
- ✅ Velocity editing with visual feedback
- ✅ MIDI export/import (Standard MIDI File format)
- ✅ Ghost notes from other tracks
- ✅ Keyboard shortcuts for common actions
- ✅ User feedback: "This piano roll feels like FL Studio"

**Start with core data structures and rendering, then add interactions.**
```

---

## ☁️ Instance 10: Cloud Storage + Projects

```markdown
# Claude Code Prompt: Cloud Storage & Project Management

## Mission
Implement Supabase integration for project save/load, cloud storage, and collaboration foundation.

## Context Files
1. Comprehensive spec: Cloud Storage section
2. Architecture doc: Data Layer

## Deliverables

### 1. Supabase Schema (`supabase/migrations/001_init.sql`)

```sql
-- users (managed by Supabase Auth)

-- projects
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  bpm number default 120,
  key text default 'Cmaj',
  time_signature text default '4/4',
  data jsonb not null,  -- Full project state
  thumbnail_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_projects_user on projects(user_id);
create index idx_projects_updated on projects(updated_at desc);

-- audio_files
create table if not exists audio_files (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  file_name text not null,
  file_size bigint,
  storage_path text not null,
  waveform_data jsonb,  -- Pre-computed peaks
  duration_sec float,
  created_at timestamptz default now()
);

-- beats (from Instance 4)
-- takes (from Instance 5)
-- comps (from Instance 6)

-- collaboration (future)
create table if not exists project_shares (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  shared_with_user_id uuid references auth.users(id) on delete cascade,
  permission text check (permission in ('view', 'edit', 'admin')),
  created_at timestamptz default now()
);
```

### 2. Project Manager (`src/lib/cloud/ProjectManager.ts`)

```typescript
interface Project {
  id: string;
  userId: string;
  title: string;
  bpm: number;
  key: string;
  timeSignature: string;
  tracks: Track[];
  effects: Effect[];
  automation: AutomationLane[];
  createdAt: Date;
  updatedAt: Date;
}

class ProjectManager {
  async createProject(title: string): Promise<Project> {
    const project = {
      title,
      bpm: 120,
      key: 'Cmaj',
      timeSignature: '4/4',
      tracks: [],
      data: this.serializeDAWState()
    };

    const { data } = await supabase
      .from('projects')
      .insert(project)
      .select()
      .single();

    return data;
  }

  async saveProject(projectId: string): Promise<void> {
    const data = this.serializeDAWState();

    await supabase
      .from('projects')
      .update({ data, updated_at: new Date() })
      .eq('id', projectId);

    // Auto-save every 30s
    this.scheduleAutoSave();
  }

  async loadProject(projectId: string): Promise<Project> {
    const { data } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    // Deserialize and restore DAW state
    await this.deserializeDAWState(data.data);

    return data;
  }

  async listProjects(): Promise<Project[]> {
    const { data } = await supabase
      .from('projects')
      .select('*')
      .order('updated_at', { ascending: false });

    return data;
  }

  private serializeDAWState(): any {
    return {
      tracks: audioEngine.getAllTracks().map(t => t.toJSON()),
      tempo: Tone.Transport.bpm.value,
      timeSignature: Tone.Transport.timeSignature,
      // ... all DAW state
    };
  }

  private async deserializeDAWState(data: any): Promise<void> {
    // Clear current state
    audioEngine.reset();

    // Restore tracks
    for (const trackData of data.tracks) {
      const track = await audioEngine.addTrack(trackData);
      // Restore effects, clips, etc.
    }

    // Restore transport
    Tone.Transport.bpm.value = data.tempo;
    // ...
  }
}
```

### 3. Storage Manager (`src/lib/cloud/StorageManager.ts`)

```typescript
class StorageManager {
  async uploadAudioFile(
    projectId: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    const path = `${projectId}/${uuid()}_${file.name}`;

    const { data, error } = await supabase.storage
      .from('audio-files')
      .upload(path, file, {
        onUploadProgress: (progress) => {
          const percent = (progress.loaded / progress.total) * 100;
          onProgress?.(percent);
        }
      });

    if (error) throw error;

    // Store metadata
    await supabase.from('audio_files').insert({
      project_id: projectId,
      file_name: file.name,
      file_size: file.size,
      storage_path: path
    });

    return data.path;
  }

  async downloadAudioFile(path: string): Promise<Blob> {
    const { data, error } = await supabase.storage
      .from('audio-files')
      .download(path);

    if (error) throw error;
    return data;
  }

  async generateWaveform(audioBuffer: AudioBuffer): Promise<number[]> {
    // Generate peaks for visualization (1 peak per pixel)
    const peaks = [];
    const samplesPerPeak = Math.floor(audioBuffer.length / 1000);

    const channelData = audioBuffer.getChannelData(0);
    for (let i = 0; i < channelData.length; i += samplesPerPeak) {
      const chunk = channelData.slice(i, i + samplesPerPeak);
      const peak = Math.max(...Array.from(chunk).map(Math.abs));
      peaks.push(peak);
    }

    return peaks;
  }
}
```

### 4. Auto-Save System (`src/lib/cloud/AutoSave.ts`)

```typescript
class AutoSave {
  private saveInterval: number = 30000; // 30s
  private isDirty: boolean = false;
  private timer: NodeJS.Timeout;

  start(projectId: string) {
    this.timer = setInterval(async () => {
      if (this.isDirty) {
        await projectManager.saveProject(projectId);
        this.isDirty = false;

        emit('project:saved', { projectId, timestamp: new Date() });
      }
    }, this.saveInterval);
  }

  markDirty() {
    this.isDirty = true;
  }

  stop() {
    clearInterval(this.timer);
  }
}
```

### 5. Project Browser UI (`src/lib/components/cloud/ProjectBrowser.svelte`)

```typescript
<script lang="ts">
  let projects: Project[] = $state([]);

  async function loadProjects() {
    projects = await projectManager.listProjects();
  }

  onMount(loadProjects);
</script>

<div class="project-browser">
  <h2>Projects</h2>

  <button onclick={() => createNew()}>New Project</button>

  <div class="project-grid">
    {#each projects as project}
      <div class="project-card" onclick={() => load(project.id)}>
        <img src={project.thumbnail_url} alt={project.title} />
        <h3>{project.title}</h3>
        <p>{project.bpm} BPM • {project.key}</p>
        <time>{formatDate(project.updated_at)}</time>
      </div>
    {/each}
  </div>
</div>
```

## Testing

### Unit Tests
- Project serialization/deserialization
- File upload with progress
- Waveform generation accuracy

### Integration Tests
- Save → load → DAW state matches
- Auto-save triggers correctly
- File uploads complete
- Project list updates

## Git Branch
`cloud-storage`

## Success Criteria
- ✅ Projects save/load correctly
- ✅ Auto-save every 30s when dirty
- ✅ Audio files upload with progress
- ✅ Waveforms pre-computed on upload
- ✅ Project browser shows all projects
- ✅ No data loss on save/load cycle

**Start with Supabase schema and authentication, then implement save/load.**
```

---

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

## 💾 Instance 12: Export + Bounce System

```markdown
# Claude Code Prompt: Export & Bounce System

## Mission
Implement professional audio export with format options, stem export, and mastering integration.

## Context Files
1. Comprehensive spec: Export section
2. `TESTING_FINAL_STATUS.md` for offline rendering patterns

## Deliverables

### 1. Export Manager (`src/lib/audio/export/ExportManager.ts`)

```typescript
interface ExportOptions {
  format: 'wav' | 'mp3' | 'flac';
  sampleRate: 44100 | 48000 | 96000;
  bitDepth: 16 | 24 | 32;
  channels: 'stereo' | 'mono';
  normalize: boolean;
  applyMastering: boolean;
  includeStems: boolean;
  startBar?: number;
  endBar?: number;
}

class ExportManager {
  async exportMix(opts: ExportOptions): Promise<Blob> {
    // 1. Render offline
    const buffer = await this.renderMix(opts);

    // 2. Apply mastering if requested
    const masteredBuffer = opts.applyMastering
      ? await this.applyMastering(buffer)
      : buffer;

    // 3. Normalize if requested
    const finalBuffer = opts.normalize
      ? this.normalize(masteredBuffer, -0.1)  // -0.1dB headroom
      : masteredBuffer;

    // 4. Convert to format
    const blob = await this.convertToFormat(finalBuffer, opts.format);

    return blob;
  }

  async exportStems(opts: ExportOptions): Promise<Map<string, Blob>> {
    const stems = new Map<string, Blob>();

    for (const track of audioEngine.getAllTracks()) {
      // Render each track solo
      const buffer = await this.renderTrack(track, opts);
      const blob = await this.convertToFormat(buffer, opts.format);

      stems.set(track.name, blob);
    }

    return stems;
  }

  private async renderMix(opts: ExportOptions): Promise<AudioBuffer> {
    const duration = this.calculateDuration(opts);
    const tailSec = 2; // 2s tail for reverb

    // Use AudioEngine's offline rendering (already tested)
    return audioEngine.renderOffline(duration, tailSec);
  }

  private normalize(buffer: AudioBuffer, targetDb: number): AudioBuffer {
    // Find peak
    let peak = 0;
    for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
      const data = buffer.getChannelData(ch);
      peak = Math.max(peak, Math.max(...Array.from(data).map(Math.abs)));
    }

    // Calculate gain
    const targetLinear = Math.pow(10, targetDb / 20);
    const gain = targetLinear / peak;

    // Apply gain
    const ctx = new OfflineAudioContext(
      buffer.numberOfChannels,
      buffer.length,
      buffer.sampleRate
    );

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const gainNode = ctx.createGain();
    gainNode.gain.value = gain;

    source.connect(gainNode);
    gainNode.connect(ctx.destination);
    source.start(0);

    return ctx.startRendering();
  }

  private async applyMastering(buffer: AudioBuffer): Promise<AudioBuffer> {
    // Option 1: Local mastering chain
    const ctx = new OfflineAudioContext(
      buffer.numberOfChannels,
      buffer.length,
      buffer.sampleRate
    );

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    // Simple mastering chain
    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.value = -20;
    compressor.ratio.value = 4;
    compressor.attack.value = 0.003;
    compressor.release.value = 0.25;

    const limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = -0.5;
    limiter.ratio.value = 20;
    limiter.attack.value = 0.001;
    limiter.release.value = 0.01;

    source.connect(compressor);
    compressor.connect(limiter);
    limiter.connect(ctx.destination);

    source.start(0);
    return ctx.startRendering();

    // Option 2: LANDR API (future)
    // return this.masterWithLANDR(buffer);
  }

  private async convertToFormat(buffer: AudioBuffer, format: string): Promise<Blob> {
    if (format === 'wav') {
      return this.audioBufferToWav(buffer);
    } else if (format === 'mp3') {
      return this.audioBufferToMp3(buffer);
    } else if (format === 'flac') {
      return this.audioBufferToFlac(buffer);
    }
  }

  private audioBufferToWav(buffer: AudioBuffer): Blob {
    // PCM WAV encoding (same as test runner)
    const length = buffer.length * buffer.numberOfChannels * 2;
    const wav = new ArrayBuffer(44 + length);
    const view = new DataView(wav);

    // Write WAV header
    this.writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + length, true);
    this.writeString(view, 8, 'WAVE');
    this.writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);  // PCM
    view.setUint16(22, buffer.numberOfChannels, true);
    view.setUint32(24, buffer.sampleRate, true);
    view.setUint32(28, buffer.sampleRate * buffer.numberOfChannels * 2, true);
    view.setUint16(32, buffer.numberOfChannels * 2, true);
    view.setUint16(34, 16, true);  // 16-bit
    this.writeString(view, 36, 'data');
    view.setUint32(40, length, true);

    // Write audio data
    let offset = 44;
    for (let i = 0; i < buffer.length; i++) {
      for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
        const sample = buffer.getChannelData(ch)[i];
        view.setInt16(offset, sample * 0x7FFF, true);
        offset += 2;
      }
    }

    return new Blob([wav], { type: 'audio/wav' });
  }
}
```

### 2. Export UI (`src/lib/components/export/ExportDialog.svelte`)

```typescript
<script lang="ts">
  let format = $state('wav');
  let sampleRate = $state(48000);
  let normalize = $state(true);
  let applyMastering = $state(false);
  let includeStems = $state(false);
  let isExporting = $state(false);
  let progress = $state(0);

  async function startExport() {
    isExporting = true;

    const blob = await exportManager.exportMix({
      format,
      sampleRate,
      bitDepth: 24,
      channels: 'stereo',
      normalize,
      applyMastering,
      includeStems
    });

    // Download
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectTitle}.${format}`;
    a.click();

    isExporting = false;
  }
</script>

<dialog>
  <h2>Export Mix</h2>

  <div class="options">
    <label>
      Format
      <select bind:value={format}>
        <option value="wav">WAV (Lossless)</option>
        <option value="mp3">MP3 (320kbps)</option>
        <option value="flac">FLAC (Lossless, smaller)</option>
      </select>
    </label>

    <label>
      Sample Rate
      <select bind:value={sampleRate}>
        <option value={44100}>44.1 kHz (CD quality)</option>
        <option value={48000}>48 kHz (Standard)</option>
        <option value={96000}>96 kHz (Hi-Res)</option>
      </select>
    </label>

    <label>
      <input type="checkbox" bind:checked={normalize} />
      Normalize to -0.1 dB
    </label>

    <label>
      <input type="checkbox" bind:checked={applyMastering} />
      Apply mastering (compression + limiter)
    </label>

    <label>
      <input type="checkbox" bind:checked={includeStems} />
      Export stems (individual tracks)
    </label>
  </div>

  <button onclick={startExport} disabled={isExporting}>
    {isExporting ? 'Exporting...' : 'Export'}
  </button>

  {#if isExporting}
    <progress value={progress} max={100}></progress>
  {/if}
</dialog>
```

## Testing

### Unit Tests
- WAV encoding correctness
- Normalization gain calculation
- Stem export includes all tracks

### Integration Tests
- Export → import → audio matches
- Mastering chain applies
- Format conversion works

### Quality Tests
```
[ ] Exported WAV plays in DAW (Logic, Ableton)
[ ] MP3 sounds identical (ABX test)
[ ] Stems sum to mix (null test)
[ ] Normalization doesn't clip
[ ] Mastering improves loudness
```

## Git Branch
`export-bounce`

## Success Criteria
- ✅ WAV export working (all sample rates)
- ✅ MP3 export functional
- ✅ Normalization accurate
- ✅ Stem export creates individual files
- ✅ Mastering chain improves loudness
- ✅ Export <30s for 5min track
- ✅ No audio artifacts in export

**Use existing offline rendering from AudioEngine.ts as foundation.**
```

---

## 🧪 Instance 13: Integration + E2E Tests

```markdown
# Claude Code Prompt: Integration Testing & Quality Assurance

## Mission
Create comprehensive E2E test suite validating entire freestyle flow and all module integrations.

## Context Files
1. `PHASE_3_FREESTYLE_FLOW_ARCHITECTURE.md` (all sections)
2. `TESTING_FINAL_STATUS.md` (existing test patterns)
3. All instance implementations

## Deliverables

### 1. E2E Test Suite (`tests/e2e/`)

**Freestyle Flow Test** (`tests/e2e/freestyle-flow.spec.ts`):

```typescript
import { test, expect } from '@playwright/test';

test('complete freestyle flow: drake vibe → record → comp', async ({ page }) => {
  // 1. Navigate to app
  await page.goto('http://localhost:5174');
  await page.waitForSelector('[data-testid="chat-panel"]');

  // 2. Click mic button
  await page.click('[data-testid="mic-button"]');
  await page.waitForSelector('[data-testid="listening-indicator"]');

  // 3. Simulate voice command (mock STT)
  await page.evaluate(() => {
    window.__DAWG_TEST_API.simulateVoiceCommand('load up a drake vibe at 140');
  });

  // 4. Wait for beat candidates
  await page.waitForSelector('[data-testid="beat-candidate"]', { timeout: 5000 });

  const candidates = await page.$$('[data-testid="beat-candidate"]');
  expect(candidates).toHaveLength(3);

  // 5. Select first beat
  await candidates[0].click();
  await page.waitForSelector('[data-testid="beat-playing"]');

  // 6. Accept beat
  await page.click('[data-testid="beat-accept"]');
  await page.waitForSelector('[data-testid="track-1"]');

  // 7. Record 16 bars
  await page.evaluate(() => {
    window.__DAWG_TEST_API.simulateVoiceCommand('record 16 bars');
  });

  // Wait for count-in
  await page.waitForSelector('[data-testid="count-in"]');
  await page.waitForSelector('[data-testid="recording-hud"]');

  // Wait for recording to complete (16 bars @ 140 BPM ≈ 27s × 4 takes)
  await page.waitForSelector('[data-testid="take-1"]', { timeout: 120000 });

  // 8. Stop recording
  await page.evaluate(() => {
    window.__DAWG_TEST_API.simulateVoiceCommand('stop');
  });

  // 9. Create comp
  await page.evaluate(() => {
    window.__DAWG_TEST_API.simulateVoiceCommand('comp the best takes');
  });

  await page.waitForSelector('[data-testid="comp-created"]', { timeout: 10000 });

  // 10. Verify final state
  const tracks = await page.$$('[data-testid^="track-"]');
  expect(tracks.length).toBeGreaterThanOrEqual(2); // Beat + Comp

  // 11. Export
  await page.click('[data-testid="export-button"]');
  await page.waitForSelector('[data-testid="export-dialog"]');

  const downloadPromise = page.waitForEvent('download');
  await page.click('[data-testid="export-start"]');
  const download = await downloadPromise;

  expect(download.suggestedFilename()).toContain('.wav');
});
```

**Beat Generation Test**:

```typescript
test('AI beat generation produces playable patterns', async ({ page }) => {
  await page.goto('http://localhost:5174');

  // Generate trap beat
  await page.evaluate(() => {
    window.__DAWG_TEST_API.simulateVoiceCommand('make a trap beat at 140');
  });

  await page.waitForSelector('[data-testid="beat-candidate"]', { timeout: 5000 });

  // Verify 3 variations
  const candidates = await page.$$('[data-testid="beat-candidate"]');
  expect(candidates).toHaveLength(3);

  // Check each has audio
  for (const candidate of candidates) {
    const hasAudio = await candidate.evaluate(el => {
      return el.querySelector('audio') !== null;
    });
    expect(hasAudio).toBe(true);
  }

  // Play first candidate
  await candidates[0].click();
  await page.waitForTimeout(2000); // Listen for 2s

  // Verify audio is playing
  const isPlaying = await page.evaluate(() => {
    return !Tone.Transport.state === 'started';
  });
  expect(isPlaying).toBe(true);
});
```

**Voice Command Test**:

```typescript
test('voice commands execute correctly', async ({ page }) => {
  await page.goto('http://localhost:5174');

  const commands = [
    { input: 'load a beat', expectation: '[data-testid="beat-candidate"]' },
    { input: 'set tempo to 120', expectation: '[data-testid="bpm-120"]' },
    { input: 'add reverb to track 1', expectation: '[data-testid="effect-reverb"]' },
    { input: 'mute track 2', expectation: '[data-testid="track-2-muted"]' }
  ];

  for (const cmd of commands) {
    await page.evaluate((text) => {
      window.__DAWG_TEST_API.simulateVoiceCommand(text);
    }, cmd.input);

    await page.waitForSelector(cmd.expectation, { timeout: 3000 });
  }
});
```

### 2. Performance Tests (`tests/performance/`)

**Latency Benchmark**:

```typescript
test('voice loop latency <2s', async ({ page }) => {
  await page.goto('http://localhost:5174');

  const measurements = [];

  for (let i = 0; i < 10; i++) {
    const start = Date.now();

    await page.evaluate(() => {
      window.__DAWG_TEST_API.simulateVoiceCommand('play');
    });

    await page.waitForSelector('[data-testid="playing"]');

    const latency = Date.now() - start;
    measurements.push(latency);
  }

  const p95 = percentile(measurements, 95);
  expect(p95).toBeLessThan(2000); // <2s p95
});
```

**Audio Rendering Performance**:

```typescript
test('export renders faster than realtime', async ({ page }) => {
  await page.goto('http://localhost:5174');

  // Load project with 5 tracks × 5 minutes
  await page.evaluate(() => {
    window.__DAWG_TEST_API.loadTestProject('large-project');
  });

  const start = Date.now();

  await page.evaluate(() => {
    return window.__DAWG_TEST_API.exportMix({ format: 'wav' });
  });

  const renderTime = Date.now() - start;
  const trackDuration = 5 * 60 * 1000; // 5 minutes

  expect(renderTime).toBeLessThan(trackDuration * 0.5); // 2x realtime minimum
});
```

### 3. Integration Tests (`tests/integration/`)

Test all module interactions:

```typescript
test('command bus → beat engine → timeline', async () => {
  // Dispatch command
  const result = await commandBus.dispatch({
    type: 'beat.generate',
    style: 'toronto-ambient-trap',
    bpm: 140,
    bars: 4
  });

  expect(result.success).toBe(true);
  expect(result.data.beats).toHaveLength(3);

  // Accept beat
  await commandBus.dispatch({
    type: 'beat.accept',
    candidateId: result.data.beats[0].id
  });

  // Verify track created
  const tracks = audioEngine.getAllTracks();
  expect(tracks.length).toBe(1);
  expect(tracks[0].name).toBe('Beat');
});

test('recording → takes → comp', async () => {
  // Start recording
  const { trackId } = await recordingManager.startLoopRecording({
    bars: 8,
    countInBars: 1
  });

  // Simulate 3 loop passes
  for (let i = 0; i < 3; i++) {
    await waitForLoopEnd();
  }

  // Stop
  const takes = await recordingManager.stopRecording();
  expect(takes).toHaveLength(3);

  // Create comp
  const comp = await compEngine.createAutoComp({
    region: { startBar: 0, endBar: 8 },
    trackId,
    method: 'auto'
  });

  expect(comp.segments.length).toBeGreaterThan(0);
  expect(comp.crossfades.length).toBeGreaterThan(0);
});
```

### 4. Test Utilities (`tests/utils/`)

**Mock STT** (`tests/utils/mockSTT.ts`):

```typescript
export function mockSTT(page: Page) {
  return page.evaluate(() => {
    window.__DAWG_TEST_API = {
      ...window.__DAWG_TEST_API,
      simulateVoiceCommand: (text: string) => {
        // Trigger same flow as real STT
        const event = new CustomEvent('stt:final', { detail: { text } });
        window.dispatchEvent(event);
      }
    };
  });
}
```

**Test Audio Generator** (`tests/utils/audioGenerator.ts`):

```typescript
export function generateTestAudio(durationSec: number, frequency: number): AudioBuffer {
  const sampleRate = 48000;
  const length = durationSec * sampleRate;
  const buffer = new AudioContext().createBuffer(2, length, sampleRate);

  for (let ch = 0; ch < 2; ch++) {
    const data = buffer.getChannelData(ch);
    for (let i = 0; i < length; i++) {
      data[i] = Math.sin(2 * Math.PI * frequency * i / sampleRate) * 0.5;
    }
  }

  return buffer;
}
```

### 5. CI/CD Pipeline (`.github/workflows/test.yml`)

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: npm run test:e2e
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
          DEEPGRAM_API_KEY: ${{ secrets.DEEPGRAM_API_KEY }}

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

## Testing Checklist

### Functional Tests
```
[ ] Voice commands parse correctly (20 test utterances)
[ ] Beat generation produces 3 variations
[ ] Beat preview plays instantly (<100ms)
[ ] Recording captures audio
[ ] Loop recording creates multiple takes
[ ] Auto-comp selects best segments
[ ] Crossfades are smooth
[ ] Export produces valid WAV
[ ] Project save/load preserves state
[ ] Undo/redo works
```

### Performance Tests
```
[ ] Voice loop <2s (p95)
[ ] Beat generation <5s
[ ] Export faster than realtime
[ ] No memory leaks (10min session)
[ ] CPU <50% during playback
[ ] Smooth UI (60fps) with 20+ tracks
```

### Integration Tests
```
[ ] All modules communicate via command bus
[ ] Events propagate correctly
[ ] State synchronizes across components
[ ] No race conditions in async operations
```

### Quality Tests
```
[ ] Audio exports sound professional
[ ] No artifacts (clicks, pops, aliasing)
[ ] Jarvis responses feel natural
[ ] UI is intuitive (user testing)
```

## Git Branch
`integration-tests`

## Success Criteria
- ✅ 90%+ E2E test pass rate
- ✅ All performance benchmarks met
- ✅ Zero critical bugs in freestyle flow
- ✅ Comprehensive test coverage (>80%)
- ✅ CI/CD pipeline running automatically
- ✅ User acceptance testing positive

**Start with freestyle flow E2E test as it validates the entire system.**
```

---

## 📦 Final Deliverables Summary

### Documentation
- [ ] `PHASE_3_COMPLETE.md` (final status report)
- [ ] `API_REFERENCE.md` (all public APIs documented)
- [ ] `USER_GUIDE.md` (how to use freestyle flow)
- [ ] `ARCHITECTURE_FINAL.md` (as-built architecture)

### Codebase
- [ ] All 13 modules implemented and tested
- [ ] E2E test suite passing
- [ ] Performance benchmarks met
- [ ] Code reviewed and documented

### Demo
- [ ] Screen recording of freestyle flow (3-5 min)
- [ ] Sample projects showcasing features
- [ ] User testimonials (if available)

---

## 🚀 Launch Checklist

### Pre-Launch (Week 4)
- [ ] Security audit (SQL injection, XSS, etc.)
- [ ] Load testing (100+ concurrent users)
- [ ] Browser compatibility (Chrome, Firefox, Safari, Edge)
- [ ] Mobile responsiveness check
- [ ] Analytics integration (PostHog/Mixpanel)
- [ ] Error monitoring (Sentry)
- [ ] Backup strategy (Supabase backups)

### Launch Day
- [ ] Deploy to production (Vercel)
- [ ] Monitor error rates
- [ ] Watch performance metrics
- [ ] Respond to user feedback

### Post-Launch (Week 5-6)
- [ ] Gather user feedback
- [ ] Fix critical bugs
- [ ] Iterate on AI personality
- [ ] Optimize performance bottlenecks
- [ ] Plan Phase 4 features

---

**Created**: October 15, 2025
**Status**: Ready for parallel development
**Timeline**: 3-4 weeks to MVP
**Team Size**: 13 Claude Code instances

**Let's build the future of music production! 🎵🚀**
