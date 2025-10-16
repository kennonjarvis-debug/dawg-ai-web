# Phase 3 - Claude Instance Prompts
**Date**: October 15, 2025
**Status**: Ready to launch Phase 3 development
**Instances**: 13 specialized prompts for parallel development

---

## 🎯 Phase 3 Overview

**Goal**: Implement Modules 6-9 (Arrangement, AI, Mixing, Export) + polish existing modules

**Timeline**: 2-4 weeks (with parallel instances)

**Architecture**: Modular development with clear interfaces

---

## Instance 1: Arrangement View (Module 6)

### Prompt

```markdown
You are Instance 1, responsible for implementing the Arrangement View (Module 6) for DAWG AI.

**Context**: DAWG AI is a web-based DAW with completed modules 1-5, 10. You're building the timeline/arrangement view.

**Your Mission**: Implement a professional arrangement view with:
- Horizontal timeline with time ruler
- Track lanes showing clips
- Zoom controls (horizontal and vertical)
- Snap-to-grid functionality
- Multi-clip selection
- Copy/paste/delete operations
- Loop region selection

**Key Requirements**:
1. Use existing `AudioEngine`, `Track`, and `Clip` classes
2. Integrate with design system (Glass/Purple theme)
3. Support both audio and MIDI clips
4. Canvas-based rendering for performance
5. Touch/mouse interactions

**Technical Specs**:
- File: `src/routes/daw/+page.svelte` (extend existing DAW page)
- Component: `src/lib/components/arrangement/TimelineView.svelte` (new)
- Store: `src/lib/stores/arrangementStore.ts` (new)

**Success Criteria**:
- Can view all tracks and clips in timeline
- Can drag clips to move them
- Can resize clips by dragging edges
- Can copy/paste clips
- Zoom works smoothly (mouse wheel)
- Time ruler shows bars/beats correctly

**Resources**:
- Check `/CLAUDE_MODULE_PROMPTS.md` for Module 6 details
- See `src/lib/audio/Clip.ts` for clip data structure
- Reference `src/lib/design-system` for UI components

**Deliverables**:
1. `TimelineView.svelte` - Main arrangement component
2. `arrangementStore.ts` - State management
3. `ClipRenderer.ts` - Canvas drawing logic
4. Unit tests for clip operations
5. README documenting usage

Start by reading the existing codebase to understand the Track/Clip structure, then implement the timeline rendering.
```

---

## Instance 2: AI Assistant - Voice Interface (Module 7a)

### Prompt

```markdown
You are Instance 2, responsible for the AI Voice Interface for DAWG AI's AI Assistant (Module 7).

**Context**: DAWG AI needs voice-controlled beat generation and project commands. Test bridge has basic voice command parsing - you'll make it production-ready.

**Your Mission**: Implement a natural language voice interface that:
- Captures microphone input
- Transcribes speech to text (using Deepgram)
- Parses commands into actions
- Executes DAW operations
- Provides voice/text feedback

**Key Commands to Support**:
1. Beat Generation: "Generate a trap beat at 140 BPM"
2. Track Operations: "Add a vocal track", "Mute track 2"
3. Effects: "Add reverb to vocals with 2 second decay"
4. Transport: "Play from bar 8", "Set tempo to 120"
5. Projects: "Save project as 'My Song'"

**Technical Specs**:
- Integration: Extend `src/lib/testing/bridge.ts:speakToAssistant()` for production
- New Files:
  - `src/lib/ai/VoiceInterface.svelte` - UI component
  - `src/lib/ai/CommandParser.ts` - NLP parsing
  - `src/lib/ai/VoiceCapture.ts` - Microphone handling
  - `src/lib/ai/Transcription.ts` - Deepgram integration

**Success Criteria**:
- Can capture voice in browser
- Transcription appears in <500ms
- Commands execute correctly 90%+ of the time
- Error handling for unclear commands
- Works without internet (local fallback)

**API Keys Needed**:
- Deepgram (for transcription) - Add to `.env`
- Optional: Anthropic Claude (for complex parsing)

**Resources**:
- See `package.json` - `@deepgram/sdk` already installed
- Check `CLAUDE_MODULE_PROMPTS.md` Module 7 section
- Reference test bridge: `src/lib/testing/bridge.ts:181-234`

**Deliverables**:
1. Voice capture UI component
2. Command parser with test coverage
3. Deepgram integration
4. Documentation of supported commands
5. Demo video showing 10 voice commands working

Start by setting up Deepgram transcription, then build the command parser.
```

