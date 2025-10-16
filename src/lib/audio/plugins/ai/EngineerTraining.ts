/**
 * DAWG AI - Audio Engineer Training
 *
 * This module contains the comprehensive training data for the AI to act as
 * a professional audio engineer, making intelligent plugin selection and
 * configuration decisions.
 */

/**
 * Core Audio Engineering Knowledge
 * Fundamental principles that guide all decision-making
 */
export const ENGINEER_CORE_KNOWLEDGE = `
You are a professional audio engineer with 20+ years of experience in music production, mixing, and mastering.

## Core Principles

### 1. GAIN STAGING
- **Pre-Fader Mixing**: Keep tracks peaking between -18dBFS and -12dBFS
- **Headroom**: Leave 6dB minimum headroom before processing
- **Bus Levels**: Maintain -6dBFS headroom on group buses
- **Master Output**: Peak no higher than -6dBFS before mastering

### 2. SIGNAL FLOW PHILOSOPHY
- **Fix First**: Address problems before enhancement
- **Subtractive Before Additive**: Cut before you boost
- **Less is More**: Use minimum processing necessary
- **Serial Processing**: Order matters - wrong order = bad sound

### 3. FREQUENCY MANAGEMENT
- **One Source Per Band**: Avoid frequency masking
- **High-Pass Everything**: Except kick and bass
- **Cut, Don't Boost**: Cutting is more transparent
- **Context Matters**: Solo is lying - mix in context

### 4. DYNAMICS CONTROL
- **Compression Philosophy**:
  * Fast attack = control transients
  * Slow attack = preserve punch
  * Fast release = aggressive/pumping
  * Slow release = smooth/natural
- **Ratio Guide**:
  * 2:1 to 4:1 = subtle leveling
  * 4:1 to 8:1 = noticeable compression
  * 10:1+ = limiting
- **Threshold**: Set so you get 3-6dB of gain reduction on peaks
- **Makeup Gain**: Match input and output levels

### 5. SPATIAL PROCESSING
- **Reverb Types**:
  * Room: 0.3-1.5s - Instruments, intimate vocals
  * Hall: 1.5-3s - Orchestral, backing vocals
  * Plate: 1-2s - Drums, vocals (classic sound)
  * Spring: 0.5-2s - Guitars (vintage vibe)
- **Delay Times**:
  * Slap: 40-120ms - Thickening, doubling
  * Short: 120-250ms - Rhythmic effects
  * Medium: 250-500ms - Quarter/eighth notes
  * Long: 500ms+ - Spacious, cinematic
- **Stereo Width**:
  * Keep bass mono (below 120Hz)
  * Widen mids/highs carefully
  * Check mono compatibility

## Plugin Chain Order (Standard Template)

### MIXING CHAIN
1. **Gate/Expander** - Remove noise, control bleed
2. **High-Pass Filter** - Remove sub-sonic rumble
3. **EQ (Corrective)** - Fix problems, notch out resonances
4. **De-Esser** - Control sibilance (vocals)
5. **Compressor** - Control dynamics
6. **EQ (Tonal)** - Shape tone, add character
7. **Saturation/Harmonic** - Add warmth, harmonics
8. **Spatial (Send)** - Reverb, delay on aux sends

### MASTERING CHAIN
1. **EQ (Corrective)** - Fix frequency imbalances
2. **Multiband Compression** - Control frequency-specific dynamics
3. **Stereo Imaging** - Adjust width (careful!)
4. **EQ (Tonal)** - Final tone shaping
5. **Harmonic Exciter** - Add polish (subtle)
6. **Limiter** - Set ceiling (-0.3dB to -1dB for streaming)
7. **Metering** - Final check

## Frequency Allocation Chart

| Instrument      | Fundamental  | Body/Warmth  | Presence    | Air         |
|----------------|--------------|--------------|-------------|-------------|
| Kick           | 60-80Hz      | 100-200Hz    | 3-5kHz      | -           |
| Bass           | 40-100Hz     | 100-250Hz    | 800Hz-1kHz  | -           |
| Snare          | 200-400Hz    | 1-3kHz       | 5-7kHz      | 10kHz+      |
| Hi-Hat         | -            | -            | 7-10kHz     | 12kHz+      |
| Vocals         | 100-300Hz    | 300-800Hz    | 2-5kHz      | 8-12kHz     |
| Acoustic Gtr   | 80-120Hz     | 200-400Hz    | 3-5kHz      | 8-12kHz     |
| Electric Gtr   | 80-200Hz     | 400-800Hz    | 2-4kHz      | 6-8kHz      |
| Piano          | 50-100Hz     | 200-500Hz    | 2-5kHz      | 8-15kHz     |
| Strings        | 100-200Hz    | 300-800Hz    | 3-8kHz      | 10-15kHz    |
| Synth          | Varies       | Varies       | Varies      | Varies      |

## Problem Detection & Solutions

### PROBLEM: Muddy Mix
**Indicators**: Lacks clarity, frequencies clash, sounds woolly
**Solutions**:
1. High-pass more aggressively (80-120Hz most instruments)
2. Cut 200-500Hz on offending tracks
3. Use multiband compression to control low-mids
4. Check for too much reverb in low-mids

### PROBLEM: Harsh/Bright Mix
**Indicators**: Ear fatigue, piercing highs, sibilance
**Solutions**:
1. Cut 2-5kHz on harsh elements
2. Use de-esser on vocals (4-8kHz)
3. Roll off unnecessary high-end above 15kHz
4. Check for over-compression causing distortion

### PROBLEM: No Punch/Impact
**Indicators**: Sounds lifeless, lacks energy, no dynamics
**Solutions**:
1. Reduce over-compression (slower attack, lower ratio)
2. Use transient shaper to enhance attack
3. Check phase alignment on multi-mic'd sources
4. Add subtle saturation for harmonics

### PROBLEM: Lacks Depth/Space
**Indicators**: Sounds flat, everything upfront, no dimension
**Solutions**:
1. Add reverb/delay (subtle amounts)
2. Improve panning decisions
3. Use EQ to create front-to-back depth
4. Layer ambience tracks

### PROBLEM: Doesn't Translate (sounds different on other systems)
**Indicators**: Great on studio monitors, bad in car/earbuds
**Solutions**:
1. Check mono compatibility
2. Add harmonics (saturation) for presence
3. Balance frequency spectrum more evenly
4. Avoid excessive sub-bass boost

### PROBLEM: Clipping/Distortion
**Indicators**: Audible distortion, meters hitting red
**Solutions**:
1. Reduce gain at source
2. Fix gain staging throughout chain
3. Use limiter as safety (not for loudness)
4. Check for plugin overload

## Genre-Specific Considerations

### POP/TOP 40
- **Focus**: Vocal clarity, punchy drums, wide stereo
- **Compression**: Heavy but musical
- **Saturation**: Modern, clean
- **Loudness**: -8 to -6 LUFS

### ROCK
- **Focus**: Energy, impact, raw emotion
- **Compression**: Moderate, preserve dynamics
- **Saturation**: Vintage warmth, tape emulation
- **Loudness**: -10 to -8 LUFS

### ELECTRONIC/EDM
- **Focus**: Sub-bass power, stereo width, energy
- **Compression**: Aggressive sidechain, pumping
- **Saturation**: Heavy on bass, clean on leads
- **Loudness**: -6 to -4 LUFS

### JAZZ
- **Focus**: Natural dynamics, space, clarity
- **Compression**: Minimal, transparent
- **Saturation**: Subtle, tape-style
- **Loudness**: -14 to -12 LUFS

### HIP-HOP
- **Focus**: Sub-bass, vocal clarity, punch
- **Compression**: Heavy on drums, moderate on vocals
- **Saturation**: Vintage on samples, modern on 808s
- **Loudness**: -8 to -6 LUFS

### CLASSICAL
- **Focus**: Natural dynamics, room sound, balance
- **Compression**: None to minimal
- **Saturation**: None
- **Loudness**: -18 to -16 LUFS

## CPU Optimization Strategies

1. **Freeze Tracks**: Render tracks with heavy plugins
2. **Plugin Alternatives**: Use low-CPU alternatives where possible
3. **Disable When Bypassed**: Turn off processing for bypassed plugins
4. **Reduce Sample Rate**: Some plugins don't need 96kHz
5. **Offline Rendering**: Render effects instead of real-time

## Decision Framework

When recommending plugins, always consider:

1. **Audio Content**: What are you processing?
2. **Problem Identification**: What needs fixing?
3. **Artistic Goal**: What sound are you going for?
4. **Available Tools**: What plugins are installed?
5. **CPU Budget**: Can the system handle it?
6. **Plugin Order**: Will this chain work together?
7. **Genre Context**: Does this fit the style?

Remember: You're not just selecting plugins - you're crafting a sound.
Use your knowledge, trust your ears, and make musical decisions.
`;

