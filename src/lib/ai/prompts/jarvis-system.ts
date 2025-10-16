/**
 * Jarvis System Prompt - AI Personality for AIDawg
 * Instance 2: Jarvis AI Brain + NLU
 */

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
  "commands": [{"type": "beat.load", "styleTags": ["toronto-ambient-trap"]}],
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

/**
 * Artist to Style Mapping
 * Maps artist names to descriptive style tags (no copyrighted content)
 */
export const ARTIST_STYLE_MAP: Record<string, string> = {
  // Toronto/OVO Sound
  'drake': 'toronto-ambient-trap',
  'partynextdoor': 'toronto-ambient-trap',
  'the weeknd': 'dark-atmospheric-rnb',

  // Trap/Hip-Hop
  'travis scott': 'psychedelic-trap',
  'metro boomin': 'dark-cinematic-trap',
  'future': 'atlanta-trap',
  'playboi carti': 'rage-trap',
  'pierre bourne': 'spacey-trap',
  'lil uzi vert': 'melodic-trap',

  // Drill
  'pop smoke': 'brooklyn-drill',
  'fivio foreign': 'brooklyn-drill',
  'chief keef': 'chicago-drill',

  // Experimental/Alternative
  'kanye': 'experimental-hiphop',
  'tyler the creator': 'neo-soul-hiphop',
  'frank ocean': 'atmospheric-rnb',

  // Lo-fi/Chill
  'lofi girl': 'lofi-beats',
  'nujabes': 'jazzhop',

  // House/Electronic
  'kaytranada': 'funky-house',
  'flume': 'future-bass',
  'skrillex': 'dubstep',
};

/**
 * Style Taxonomy
 * Descriptive tags for beat styles (no artist names)
 */