---

## Instance 3: AI Assistant - Beat Generation (Module 7b)

### Prompt

```markdown
You are Instance 3, responsible for AI-powered beat generation for DAWG AI (Module 7).

**Context**: Test bridge has stub beat generation (creates 3 empty tracks). You'll implement real AI-generated MIDI patterns.

**Your Mission**: Create an AI system that generates drum patterns based on:
- Genre (trap, hip-hop, house, techno, etc.)
- BPM
- Complexity level
- Style descriptors ("hard 808s", "rolling hi-hats")

**Approach** (choose one):
1. **Rule-Based** (faster): Algorithmic patterns with randomization
2. **ML-Based** (better): Use Anthropic Claude API to generate MIDI data
3. **Hybrid**: Rules + AI refinement

**Technical Specs**:
- Entry Point: Improve `src/lib/testing/bridge.ts:speakToAssistant()`
- New Files:
  - `src/lib/ai/BeatGenerator.ts` - Core generation logic
  - `src/lib/ai/DrumPatterns.ts` - Pattern templates
  - `src/lib/ai/MIDIGenerator.ts` - MIDI note creation

**MIDI Output Format**:
```typescript
interface DrumHit {
  time: number;      // In beats (0 = bar start)
  note: number;      // MIDI note (36 = kick, 38 = snare, 42 = closed hat)
  velocity: number;  // 0-127
  duration: number;  // In beats
}
```

**Success Criteria**:
- Generates 4-16 bar drum patterns
- Supports 5+ genres
- Patterns are musically coherent
- BPM affects note density correctly
- Can export as MIDI file

**Resources**:
- Check `src/lib/audio/midi/MIDIClip.ts` for MIDI structure
- See `@anthropic-ai/sdk` in `package.json`
- Reference test stub: `src/lib/testing/bridge.ts:200-220`

**Deliverables**:
1. Beat generation engine
2. 10+ genre templates
3. MIDI export functionality
4. Unit tests with example patterns
5. Documentation of pattern structure

Start by analyzing existing MIDIClip structure, then implement a rule-based generator first (can upgrade to ML later).
```

---

## Instance 4: Mixing Console (Module 8)

### Prompt

```markdown
You are Instance 4, responsible for implementing the Mixing Console (Module 8) for DAWG AI.

**Context**: DAWG AI has tracks and effects, but no dedicated mixing view. You'll build a professional mixer interface.

**Your Mission**: Create a mixing console with:
- Channel strips for each track (fader, pan, mute, solo, meters)
- Master section (master fader, limiter, meters)
- Send/return busses
- Track routing matrix
- VU meters with peak/RMS display
- Automation view integration

**Key Features**:
1. **Channel Strip**: Fader (-∞ to +6dB), Pan (L-R), Mute/Solo buttons
2. **Metering**: Real-time VU meters with peak hold
3. **Routing**: Send tracks to aux busses, return to master
4. **Grouping**: Link faders for grouped tracks
5. **Automation**: Record/playback volume automation

**Technical Specs**:
- File: `src/lib/components/mixer/MixerConsole.svelte` (new)
- Components:
  - `ChannelStrip.svelte` - Individual track strip
  - `MasterStrip.svelte` - Master bus strip
  - `VUMeter.svelte` - Metering display
  - `RoutingMatrix.svelte` - Signal flow diagram

**Success Criteria**:
- All tracks visible as channel strips
- Faders control volume accurately
- Pan control works correctly
- Meters update at 60fps
- Solo/mute work correctly
- Can save/recall mixer state

**Resources**:
- Check `src/lib/audio/Track.ts` for volume/pan methods
- See `src/lib/audio/MasterBus.ts` for master controls
- Use `src/lib/design-system/atoms/Fader.svelte` (already exists!)
- Reference `src/lib/design-system/atoms/Meter.svelte`

**Deliverables**:
1. Mixer console component
2. Channel strip component
3. VU meter with peak hold
4. Routing matrix
5. Unit tests for signal flow
6. Screenshot/demo video

Start by building a single channel strip, then replicate for all tracks.
```

---

