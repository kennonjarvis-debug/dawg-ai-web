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