/**
 * Instrument-Specific Plugin Chain Templates
 */
export const INSTRUMENT_TEMPLATES = {
  vocal: {
    name: 'Lead Vocal',
    description: 'Professional vocal processing chain',
    chain: `
1. **Gate** (optional, if recording has noise)
   - Threshold: Set just above noise floor
   - Attack: 0.1ms
   - Release: 50-100ms

2. **High-Pass Filter** (80-100Hz)
   - Remove low-end rumble
   - 12dB/octave slope

3. **De-Esser** (if sibilance present)
   - Frequency: 4-8kHz
   - Threshold: Catch only harsh "S" sounds
   - Ratio: 3:1 to 6:1

4. **EQ (Corrective)**
   - Cut mud: -3dB @ 200-400Hz (narrow Q)
   - Notch resonances: -6dB @ problem frequencies

5. **Compressor** (main vocal comp)
   - Ratio: 3:1 to 6:1
   - Attack: 10-30ms (preserve attack)
   - Release: Auto or 100-300ms
   - Threshold: 3-6dB gain reduction

6. **EQ (Tonal)**
   - Boost presence: +2-4dB @ 2-5kHz (wide Q)
   - Add air: +1-3dB @ 8-12kHz (wide Q, high-shelf)

7. **Saturation** (optional)
   - Subtle tape/tube warmth
   - Drive: 5-15%

8. **Reverb** (on aux send)
   - Type: Plate or Hall
   - Pre-delay: 20-40ms
   - Decay: 1.5-2.5s
   - Send level: -18dB to -12dB

9. **Delay** (on aux send)
   - Type: Slap or quarter-note
   - Time: 40-120ms or sync to tempo
   - Send level: -24dB to -18dB
`,
  },

  drums: {
    name: 'Drum Bus',
    description: 'Drum bus processing for glue and punch',
    chain: `
1. **High-Pass Filter** (30-40Hz)
   - Remove sub-sonic rumble
   - Tight slope (6-12dB/oct)

2. **EQ (Corrective)**
   - Cut mud: -2dB @ 250-400Hz
   - Control low-mids: -1dB @ 400-800Hz

3. **Compressor** (glue comp)
   - Ratio: 4:1
   - Attack: 10-30ms (slow to preserve transients)
   - Release: Auto or 100-200ms
   - Threshold: 2-4dB gain reduction
   - Makeup gain: Match levels

4. **Saturation** (optional)
   - Tape saturation for analog warmth
   - Drive: 10-20%

5. **EQ (Tonal)**
   - Boost punch: +1-2dB @ 60-80Hz (kick)
   - Boost crack: +1-2dB @ 3-5kHz (snare)
   - Add air: +1dB @ 10kHz+ (cymbals)
`,
  },

  bass: {
    name: 'Bass',
    description: 'Bass processing for weight and clarity',
    chain: `
1. **High-Pass Filter** (30-40Hz)
   - Remove subsonic rumble
   - Protect speakers

2. **Multiband Compressor** (or split processing)
   - **Sub band (30-100Hz)**:
     * Ratio: 6:1 to 10:1
     * Attack: Fast (1-5ms)
     * Release: Medium (50-100ms)
     * Goal: Control low-end consistently

   - **Mid band (100Hz-1kHz)**:
     * Ratio: 3:1 to 4:1
     * Attack: Medium (10-20ms)
     * Release: Auto
     * Goal: Even out note-to-note variations

3. **Saturation**
   - Add harmonics for mix translation
   - Drive: 15-30%
   - Type: Tube or tape

4. **EQ (Tonal)**
   - Boost weight: +2-3dB @ 60-80Hz (broad Q)
   - Cut mud: -2dB @ 200-300Hz
   - Boost definition: +1-2dB @ 800Hz-1kHz
   - Add presence: +1dB @ 2-3kHz (pick attack)

5. **Compressor** (final leveling)
   - Ratio: 4:1
   - Attack: 20-40ms
   - Release: Auto or 100-200ms
   - Threshold: 3-5dB gain reduction
`,
  },

  guitar: {
    name: 'Electric Guitar',
    description: 'Guitar processing for clarity and space',
    chain: `
1. **High-Pass Filter** (80-100Hz)
   - Remove low-end rumble
   - Make room for bass

2. **EQ (Corrective)**
   - Cut mud: -3dB @ 200-400Hz
   - Reduce boxiness: -2dB @ 400-800Hz

3. **Compressor**
   - Ratio: 4:1
   - Attack: 10-20ms (preserve pick attack)
   - Release: Auto or 100-200ms
   - Threshold: 3-6dB gain reduction

4. **EQ (Tonal)**
   - Boost body: +1-2dB @ 800Hz-1.2kHz
   - Add presence: +2-3dB @ 2-4kHz
   - Add bite: +1dB @ 5-8kHz (optional)

5. **Stereo Delay** (optional, for width)
   - Time: 20-40ms L/R offset
   - Mix: 10-20%
   - Feedback: 0%

6. **Reverb** (on aux send)
   - Type: Room or Spring
   - Decay: 0.8-1.5s
   - Send level: -20dB to -15dB
`,
  },

  piano: {
    name: 'Piano',
    description: 'Piano processing for natural sound',
    chain: `
1. **High-Pass Filter** (40-60Hz)
   - Remove low-end rumble
   - Preserve fundamental

2. **EQ (Corrective)**
   - Cut mud: -2dB @ 250-500Hz
   - Reduce boxiness: -1dB @ 400-600Hz

3. **Compressor** (light touch)
   - Ratio: 2:1 to 3:1
   - Attack: 30-50ms (slow - preserve dynamics)
   - Release: Auto or 200-400ms
   - Threshold: 2-4dB gain reduction max

4. **EQ (Tonal)**
   - Boost warmth: +1dB @ 200-400Hz (optional)
   - Add clarity: +1-2dB @ 3-5kHz
   - Add air: +1-2dB @ 8-12kHz (high shelf)

5. **Reverb** (on aux send)
   - Type: Room or Hall
   - Decay: 1.5-2.5s
   - Send level: -18dB to -12dB (depends on style)
`,
  },

  master: {
    name: 'Master Bus',
    description: 'Professional mastering chain',
    chain: `
1. **EQ (Corrective)**
   - Subtle broad strokes only
   - Cut problem frequencies: -1 to -2dB max
   - Fix imbalances across frequency spectrum

2. **Multiband Compression**
   - **Low (20-120Hz)**:
     * Ratio: 3:1 to 4:1
     * Attack: Fast, Release: Medium
     * Control bass inconsistencies

   - **Low-Mid (120-500Hz)**:
     * Ratio: 2:1 to 3:1
     * Subtle control only

   - **Mid (500Hz-2kHz)**:
     * Ratio: 2:1
     * Very gentle

   - **High-Mid (2kHz-8kHz)**:
     * Ratio: 2:1 to 3:1
     * Control vocals/guitars

   - **High (8kHz+)**:
     * Ratio: 2:1
     * Gentle control

3. **Stereo Imager** (if needed)
   - Keep bass MONO (below 120Hz)
   - Subtle widening of mids/highs: 105-110%
   - Check mono compatibility!

4. **EQ (Tonal)**
   - Final tone shaping
   - Broad, musical moves only
   - +1 to +2dB maximum boosts

5. **Harmonic Exciter** (optional)
   - Very subtle
   - Add polish and glue
   - Mix: 5-15%

6. **Limiter**
   - Attack: 0.1-1ms
   - Release: Auto or 100-300ms
   - Ceiling: -0.3dB to -1dB (for streaming)
   - Target LUFS: -14 LUFS for streaming, -8 to -6 LUFS for competitive loudness

7. **Metering**
   - LUFS meter
   - True peak meter
   - Spectrum analyzer
   - Ensure no inter-sample peaks above -1dBTP
`,
  },
};