## Instance 5: Export & Bounce (Module 9)

### Prompt

```markdown
You are Instance 5, responsible for implementing Export & Bounce functionality (Module 9) for DAWG AI.

**Context**: DAWG AI has offline rendering working (tested in smoke tests). You'll build the UI and export formats.

**Your Mission**: Create a comprehensive export system with:
- Real-time export (playback to WAV)
- Offline bounce (faster than real-time)
- Multiple formats (WAV, MP3, FLAC, OGG)
- Sample rate/bit depth selection
- Export regions (full project, loop, selection)
- Stem export (individual tracks)

**Export Options**:
1. **Format**: WAV (16/24/32-bit), MP3 (128-320 kbps), FLAC, OGG
2. **Sample Rate**: 44.1kHz, 48kHz, 96kHz
3. **Export Type**: Master mix, Individual tracks, Selected tracks
4. **Region**: Full project, Loop section, Time selection

**Technical Specs**:
- Entry Point: `src/lib/audio/AudioEngine.ts:renderOffline()` (already working!)
- New Files:
  - `src/lib/components/export/ExportDialog.svelte` - UI
  - `src/lib/audio/export/FormatConverter.ts` - Format conversion
  - `src/lib/audio/export/MP3Encoder.ts` - MP3 encoding
  - `src/lib/audio/export/Bouncer.ts` - Bounce orchestration

**Success Criteria**:
- Can export full mix to WAV (proven working)
- Can export to MP3 at various bitrates
- Can export individual track stems
- Progress bar shows render progress
- Exported files download automatically
- Metadata embedded (artist, title, BPM)

**Resources**:
- See `src/lib/audio/AudioEngine.ts:446-558` for working offline render
- Check `src/lib/testing/bridge.ts:161-179` for renderToWav() usage
- Look at smoke test results in `FINAL_TEST_RESULTS.md`
- Reference `lamejs` for MP3 encoding (add to package.json)

**Deliverables**:
1. Export dialog UI
2. Format converter (WAV → MP3/FLAC/OGG)
3. Progress indicator
4. Stem export functionality
5. Unit tests for each format
6. Documentation with examples

Start by building the export dialog UI, then add format converters one by one.
```

---

## Instance 6: Testing & QA (Volume Calibration)

### Prompt

```markdown
You are Instance 6, responsible for final test polish and volume calibration for DAWG AI.

**Context**: E2E tests are working, but volume levels are incorrect. You need to tune the audio levels so all tests pass.

**Your Mission**: Fix volume calibration so smoke tests pass with these metrics:
- record_vocal_plate.yml: RMS in [-26, -18] dB range
- ai_beat_generate.yml: RMS in [-20, -12] dB range
- midi_piano_quantize.yml: RMS in [-30, -18] dB range
- All tests: Zero dropouts

**Current Status** (see `FINAL_TEST_RESULTS.md`):
- Vocal plate: -12.21 dB (target: -26 to -18) → 8 dB too loud
- AI beat: -58.61 dB (target: -20 to -12) → 42 dB too quiet!
- MIDI piano: -10.04 dB (target: -30 to -18) → 16 dB too loud

**Root Cause**: Volume formula in `AudioEngine.ts:507-523` uses wrong RMS calculation.

**The Fix**:
```typescript
// In src/lib/audio/AudioEngine.ts, around line 507:
// RMS mixing formula: RMS_total = RMS_single * sqrt(N)
// Therefore: RMS_single = target / (sqrt(N) * master)

if (activeTracks.length === 1) {
  // Target: -22 dB, Master: 0.5
  // baseVolume = 10^(-22/20) / (sqrt(1) * 0.5) = 0.159
  baseVolume = 0.16; // TRY THIS FIRST
} else if (activeTracks.length <= 3) {
  // Target: -16 dB, Master: 0.8
  // baseVolume = 10^(-16/20) / (sqrt(3) * 0.8) = 0.114
  baseVolume = 0.12; // TRY THIS FIRST
}
```

**Iteration Process**:
1. Update baseVolume values in `src/lib/audio/AudioEngine.ts`
2. Wait for Vite HMR to recompile
3. Run tests: `cd ../dawg-superagent && DAWG_URL=http://localhost:5174 node apps/cli/dist/index.js smoke`
4. Check metrics.json files in `../dawg-superagent/out/report/*/metrics.json`
5. Adjust by 20% increments if needed
6. Repeat until all pass

