# DAWG AI - Worktree Development Context

## 🎯 Your Role

You are working in an isolated git worktree as part of a parallel development team building DAWG AI. This document provides context for your specific module.

## 📍 Worktree Structure

Each worktree has its own branch and directory:
- **Location**: `../dawg-worktrees/<module-name>/`
- **Branch**: `module/<module-name>`
- **Context**: This CLAUDE.md file
- **Main Repo**: `../../dawg-ai/` (read-only reference)

## 🏗️ Project Architecture

```
DAWG AI (Monorepo)
├── apps/
│   ├── web/                 # Svelte 5 web app
│   ├── backend/             # Express API
│   └── ai-services/         # Python FastAPI
├── packages/
│   ├── audio-engine/        # Tone.js + Web Audio
│   ├── design-system/       # Svelte components
│   ├── types/               # Shared TypeScript types
│   └── utils/               # Shared utilities
```

## 🔧 Your Module

**Check your worktree name to determine your module:**

### Module 1: Design System (`design-system/`)
- **Package**: `packages/design-system/`
- **Focus**: Svelte 5 UI components
- **Dependencies**: None (foundation)
- **Blocks**: All other UI work
- **Tech**: Svelte 5, Tailwind CSS, Storybook

### Module 2: Audio Engine (`audio-engine/`)
- **Package**: `packages/audio-engine/`
- **Focus**: Core audio processing
- **Dependencies**: None (foundation)
- **Blocks**: Track manager, MIDI editor, effects
- **Tech**: Tone.js v15, Web Audio API, AudioWorklets

### Module 3: Track Manager (`track-manager/`)
- **Package**: `apps/web/src/features/tracks/`
- **Focus**: Multi-track management UI
- **Dependencies**: design-system, audio-engine
- **Tech**: Svelte 5, Zustand

### Module 4: MIDI Editor (`midi-editor/`)
- **Package**: `apps/web/src/features/midi/`
- **Focus**: Piano roll MIDI editor
- **Dependencies**: design-system, audio-engine
- **Tech**: Canvas API, Svelte 5

### Module 5: Effects Processor (`effects-processor/`)
- **Package**: `apps/web/src/features/effects/`
- **Focus**: Audio effects (EQ, compression, reverb)
- **Dependencies**: design-system, audio-engine
- **Tech**: Tone.js effects, Web Audio API

### Module 6: Voice Interface (`voice-interface/`)
- **Package**: `apps/web/src/features/voice/`
- **Focus**: Conversational AI control
- **Dependencies**: design-system, audio-engine
- **Tech**: Deepgram, Claude API, ElevenLabs

### Module 7: AI Beat Generator (`ai-beat-generator/`)
- **Package**: `apps/ai-services/beat-generator/`
- **Focus**: Text-to-beat generation
- **Dependencies**: audio-engine (integration)
- **Tech**: Python, MusicGen, FastAPI

### Module 8: AI Vocal Coach (`ai-vocal-coach/`)
- **Package**: `apps/ai-services/vocal-coach/`
- **Focus**: Pitch correction & feedback
- **Dependencies**: audio-engine (integration)
- **Tech**: Python, ONNX, pYIN algorithm

### Module 9: AI Mixing/Mastering (`ai-mixing-mastering/`)
- **Package**: `apps/ai-services/mixing/`
- **Focus**: Automated mixing & mastering
- **Dependencies**: audio-engine (integration)
- **Tech**: Python, LANDR API, audio analysis

### Module 10: Cloud Storage (`cloud-storage/`)
- **Package**: `apps/backend/src/storage/`
- **Focus**: Project storage & sync
- **Dependencies**: None
- **Tech**: Supabase, S3, IndexedDB

### Module 11: Integration Testing (`integration-testing/`)
- **Package**: `tests/integration/`
- **Focus**: Cross-module testing
- **Dependencies**: All modules
- **Tech**: Vitest, Playwright

## 📝 Development Workflow

### 1. Daily Routine
```bash
# Morning: Pull latest from main
git fetch origin main
git merge origin/main

# Work on your features
# (edit files, run tests, etc.)

# Evening: Commit and push
git add .
git commit -m "feat(module): description"
git push origin module/<your-module>
```

