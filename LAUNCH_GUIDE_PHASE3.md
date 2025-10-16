# 🚀 Phase 3 Launch Guide - Parallel Development

**Date**: October 15, 2025
**Instances**: 13 Claude Code instances
**Timeline**: 3-4 weeks to MVP
**Architecture**: Freestyle Flow + AI Personality (Jarvis)

---

## 📋 Quick Start

### 1. Clone Repository (Each Instance)
```bash
git clone <repo-url> dawg-ai-instance-N
cd dawg-ai-instance-N
git worktree add ../dawg-ai-instance-N <branch-name>
```

### 2. Distribution Strategy

**Option A: Manual Distribution**
- Open 13 separate Claude Code sessions
- Copy/paste the relevant instance prompt from `PHASE_3_INSTANCE_PROMPTS_COMPLETE.md`
- Each instance reads their section and begins work

**Option B: Automated (Recommended)**
```bash
# Extract each instance prompt to separate files
# Instance 1
sed -n '/^## 🎨 Instance 1:/,/^## 🧠 Instance 2:/p' PHASE_3_INSTANCE_PROMPTS_COMPLETE.md > instance-1-prompt.md

# Instance 2
sed -n '/^## 🧠 Instance 2:/,/^## 🎙️ Instance 3:/p' PHASE_3_INSTANCE_PROMPTS_COMPLETE.md > instance-2-prompt.md

# ... repeat for all 13
```

### 3. Launch Order (Critical Path)

**Week 1 - Foundation (Start These First)**
```
Priority 1 (No dependencies):
├── Instance 1: Design System + Chat UI
├── Instance 2: Jarvis AI Brain + NLU
├── Instance 4: Beat Engine
└── Instance 7: Command Bus

Priority 2 (Depends on Instance 1, 2):
├── Instance 3: Voice Interface (needs Instance 2)
└── Instance 10: Cloud Storage (can start in parallel)
```

**Week 2 - Core Features**
```
Priority 3 (Depends on Week 1):
├── Instance 5: Recording Manager (needs Instance 1)
├── Instance 6: Comp Engine (needs Instance 5)
├── Instance 8: Effects Processor (independent)
└── Instance 9: MIDI Editor (needs Instance 1)
```

**Week 3 - Integration**
```
Priority 4:
├── Instance 11: Mixing Console (needs Instance 8)
└── Instance 12: Export/Bounce (needs Instance 11)

Priority 5 (Final):
└── Instance 13: Integration Tests (needs ALL instances)
```

---

## 🔀 Git Worktree Setup (Recommended)

To avoid merge conflicts, use Git worktrees for each instance:

```bash
# Main repo
cd /Users/benkennon/dawg-ai-v0

# Create branches for each instance
git checkout -b design-system-chat-ui
git checkout -b jarvis-ai-brain
git checkout -b voice-interface
git checkout -b beat-engine
git checkout -b recording-takes
git checkout -b comp-engine
git checkout -b command-bus
git checkout -b effects-processor
git checkout -b midi-editor
git checkout -b cloud-storage
git checkout -b mixing-console
git checkout -b export-bounce
git checkout -b integration-tests

# Create worktrees (separate directories)
git worktree add ../dawg-instance-1 design-system-chat-ui
git worktree add ../dawg-instance-2 jarvis-ai-brain
git worktree add ../dawg-instance-3 voice-interface
# ... etc for all 13
```

**Benefits**:
- Each instance works in isolation
- No merge conflicts during development
- Can run tests independently
- Easy to merge when complete

---

## 📝 Instance Prompt Template

When starting a new Claude Code instance, use this template:

```markdown
Hi Claude,

I'm Instance [N] working on [Module Name] for DAWG AI Phase 3.

Please read the following prompt file:
/Users/benkennon/dawg-ai-v0/PHASE_3_INSTANCE_PROMPTS_COMPLETE.md

Find the section "## [Emoji] Instance [N]: [Module Name]" and follow those instructions.

Key context:
- I'm working in branch: [branch-name]
- My dependencies: [list dependencies]
- My deliverables: [brief list]
- Timeline: [week number]

Let's begin!
```

---

## 🧪 Testing Strategy

### Each Instance Must:
1. **Write unit tests** for all functions (`*.test.ts`)
2. **Write integration tests** for module boundaries (`*.integration.test.ts`)
3. **Ensure >80% code coverage** (run `npm run test:coverage`)
4. **Test performance targets** (e.g., voice loop <2s, beat preview <100ms)

### Instance 13 Responsibilities:
- E2E tests for complete workflows
- Cross-module integration tests
- Performance benchmarks
- User acceptance scenarios

---

## 📊 Progress Tracking

Create a shared progress board (GitHub Projects, Notion, etc.):

| Instance | Module | Status | Tests Pass | PR Ready |
|----------|--------|--------|------------|----------|
| 1 | Design System | 🟡 In Progress | ✅ 95% | ❌ |
| 2 | Jarvis AI | 🟢 Complete | ✅ 100% | ✅ |
| 3 | Voice Interface | 🔴 Blocked | ❌ 20% | ❌ |
| ... | ... | ... | ... | ... |