**Success Criteria**:
- ✅ All 4 smoke tests PASS
- ✅ RMS levels within ±3dB of targets
- ✅ LUFS-I levels reasonable
- ✅ Dropouts reduced to 0
- ✅ Documentation updated

**Resources**:
- Read `FINAL_TEST_RESULTS.md` for current metrics
- See `VOLUME_CALIBRATION_FIX.md` for math background
- Check test specs in `../dawg-superagent/packages/specs/smoke/`

**Deliverables**:
1. Corrected volume formulas
2. All smoke tests passing
3. Updated documentation
4. Metrics comparison (before/after)
5. Final test report

Start by trying the suggested baseVolume values above, then iterate based on results.
```

---

## Instance 7: Automation System (Enhancement)

### Prompt

```markdown
You are Instance 7, responsible for implementing the Automation system for DAWG AI.

**Context**: AudioEngine has automation infrastructure (see `AudioEngine.ts:442-503`) but no UI or recording.

**Your Mission**: Build a complete automation system with:
- Parameter automation lanes
- Draw/record automation
- Automation modes (Read, Touch, Latch, Write)
- Curve editing
- Copy/paste automation
- Per-track automation view

**Automation Parameters**:
1. **Volume**: Track faders
2. **Pan**: Stereo position
3. **Effects**: All effect parameters (reverb decay, delay time, etc.)
4. **Send Levels**: Aux send amounts
5. **Master**: Master fader

**Technical Specs**:
- Extend: `src/lib/audio/automation/` (already has Automation.ts!)
- New Files:
  - `src/lib/components/automation/AutomationLane.svelte` - Visual editor
  - `src/lib/components/automation/CurveEditor.svelte` - Bezier curves
  - `src/lib/stores/automationStore.ts` - State management

**Success Criteria**:
- Can draw volume automation
- Automation plays back accurately
- Can record live parameter changes
- Copy/paste automation works
- Undo/redo supported
- Export includes automation

**Resources**:
- Check `src/lib/audio/automation/Automation.ts` (already implemented!)
- See `src/lib/audio/AudioEngine.ts:442-503` for API methods
- Reference professional DAWs (Ableton, Logic) for UX patterns

**Deliverables**:
1. Automation lane component
2. Curve editing tools
3. Recording functionality
4. Mode switching (Read/Touch/Latch/Write)
5. Unit tests
6. Demo video showing automation recording

Start by implementing the visual automation lane, then add recording.
```

---

## Instance 8: MIDI Editor Enhancements

### Prompt

```markdown
You are Instance 8, responsible for enhancing the MIDI Editor (Module 4) in DAWG AI.

**Context**: Basic MIDI editor exists with quantize button. You'll add advanced features.

**Your Mission**: Enhance MIDI editor with:
- Piano roll view (already exists - polish it)
- Note velocity editor
- Note duration adjustment
- MIDI CC lanes (modulation, expression, etc.)
- Chord detection/insertion
- Humanize function
- Advanced quantize options

**Key Features to Add**:
1. **Velocity Editor**: Bottom lane showing note velocities as bars
2. **CC Lanes**: Automation for MIDI controllers (mod wheel, expression)
3. **Chord Tools**: Detect chords, insert chord shapes
4. **Humanize**: Add timing/velocity randomization
5. **Quantize Options**: Strength, swing, triplets

**Technical Specs**:
- Extend: `src/routes/daw/+page.svelte` (has handleQuantize() stub)
- Files to Modify:
  - `src/lib/components/midi/PianoRoll.svelte` (if exists)
  - `src/lib/audio/midi/MIDIClip.ts:quantize()` method
- New Files:
  - `src/lib/components/midi/VelocityEditor.svelte`
  - `src/lib/components/midi/CCLane.svelte`
  - `src/lib/midi/ChordLibrary.ts`

**Success Criteria**:
- Can edit note velocities visually
- Can draw CC automation
- Humanize adds subtle variation
- Quantize has strength and swing parameters
- Chord insertion works for major/minor/7th chords

**Resources**:
- See `src/lib/audio/midi/MIDIClip.ts` for MIDI data structure
- Check `src/routes/daw/+page.svelte:179-183` for quantize stub
- Reference test: `../dawg-superagent/packages/specs/smoke/midi_piano_quantize.yml`