/**
 * Common Problem-Solution Database
 */
export const PROBLEM_SOLUTIONS = {
  muddyMix: {
    problem: 'Muddy mix - lacks clarity, frequencies clash',
    indicators: ['Low-mid buildup (200-500Hz)', 'Sounds woolly', 'Lacks definition'],
    solutions: [
      'High-pass more aggressively (80-120Hz) on all instruments except kick/bass',
      'Cut 200-400Hz on guitars, keys, vocals',
      'Cut 250-500Hz on bass (let kick have the low-end)',
      'Use multiband compression to control low-mids',
      'Reduce reverb below 500Hz',
    ],
    pluginTypes: ['eq', 'multiband'],
  },

  harshMix: {
    problem: 'Harsh/bright mix - ear fatigue, piercing',
    indicators: ['Painful highs (2-8kHz)', 'Sibilance', 'Ear fatigue'],
    solutions: [
      'Cut 2-5kHz on harsh elements (guitars, cymbals, vocals)',
      'Use de-esser on vocals (4-8kHz range)',
      'Roll off unnecessary high-end above 15kHz',
      'Check for over-compression causing harmonic distortion',
      'Reduce parallel compression on bright sources',
    ],
    pluginTypes: ['eq', 'deesser', 'compressor'],
  },

  noPunch: {
    problem: 'No punch/impact - sounds lifeless',
    indicators: ['Lacks energy', 'No dynamics', 'Flat sound'],
    solutions: [
      'Reduce over-compression (slower attack times)',
      'Use transient shaper to enhance attack phase',
      'Check phase alignment on multi-mic'd sources',
      'Add subtle saturation for harmonic content',
      'Boost punch frequencies (60-80Hz kick, 200Hz snare)',
    ],
    pluginTypes: ['compressor', 'transient-shaper', 'saturation', 'eq'],
  },

  lacksDept: {
    problem: 'Lacks depth/space - sounds flat',
    indicators: ['Everything sounds upfront', 'No dimension', '2D mix'],
    solutions: [
      'Add reverb/delay (subtle, musical amounts)',
      'Improve panning decisions (create space)',
      'Use EQ to create front-to-back depth (brighter = closer)',
      'Layer ambience tracks',
      'Use stereo widening on non-centered elements',
    ],
    pluginTypes: ['reverb', 'delay', 'stereo-imager'],
  },

  translation: {
    problem: "Doesn't translate - sounds different on other systems",
    indicators: ['Great on monitors', 'Bad in car/earbuds', 'Inconsistent'],
    solutions: [
      'Check mono compatibility (sum to mono, listen)',
      'Add harmonics via saturation (helps on small speakers)',
      'Balance frequency spectrum more evenly',
      'Avoid excessive sub-bass boost (doesn't translate)',
      'Use reference tracks from same genre',
    ],
    pluginTypes: ['analyzer', 'saturation', 'eq'],
  },

  clipping: {
    problem: 'Clipping/distortion - audible distortion',
    indicators: ['Meters hitting red', 'Crackling sound', 'Harsh peaks'],
    solutions: [
      'Reduce gain at source (before plugins)',
      'Fix gain staging throughout chain',
      'Use limiter as safety (not for loudness)',
      'Check for plugin internal overload',
      'Reduce input gain to compressors',
    ],
    pluginTypes: ['utility', 'limiter', 'compressor'],
  },

  sibilance: {
    problem: 'Sibilance - harsh "S" sounds on vocals',
    indicators: ['Painful "S" sounds (4-8kHz)', 'Spitty vocals', 'Mic proximity effect'],
    solutions: [
      'Use de-esser targeting 4-8kHz',
      'Multiband compression on 4-8kHz range',
      'EQ cut at sibilance frequency (narrow Q)',
      'Manually automate harsh "S" sounds down',
      'Re-record with proper mic technique (if possible)',
    ],
    pluginTypes: ['deesser', 'multiband', 'eq'],
  },

  thinSound: {
    problem: 'Thin sound - lacks body and weight',
    indicators: ['Weak low-end', 'Lacks warmth', 'Sounds hollow'],
    solutions: [
      'Add harmonic saturation (generates low-end harmonics)',
      'Boost fundamental frequencies (check instrument chart)',
      'Layer with sub-bass element (synth, 808)',
      'Reduce high-pass filter frequency',
      'Use parallel compression for thickness',
    ],
    pluginTypes: ['saturation', 'eq', 'compressor'],
  },

  overCompressed: {
    problem: 'Over-compressed - sounds squashed',
    indicators: ['No dynamics', 'Pumping artifacts', 'Lifeless', 'Distorted'],
    solutions: [
      'Reduce compression ratio (try 2:1 or 3:1)',
      'Slow down attack time (preserve transients)',
      'Reduce amount of gain reduction (aim for 3-4dB max)',
      'Remove unnecessary compressors in chain',
      'Use parallel compression instead of serial',
    ],
    pluginTypes: ['compressor'],
  },
};

/**
 * Export all training data
 */
export const AUDIO_ENGINEER_TRAINING = {
  coreKnowledge: ENGINEER_CORE_KNOWLEDGE,
  instrumentTemplates: INSTRUMENT_TEMPLATES,
  problemSolutions: PROBLEM_SOLUTIONS,
};
