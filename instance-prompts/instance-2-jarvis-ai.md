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