### 2. Creating Pull Requests
```bash
# When feature is complete
gh pr create \
  --title "feat(<module>): Feature description" \
  --body "## Changes\n- Feature 1\n- Feature 2" \
  --base main \
  --head module/<your-module>
```

### 3. Integration Testing
```bash
# Before creating PR, run integration tests
cd ../../dawg-ai
pnpm test:integration
```

## 🔗 Module Communication

### Import Patterns
```typescript
// Import from design system
import { Button, Knob } from '@dawg-ai/design-system'
import type { ButtonProps } from '@dawg-ai/design-system'

// Import from audio engine
import { AudioEngine, Track } from '@dawg-ai/audio-engine'
import type { TrackConfig } from '@dawg-ai/audio-engine'

// Import from types
import type { Project, Recording } from '@dawg-ai/types'

// Import from utils
import { formatTime, debounce } from '@dawg-ai/utils'
```

### Event Communication
```typescript
import { eventBus } from '@dawg-ai/event-bus'

// Emit events
eventBus.emit('track:added', { trackId, track })
eventBus.emit('playback:started', { timestamp })

// Listen to events
eventBus.on('track:selected', ({ trackId }) => {
  // Handle track selection
})
```

## 🧪 Testing

### Run Tests in Your Module
```bash
# Unit tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage
pnpm test:coverage
```

### Test Checklist
- [ ] Unit tests for all public functions
- [ ] Integration tests for module interactions
- [ ] Performance tests (if applicable)
- [ ] Accessibility tests (if UI component)

## 📊 Progress Tracking

### Use TODO comments
```typescript
// TODO(module-name): Description of what needs to be done
// FIXME(module-name): Description of bug to fix
// NOTE(module-name): Important implementation note
```

### Commit Message Convention
```
<type>(<scope>): <description>

feat(audio-engine): add recording functionality
fix(design-system): correct button focus state
docs(midi-editor): add usage examples
test(effects): add unit tests for compressor
```

**Types**: feat, fix, docs, style, refactor, test, chore

## 🚫 Avoid Conflicts

### DO NOT Edit
- Root `package.json` (unless coordinated)
- Other modules' directories
- Shared types without discussion
- CI/CD workflows without coordination

### DO Edit Freely
- Your module's code
- Your module's tests
- Your module's documentation
- Your module's package.json

## 📞 Communication Protocol

### When You Need Help
1. Check `SYNC.md` in main repo
2. Create GitHub issue: `[BLOCKER] <module> needs <thing>`
3. Tag as `priority: high` if blocking

### When You Complete a Task
1. Update `SYNC.md` with your status
2. Commit and push your branch
3. Create PR when feature is complete
4. Update this CLAUDE.md if architecture changed

## 🎯 Success Criteria

### Your Module is Complete When:
- [ ] All features implemented per spec
- [ ] Tests passing (>80% coverage)
- [ ] TypeScript compiles without errors
- [ ] ESLint passes
- [ ] Documentation complete
- [ ] Integration tested with dependent modules
- [ ] Performance benchmarks met
- [ ] PR created and reviewed

## 🔥 Quick Commands

```bash
# Development
pnpm dev                    # Start dev server
pnpm test                   # Run tests
pnpm typecheck              # Check types
pnpm lint                   # Lint code

# Integration
cd ../../dawg-ai            # Go to main repo
pnpm test:integration       # Run integration tests
git worktree list           # See all worktrees

# Git
git status                  # Check status
git log --oneline -10       # Recent commits
git diff main               # Compare with main
```

## 📚 Resources

- [Main README](../../dawg-ai/README.md)
- [Technical Design Doc](../../dawg-ai/docs/TECHNICAL_DESIGN.md)
- [API Contracts](../../dawg-ai/docs/API_CONTRACTS.md)
- [Complete Prompts Library](../../dawg-ai/DAWG_AI_COMPLETE_PROMPTS.md)

## 💡 Tips

1. **Stay Focused**: Only work on your module
2. **Test Early**: Write tests as you code
3. **Commit Often**: Small, atomic commits
4. **Document**: Update README as you go
5. **Communicate**: Update SYNC.md regularly

---

**Remember**: You're part of a team of 11 instances working in parallel. Your module is critical to the success of DAWG AI!

🎵 Let's build an amazing AI-powered DAW! 🤖
