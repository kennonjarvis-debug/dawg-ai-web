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