export const BEAT_STYLES: Record<string, {
  name: string;
  tags: {
    mood: string[];
    tempo: [number, number];
    drums: string;
    melody: string;
    texture: string;
  };
}> = {
  'toronto-ambient-trap': {
    name: 'Toronto Ambient Trap',
    tags: {
      mood: ['moody', 'dark', 'atmospheric', 'introspective'],
      tempo: [135, 145],
      drums: 'sparse-808-crisp-clap',
      melody: 'pad-minor-ambient',
      texture: 'reverb-heavy-spacious'
    }
  },
  'psychedelic-trap': {
    name: 'Psychedelic Trap',
    tags: {
      mood: ['trippy', 'energetic', 'dark', 'hypnotic'],
      tempo: [140, 150],
      drums: 'rolling-hats-punchy-808',
      melody: 'synth-arp-distorted',
      texture: 'layered-effects-heavy'
    }
  },
  'dark-cinematic-trap': {
    name: 'Dark Cinematic Trap',
    tags: {
      mood: ['dark', 'epic', 'dramatic', 'aggressive'],
      tempo: [130, 140],
      drums: 'hard-808-booming-kick',
      melody: 'orchestral-strings-brass',
      texture: 'wide-cinematic'
    }
  },
  'atlanta-trap': {
    name: 'Atlanta Trap',
    tags: {
      mood: ['hype', 'energetic', 'bouncy'],
      tempo: [135, 145],
      drums: 'rapid-hats-heavy-808',
      melody: 'simple-keys-minimal',
      texture: 'clean-punchy'
    }
  },
  'rage-trap': {
    name: 'Rage Trap',
    tags: {
      mood: ['aggressive', 'punk', 'rebellious', 'energetic'],
      tempo: [145, 165],
      drums: 'distorted-808-chaotic-hats',
      melody: 'dissonant-synth',
      texture: 'lo-fi-gritty'
    }
  },
  'spacey-trap': {
    name: 'Spacey Trap',
    tags: {
      mood: ['dreamy', 'floaty', 'uplifting'],
      tempo: [130, 145],
      drums: 'bouncy-808-light-hats',
      melody: 'airy-synth-pluck',
      texture: 'ethereal-clean'
    }
  },
  'melodic-trap': {
    name: 'Melodic Trap',
    tags: {
      mood: ['emotional', 'melodic', 'energetic'],
      tempo: [140, 155],
      drums: 'punchy-808-crisp-snare',
      melody: 'synth-lead-catchy',
      texture: 'polished-layered'
    }
  },
  'brooklyn-drill': {
    name: 'Brooklyn Drill',
    tags: {
      mood: ['aggressive', 'dark', 'hard'],
      tempo: [140, 150],
      drums: 'sliding-808-hard-snare',
      melody: 'dark-piano-minor',
      texture: 'raw-gritty'
    }
  },
  'chicago-drill': {
    name: 'Chicago Drill',
    tags: {
      mood: ['aggressive', 'menacing', 'dark'],
      tempo: [135, 145],
      drums: 'hard-snare-heavy-808',
      melody: 'minimal-dark',
      texture: 'raw-street'
    }
  },
  'experimental-hiphop': {
    name: 'Experimental Hip-Hop',
    tags: {
      mood: ['artistic', 'unconventional', 'bold'],
      tempo: [85, 140],
      drums: 'unique-percussion-varied',
      melody: 'eclectic-unpredictable',
      texture: 'innovative-layered'
    }
  },
  'neo-soul-hiphop': {
    name: 'Neo-Soul Hip-Hop',
    tags: {
      mood: ['smooth', 'jazzy', 'laid-back', 'groovy'],
      tempo: [85, 100],
      drums: 'swing-groove-live-feel',
      melody: 'jazz-chords-warm-keys',
      texture: 'organic-vintage'
    }
  },
  'atmospheric-rnb': {
    name: 'Atmospheric R&B',
    tags: {
      mood: ['dreamy', 'emotional', 'intimate'],
      tempo: [70, 90],
      drums: 'subtle-kicks-snappy-snare',
      melody: 'ambient-pads-vocal-layers',
      texture: 'spacious-reverb-heavy'
    }
  },
  'dark-atmospheric-rnb': {
    name: 'Dark Atmospheric R&B',
    tags: {
      mood: ['dark', 'moody', 'sensual', 'brooding'],
      tempo: [75, 95],
      drums: 'deep-kicks-crisp-hats',
      melody: 'dark-synth-vocal-chops',
      texture: 'dense-atmospheric'
    }
  },
  'lofi-beats': {
    name: 'Lo-Fi Beats',
    tags: {
      mood: ['chill', 'relaxing', 'nostalgic'],
      tempo: [70, 90],
      drums: 'dusty-kicks-vinyl-crackle',
      melody: 'jazz-samples-warm-keys',
      texture: 'lo-fi-vintage-warm'
    }
  },
  'jazzhop': {
    name: 'Jazz Hop',
    tags: {
      mood: ['smooth', 'laid-back', 'jazzy', 'chill'],
      tempo: [80, 95],
      drums: 'boom-bap-swing',
      melody: 'jazz-piano-samples',
      texture: 'warm-organic'
    }
  },
  'funky-house': {
    name: 'Funky House',
    tags: {
      mood: ['groovy', 'uplifting', 'fun', 'dancey'],
      tempo: [120, 128],
      drums: 'four-on-floor-funky-percussion',
      melody: 'funky-bass-disco-chords',
      texture: 'punchy-clean'
    }
  },
  'future-bass': {
    name: 'Future Bass',
    tags: {
      mood: ['uplifting', 'emotional', 'energetic'],
      tempo: [140, 170],
      drums: 'half-time-snare-punchy-kick',
      melody: 'lush-synth-chords-vocal-chops',
      texture: 'wide-layered-bright'
    }
  },
  'dubstep': {
    name: 'Dubstep',
    tags: {
      mood: ['aggressive', 'dark', 'heavy', 'intense'],
      tempo: [140, 150],
      drums: 'half-time-snare-sub-bass',
      melody: 'wobble-bass-distorted-synth',
      texture: 'heavy-dense'
    }
  },
};

/**
 * Mood-based voice settings for personality adaptation
 */
export const MOOD_CHARACTERISTICS = {
  supportive: {
    tone: 'encouraging, warm, helpful',
    examples: [
      "That's a solid direction—let's build on it",
      "I'm here to help—what do you need?",
      "You're on the right track, keep going"
    ]
  },
  excited: {
    tone: 'energetic, enthusiastic, hyped',
    examples: [
      "YO THAT WAS FIRE!",
      "Let's GO! This is gonna be crazy",
      "I'm feeling this energy—let's keep it rolling"
    ]
  },
  challenging: {
    tone: 'provocative, bold, pushes boundaries',
    examples: [
      "You can do better than that—try again",
      "What if we flip this completely?",
      "That's safe. Let's get weird with it"
    ]
  },
  chill: {
    tone: 'relaxed, laid-back, calm',
    examples: [
      "Nice and easy—take your time",
      "This vibe is smooth, I'm into it",
      "Let's keep it chill and see where it goes"
    ]
  }
};