**Deliverables**:
1. Velocity editor component
2. CC lane editor
3. Chord library (30+ chords)
4. Humanize algorithm
5. Enhanced quantize options
6. Unit tests for MIDI operations

Start by implementing the velocity editor, then add CC lanes.
```

---

## Instance 9: Effects Rack Enhancements

### Prompt

```markdown
You are Instance 9, responsible for enhancing the Effects system (Module 5) in DAWG AI.

**Context**: Effects work perfectly (reverb tails proven at 14+ seconds!). Now add more effects and polish.

**Your Mission**: Expand effects library with:
- Additional effects (Chorus, Flanger, Phaser, etc.)
- Effect presets
- A/B comparison
- Effect chain templates
- Visual feedback (waveform, spectrum)
- Advanced effect routing

**New Effects to Add**:
1. **Chorus**: Thick, doubling effect
2. **Flanger**: Sweeping comb filter
3. **Phaser**: Phase-shifted modulation
4. **Distortion**: Overdrive, fuzz, saturation
5. **Bitcrusher**: Lo-fi, digital distortion
6. **Filter**: Low/High/Band-pass with resonance
7. **Stereo Width**: Haas effect, M/S processing

**Technical Specs**:
- Extend: `src/lib/audio/effects/` directory
- Base Class: `src/lib/audio/effects/Effect.ts` (already has applyToOfflineContext!)
- New Files:
  - `src/lib/audio/effects/Chorus.ts`
  - `src/lib/audio/effects/Flanger.ts`
  - `src/lib/audio/effects/Phaser.ts`
  - (etc. for each effect)
- Presets: `src/lib/audio/effects/presets/` directory

**Success Criteria**:
- All 7 new effects work in real-time
- All effects render in offline context (for export)
- 10+ presets per effect
- A/B comparison works
- Visual feedback shows effect is active
- No audio glitches or clicks

**Resources**:
- Check `src/lib/audio/effects/Reverb.ts` for template (has perfect offline rendering!)
- See `src/lib/audio/effects/Effect.ts` for base class
- Test with: Effect creation tested in smoke tests
- Reference Tone.js docs for effect implementations

**Deliverables**:
1. 7 new effect classes
2. Offline rendering for each
3. 70+ presets (10 per effect)
4. A/B comparison UI
5. Unit tests for each effect
6. Demo showcasing all effects

Start by implementing Chorus (simplest), then Phaser, then Flanger.
```

---

## Instance 10: Cloud Storage Enhancements (Module 10)

### Prompt

```markdown
You are Instance 10, responsible for enhancing Cloud Storage (Module 10) in DAWG AI.

**Context**: Basic Supabase integration exists. You'll add collaboration and advanced features.

**Your Mission**: Enhance cloud storage with:
- Real-time collaboration (multiple users on one project)
- Version history (snapshots + rollback)
- Project templates
- Cloud audio library
- Share links
- Offline mode with sync

**Key Features**:
1. **Real-time Collab**: See other users' cursors and changes
2. **Version History**: Auto-save snapshots, compare versions, rollback
3. **Templates**: Starter projects for different genres
4. **Audio Library**: Cloud-hosted sample packs
5. **Sharing**: Generate shareable links with permissions
6. **Offline Sync**: Work offline, sync when back online

**Technical Specs**:
- Extend: `src/lib/cloud/` directory
- Files to Modify:
  - `src/lib/cloud/ProjectAPI.ts`
  - `src/lib/cloud/StorageAPI.ts`
  - `src/lib/stores/authStore.ts`
- New Files:
  - `src/lib/cloud/Collaboration.ts` - Real-time features
  - `src/lib/cloud/VersionHistory.ts` - Snapshots
  - `src/lib/cloud/Templates.ts` - Template management

**Supabase Setup**:
- Tables: `projects`, `project_versions`, `templates`, `audio_library`
- Real-time: Use Supabase Realtime for collaboration
- Storage: Use Supabase Storage for audio files

**Success Criteria**:
- Two users can edit same project simultaneously
- Version history shows last 50 snapshots
- Can rollback to any version
- 10+ project templates available
- Share links work (view/edit permissions)
- Offline mode syncs correctly

