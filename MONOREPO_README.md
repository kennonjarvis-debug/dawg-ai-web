# 🎵 DAWG AI - AI-Powered Digital Audio Workstation

**Browser-based DAW with conversational AI control and intelligent creative assistance**

[![CI/CD](https://github.com/dawg-ai/dawg-ai/actions/workflows/ci.yml/badge.svg)](https://github.com/dawg-ai/dawg-ai/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 20.0.0
- **pnpm** >= 8.0.0
- **Python** >= 3.10 (for AI services)
- **Git** >= 2.25.0

### Installation

```bash
# Clone repository
git clone https://github.com/dawg-ai/dawg-ai.git
cd dawg-ai

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# Start development
pnpm dev
```

The app will be available at:
- **Web App**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **AI Services**: http://localhost:3002

---

## 📦 Monorepo Structure

```
dawg-ai/
├── apps/
│   ├── web/                    # Svelte 5 web application
│   ├── backend/                # Express API server
│   └── ai-services/            # Python FastAPI for AI models
│
├── packages/
│   ├── audio-engine/           # Core audio processing (Tone.js + Web Audio)
│   ├── design-system/          # Shared Svelte UI components
│   ├── types/                  # Shared TypeScript type definitions
│   └── utils/                  # Shared utility functions
│
├── docs/                       # Documentation
├── scripts/                    # Build and deployment scripts
└── tests/                      # Integration and E2E tests
```

---

## 🛠️ Parallel Development Setup

DAWG AI uses **git worktrees** to enable parallel development by multiple team members or Claude Code instances.

### Setting Up Worktrees

```bash
# Run the setup script
./scripts/setup-worktrees.sh

# This creates 11 isolated worktrees in ../dawg-worktrees/
```

### Available Worktrees

| Worktree | Module | Focus | Duration |
|----------|--------|-------|----------|
| `design-system` | UI Components | Svelte 5 components, Storybook | 3-4 days |
| `audio-engine` | Audio Core | Tone.js + Web Audio API | 4-5 days |
| `track-manager` | Track UI | Multi-track management | 3-4 days |
| `midi-editor` | MIDI Editing | Piano roll editor | 4-5 days |
| `effects-processor` | Audio Effects | EQ, compression, reverb | 4-5 days |
| `voice-interface` | Voice Control | Deepgram + Claude + ElevenLabs | 3-4 days |
| `ai-beat-generator` | Beat Generation | MusicGen integration | 4-5 days |
| `ai-vocal-coach` | Vocal Coaching | Pitch correction + feedback | 4-5 days |
| `ai-mixing-mastering` | Auto Mixing | Automated mixing/mastering | 4-5 days |
| `cloud-storage` | Storage & Sync | Supabase + S3 integration | 3-4 days |
| `integration-testing` | Testing | E2E and integration tests | 5-7 days |

### Working in a Worktree

```bash
# Navigate to your worktree
cd ../dawg-worktrees/audio-engine

# Work on your module
# Read CLAUDE.md for module-specific context

# Commit and push
git add .
git commit -m "feat(audio-engine): add recording"
git push origin module/audio-engine

# Create PR when done
gh pr create --base main
```

---

## 📝 Development Commands

### Root Commands

```bash
# Development
pnpm dev                      # Start all services in parallel
pnpm dev:web                  # Start web app only
pnpm dev:backend              # Start backend only

# Building
pnpm build                    # Build all packages
pnpm build:web                # Build web app
pnpm build:backend            # Build backend
pnpm build:packages           # Build shared packages

# Testing
pnpm test                     # Run all tests
pnpm test:unit                # Unit tests only
pnpm test:integration         # Integration tests
pnpm test:e2e                 # End-to-end tests
pnpm test:watch               # Watch mode
pnpm test:coverage            # Generate coverage

# Code Quality
pnpm lint                     # Lint all code
pnpm lint:fix                 # Fix linting issues
pnpm format                   # Format all code
pnpm format:check             # Check formatting
pnpm typecheck                # TypeScript type checking

# Utilities
pnpm clean                    # Clean all build artifacts
```

### Package-Specific Commands

```bash
# Work on a specific package
pnpm --filter @dawg-ai/audio-engine dev
pnpm --filter @dawg-ai/design-system build
pnpm --filter @dawg-ai/web test
```

---

## 🏗️ Tech Stack

### Frontend
- **Svelte 5** - Reactive UI framework
- **Vite** - Build tool and dev server
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **Zustand** - State management

### Audio
- **Tone.js** - Web Audio framework
- **Web Audio API** - Low-level audio processing
- **WaveSurfer.js** - Waveform visualization
- **AudioWorklets** - Real-time DSP

### Backend
- **Node.js + Express** - API server
- **PostgreSQL** - Database
- **Redis** - Session cache
- **Socket.io** - WebSocket communication

### AI Services
- **Python + FastAPI** - AI service API
- **ONNX Runtime** - ML model inference
- **MusicGen** - Music generation
- **Claude API** - Conversational AI
- **Deepgram** - Speech-to-text
- **ElevenLabs** - Text-to-speech

---

## 📚 Documentation

- [**Complete Prompts Library**](./DAWG_AI_COMPLETE_PROMPTS.md) - Full development prompts
- [**Quick Start Guide**](./DAWG_AI_QUICK_START.md) - 8-week development plan
- [**Technical Design**](./docs/TECHNICAL_DESIGN.md) - Architecture specification
- [**API Documentation**](./docs/API_CONTRACTS.md) - Module interfaces
- [**Worktree Context**](./WORKTREE_CLAUDE.md) - Development context for worktrees

---

## 🎯 Development Timeline

### Week 1-2: Foundation
- ✅ Monorepo setup
- 🔄 Design System (Instance A)
- 🔄 Audio Engine Core (Instance B)
- 🔄 Backend API (Instance C)

### Week 3-4: Core Features
- ⏳ Track Manager (Instance D)
- ⏳ MIDI Editor (Instance E)
- ⏳ Effects Processor (Instance F)

### Week 5-6: AI Features
- ⏳ Voice Interface (Instance G)
- ⏳ AI Beat Generator (Instance H)
- ⏳ AI Vocal Coach (Instance I)
- ⏳ AI Mixing/Mastering (Instance J)

### Week 7-8: Integration & Polish
- ⏳ Cloud Storage (Instance K)
- ⏳ Integration Testing (Instance L)
- ⏳ Performance optimization
- ⏳ Production deployment

---

## 🤝 Contributing

### Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

Examples:
feat(audio-engine): add multi-track recording
fix(design-system): correct button focus state
docs(midi-editor): add usage examples
test(effects): add compressor unit tests
```

### Pull Request Process

1. Create feature branch from `main`
2. Make changes in your worktree
3. Write tests (aim for >80% coverage)
4. Run `pnpm lint` and `pnpm typecheck`
5. Create PR with descriptive title and body
6. Wait for CI checks to pass
7. Request review from team

---

## 📊 Performance Targets

| Metric | Target | Status |
|--------|--------|--------|
| Audio Latency | <10ms | 🎯 |
| UI Frame Rate | 60 FPS | 🎯 |
| Initial Load | <2s | 🎯 |
| Memory Usage | <1GB | 🎯 |
| Code Coverage | >80% | 🎯 |
| Lighthouse Score | >90 | 🎯 |

---

## 🔐 Environment Variables

Copy `.env.example` to `.env.local` and configure:

### Required
- `ANTHROPIC_API_KEY` - Claude API for AI features
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Authentication secret

### Optional
- `DEEPGRAM_API_KEY` - Speech-to-text
- `ELEVENLABS_API_KEY` - Text-to-speech
- `SUPABASE_URL` + `SUPABASE_KEY` - Cloud storage
- `SENTRY_DSN` - Error tracking

---

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run specific test suites
pnpm test:unit                # Unit tests
pnpm test:integration         # Integration tests
pnpm test:e2e                 # End-to-end tests

# Watch mode during development
pnpm test:watch

# Generate coverage report
pnpm test:coverage
```

---

## 🚀 Deployment

### Staging

```bash
git push origin main
# Automatic deployment to Vercel staging
```

### Production

```bash
git tag v1.0.0
git push origin v1.0.0
# Automatic deployment to production
```

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/dawg-ai/dawg-ai/issues)
- **Discussions**: [GitHub Discussions](https://github.com/dawg-ai/dawg-ai/discussions)
- **Email**: dev@dawg.ai

---

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details

---

## 🎵 Let's Build the Future of Music Production!

**Made with ❤️ by the DAWG AI Team**

---

_For detailed module-specific development instructions, see the [Complete Prompts Library](./DAWG_AI_COMPLETE_PROMPTS.md)_