**Status Legend**:
- 🔴 Blocked (waiting on dependency)
- 🟡 In Progress
- 🟢 Complete (tests passing, PR ready)
- ✅ Merged to main

---

## 🔗 Integration Points

### Command Bus (Instance 7 provides)
All instances emit commands via:
```typescript
import { commandBus } from '$lib/core/command-bus';

commandBus.execute({
  type: 'beat.load',
  styleTags: ['toronto-ambient-trap']
});
```

### Event Bus (Cross-module communication)
```typescript
import { eventBus } from '$lib/core/event-bus';

eventBus.on('beat.loaded', (beat) => {
  // React to event
});

eventBus.emit('recording.started', { trackId: '...' });
```

### Store Access (Svelte 5 runes)
```typescript
import { sessionStore } from '$lib/stores/session';

const { tracks, tempo, timeSignature } = sessionStore;
```

---

## ⚠️ Common Pitfalls

### 1. Audio Context Lifecycle
```typescript
// ❌ DON'T create multiple AudioContexts
const ctx = new AudioContext();

// ✅ DO use the singleton from AudioEngine
import { audioEngine } from '$lib/audio/AudioEngine';
const ctx = audioEngine.getContext();
```

### 2. Tone.js Volume
```typescript
// ❌ DON'T set volume to 0 dB (too loud)
track.volume.value = 0;

// ✅ DO use calibrated volumes
// Single track: -23 dB (baseVolume 0.32)
// Multi-track: -26 dB (baseVolume 0.20)
```

### 3. Async Rendering
```typescript
// ❌ DON'T await without timeout
await audioEngine.render();

// ✅ DO set reasonable timeouts
await audioEngine.render({ timeout: 60000 }); // 60s max
```

### 4. Memory Leaks
```typescript
// ❌ DON'T forget to dispose
const player = new Tone.Player(url);

// ✅ DO clean up
player.dispose();
audioBuffer.dispose();
```

---

## 📞 Communication Protocol

### Daily Standups (Async)
Each instance posts to shared doc:
- What I completed yesterday
- What I'm working on today
- Any blockers

### Integration Checkpoints
**End of Week 1**: Instances 1, 2, 4, 7 demo progress
**End of Week 2**: Instances 3, 5, 6, 8, 9 demo integration
**End of Week 3**: Instances 11, 12 demo complete flow
**Week 4**: Instance 13 runs full E2E suite

---

## 🎯 Success Criteria (Phase 3 Complete)

### Functional Requirements
- ✅ User can say "load a drake vibe" → beat candidates appear
- ✅ User can record 16 bars → takes saved with metrics
- ✅ Auto-comp creates composite from best segments
- ✅ Export WAV/MP3 works with correct volume calibration
- ✅ Jarvis responds with personality (supportive/excited/challenging/chill)
- ✅ Voice loop <2s (STT + AI + TTS + command execution)

### Technical Requirements
- ✅ All 13 modules implemented
- ✅ >80% test coverage
- ✅ E2E tests passing
- ✅ Performance targets met
- ✅ No console errors in production
- ✅ Offline rendering functional

### User Experience
- ✅ Chat interface is intuitive
- ✅ Jarvis personality feels natural
- ✅ Beat search returns relevant results
- ✅ Recording workflow is smooth
- ✅ Auto-comp saves time vs manual editing

---

## 🚨 Emergency Protocols

### If Instance Gets Blocked
1. **Document the blocker** in shared progress board
2. **Notify dependent instances** (e.g., Instance 3 blocked → notify Instance 13)
3. **Work on independent tasks** while waiting
4. **Escalate if >24h blocked** (user intervention needed)

### If Tests Fail After Integration
1. **Isolate the failure** (which module?)
2. **Check integration points** (command bus, event bus, stores)
3. **Add logging** to trace the issue
4. **Coordinate with dependent instance** to debug

### If Performance Targets Missed
1. **Profile the bottleneck** (Chrome DevTools, Lighthouse)
2. **Optimize hot paths** (memoization, lazy loading, web workers)
3. **Adjust targets** if unrealistic (document why)

---

## 📚 Key References

- **Architecture**: `PHASE_3_FREESTYLE_FLOW_ARCHITECTURE.md`
- **Instance Prompts**: `PHASE_3_INSTANCE_PROMPTS_COMPLETE.md`
- **Testing Status**: `TESTING_FINAL_STATUS.md` (67% pass rate, known issues documented)
- **Audio Engine**: `/Users/benkennon/dawg-ai-v0/src/lib/audio/AudioEngine.ts`
- **Supabase**: [Project URL] (credentials in `.env`)
- **Deepgram API**: [Get key from dashboard]
- **ElevenLabs API**: [Get key from dashboard]

---

## 🎬 Let's Ship This! 🚀

**Timeline**: 3-4 weeks
**Team**: 13 Claude Code instances
**Goal**: Voice-driven DAW with AI personality
**Tagline**: "Talk to your beats. Create with Jarvis."

**Ready? Let's build the future of music production!** 🎵

---

**Created**: October 15, 2025
**Version**: 1.0
**Status**: Ready for parallel development launch