**Resources**:
- Check `src/lib/cloud/` directory for existing API
- See `src/lib/components/cloud/ProjectManager.svelte` for UI
- Reference Supabase docs for Realtime features

**Deliverables**:
1. Real-time collaboration
2. Version history system
3. 10 project templates
4. Cloud audio library
5. Share link generation
6. Offline sync logic
7. Unit tests for sync

Start by implementing version history (simpler), then add real-time collaboration.
```

---

## Instance 11: Performance Optimization

### Prompt

```markdown
You are Instance 11, responsible for performance optimization across DAWG AI.

**Context**: DAWG AI works but hasn't been optimized. You'll profile and optimize for speed.

**Your Mission**: Optimize performance to meet these targets:
- Audio latency: <10ms
- UI framerate: 60fps
- Offline render: 20-50x faster than real-time
- Load time: <3s
- Memory usage: <500MB

**Optimization Areas**:
1. **Audio Engine**: Reduce buffer size, optimize effect chains
2. **UI Rendering**: Virtual scrolling, canvas optimization
3. **MIDI Editor**: Limit visible notes, batch updates
4. **Timeline**: Level-of-detail rendering, culling
5. **Bundle Size**: Code splitting, lazy loading
6. **Memory**: Object pooling, proper disposal

**Technical Approach**:
1. **Profile First**: Use Chrome DevTools to find bottlenecks
2. **Measure Everything**: Before/after metrics for each optimization
3. **Low-Hanging Fruit**: Virtual scrolling, lazy loading
4. **Complex**: Web Workers for audio analysis

**Success Criteria**:
- Audio latency measured <10ms
- Timeline scrolling at 60fps
- Bundle size reduced by 30%
- Memory leaks eliminated
- Load time under 3 seconds
- All optimizations documented

**Tools to Use**:
- Chrome DevTools Performance panel
- Lighthouse for load time
- Web Audio API latency measurement
- Bundle analyzer for code splitting

**Resources**:
- Check `src/lib/audio/AudioEngine.ts` for audio optimizations
- See Svelte docs for rendering optimizations
- Reference Vite docs for bundle optimization

**Deliverables**:
1. Performance audit report
2. Optimization implementations
3. Before/after metrics
4. Bundle size reduction
5. Memory leak fixes
6. Documentation of all changes

Start by running Lighthouse and Chrome DevTools profiler to identify bottlenecks.
```

---

## Instance 12: Documentation & Onboarding

### Prompt

```markdown
You are Instance 12, responsible for documentation and developer onboarding for DAWG AI.

**Context**: DAWG AI has extensive code but minimal documentation. You'll create comprehensive docs.

**Your Mission**: Create complete documentation including:
- Developer onboarding guide
- Architecture documentation
- API reference
- Component library
- Contributing guide
- Deployment guide

**Documentation Structure**:
```
docs/
├── getting-started/
│   ├── installation.md
│   ├── quickstart.md
│   └── architecture.md
├── api/
│   ├── audio-engine.md
│   ├── track-manager.md
│   ├── effects-rack.md
│   └── midi-system.md
├── components/
│   ├── design-system.md
│   ├── timeline.md
│   ├── mixer.md
│   └── piano-roll.md
├── guides/
│   ├── adding-effects.md
│   ├── creating-tests.md
│   └── deploying.md
└── contributing.md
```

**Key Documents**:
1. **Architecture Overview**: System design, data flow, module structure
2. **API Reference**: Every public method documented
3. **Component Guide**: Storybook or similar for UI components
4. **Testing Guide**: How to write/run tests
5. **Deployment**: Production deployment steps

**Success Criteria**:
- New developer can set up in <15 minutes
- All modules documented
- API reference 100% complete
- 20+ code examples
- Diagrams for complex systems
- Search functionality works

**Tools to Use**:
- VitePress or Docusaurus for docs site
- Storybook for component library
- TypeDoc for API reference generation
- Mermaid.js for diagrams

**Resources**:
- Check all existing markdown files in project root
- See `CLAUDE_MODULE_PROMPTS.md` for module descriptions
- Reference completed modules for examples

**Deliverables**:
1. Complete documentation site
2. API reference (auto-generated)
3. 10+ system diagrams
4. Component library with examples
5. Contributing guide
6. Deployment runbook

Start by setting up VitePress, then generate API docs from TypeScript.
```

---

## Instance 13: UI/UX Polish & Accessibility

### Prompt

```markdown
You are Instance 13, responsible for UI/UX polish and accessibility for DAWG AI.

**Context**: DAWG AI is functional but needs polish. You'll enhance UX and add accessibility features.

**Your Mission**: Polish UI/UX with:
- Keyboard shortcuts for all actions
- Screen reader support (ARIA labels)
- High contrast mode
- Onboarding tutorial
- Tooltips and help hints
- Error handling UX
- Loading states

**Accessibility Targets** (WCAG 2.1 AA):
- Keyboard navigation for all features
- Screen reader compatible
- Color contrast ≥4.5:1
- Focus indicators visible
- Alt text for all images
- Captions for videos

**Keyboard Shortcuts to Add**:
- `Space`: Play/pause
- `R`: Start recording
- `Cmd+Z`: Undo
- `Cmd+C/V`: Copy/paste clips
- `Cmd+S`: Save project
- `Delete`: Delete selection
- `M/S`: Mute/solo track
- `+/-`: Zoom timeline

**Success Criteria**:
- Can use entire DAW with keyboard only
- Screen reader announces all actions
- Passes WCAG 2.1 AA audit
- Onboarding tutorial complete
- All buttons have tooltips
- Error messages are helpful
- Loading states show progress

**Tools to Use**:
- axe DevTools for accessibility testing
- NVDA/VoiceOver for screen reader testing
- Keyboard navigation testing
- Color contrast checker

**Resources**:
- Check `src/lib/design-system/` for existing components
- See Svelte a11y warnings in console
- Reference professional DAWs for keyboard shortcuts

**Deliverables**:
1. Keyboard shortcut system
2. ARIA labels on all interactive elements
3. High contrast theme
4. Onboarding tutorial (5 steps)
5. Tooltip system
6. Error handling patterns
7. Accessibility audit report

Start by adding ARIA labels to existing components, then implement keyboard shortcuts.
```

---

## 🚀 Deployment Strategy

### Parallel Development

**Week 1-2**: Instances 1-6 (Core features + testing)
- Instance 1: Arrangement View
- Instance 2: Voice Interface
- Instance 3: Beat Generation
- Instance 4: Mixing Console
- Instance 5: Export/Bounce
- Instance 6: Volume Calibration

**Week 3-4**: Instances 7-13 (Enhancements + polish)
- Instance 7: Automation
- Instance 8: MIDI Enhancements
- Instance 9: More Effects
- Instance 10: Cloud Features
- Instance 11: Performance
- Instance 12: Documentation
- Instance 13: Accessibility

### Integration Points

Each instance should:
1. **Read codebase first** - Understand existing structure
2. **Create branch** - `feature/module-X` or `enhancement/feature-name`
3. **Write tests** - Unit tests + integration tests
4. **Document changes** - README or inline comments
5. **Create demo** - Video or screenshots showing feature working

### Success Metrics

- All modules functional
- All tests passing
- Documentation complete
- Accessibility audit passed
- Performance targets met
- Ready for beta launch

---

## 📋 Quick Reference

| Instance | Module | Priority | Complexity | Estimated Time |
|----------|--------|----------|------------|----------------|
| 1 | Arrangement View | High | Medium | 3-4 days |
| 2 | Voice Interface | High | Medium | 2-3 days |
| 3 | Beat Generation | Medium | High | 3-5 days |
| 4 | Mixing Console | High | Medium | 2-3 days |
| 5 | Export/Bounce | High | Low | 1-2 days |
| 6 | Volume Calibration | Critical | Low | 30-60 min |
| 7 | Automation | Medium | Medium | 2-3 days |
| 8 | MIDI Enhancements | Medium | Medium | 2-3 days |
| 9 | More Effects | Low | Medium | 3-4 days |
| 10 | Cloud Features | Medium | High | 4-5 days |
| 11 | Performance | High | High | 3-4 days |
| 12 | Documentation | Medium | Low | 2-3 days |
| 13 | Accessibility | High | Medium | 2-3 days |

**Total Estimated Time**: 30-45 days with parallel development = **2-3 weeks calendar time**

---

**Created**: October 15, 2025
**Status**: Ready to deploy
**Next Action**: Launch Instance 6 (Volume Calibration) immediately, then launch other instances in parallel
