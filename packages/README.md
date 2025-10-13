# DAWG AI Packages

**Owner:** Jerry (AI Conductor)
**Version:** 2.0.0

## Overview

Monorepo workspace packages providing type-safe infrastructure for DAWG AI's event-driven architecture.

## Packages

### `@dawg-ai/types`

Single source of truth for all TypeScript types, Zod schemas, and environment validation.

**Exports:**
- `events.ts` - Event types + Zod schemas for all event topics
- `env.ts` - Environment variable validation with Zod
- All event payload types with compile-time safety

**Usage:**
```typescript
import { EventTopics, JourneyStartedPayload, validateEnv } from '@dawg-ai/types';

const env = validateEnv();
const payload: JourneyStartedPayload = { ... };
```

### `@dawg-ai/event-bus`

Typed event bus with NATS and Redis Streams transport.

**Features:**
- Type-safe publish/subscribe with payload validation
- NATS transport (pub/sub)
- Redis Streams transport (consumer groups)
- HMAC-SHA256 message signatures
- Automatic payload validation via Zod schemas

**Usage:**
```typescript
import { getEventBus, EventTopics } from '@dawg-ai/event-bus';

const bus = getEventBus({ mode: 'nats', agentName: 'jerry' });
await bus.connect();

// Type-safe publish
await bus.publish(EventTopics.JOURNEY_STARTED, {
  journey_id: 'jrn_123',
  user_id: 'usr_abc',
  journey_type: 'record_song',
  estimated_weeks: 4,
  difficulty: 'medium',
  vocal_profile: { ... }
});

// Type-safe subscribe
bus.subscribe(EventTopics.JOURNEY_STARTED, (envelope) => {
  console.log(envelope.payload.journey_id); // Typed!
});
```

## Project Structure

```
packages/
├── types/
│   ├── src/
│   │   ├── events.ts       # Event types + Zod schemas
│   │   ├── env.ts          # Environment validation
│   │   └── index.ts        # Re-exports
│   ├── package.json
│   └── tsconfig.json
└── event-bus/
    ├── src/
    │   ├── EventBus.ts     # Main event bus class
    │   ├── transports/
    │   │   ├── types.ts    # Transport interface
    │   │   ├── nats.ts     # NATS transport
    │   │   └── redis.ts    # Redis Streams transport
    │   └── index.ts        # Re-exports
    ├── package.json
    └── tsconfig.json
```

## TypeScript Configuration

### Root `tsconfig.base.json`

Base configuration inherited by all packages and the main app.

**Key settings:**
- Strict mode enabled
- Project references with composite builds
- Path aliases for `@dawg-ai/*` packages

### Package `tsconfig.json`

Each package extends `tsconfig.base.json` with:
- `composite: true` for project references
- `declaration: true` for type generation
- Package-specific includes/excludes

### Root `tsconfig.json`

Main app config extends base with:
- Next.js plugins
- References to all packages
- Excludes `packages/` from main build

## Build Process

```bash
# Build all packages (types → event-bus)
npm run build:packages

# Build specific package
npm run build --workspace=@dawg-ai/types

# Clean all build artifacts
npm run clean

# Type-check entire project (uses project references)
npm run type-check
```

## Development Workflow

### 1. Add new event type

Edit `packages/types/src/events.ts`:

```typescript
// 1. Define Zod schema
export const MyEventPayloadSchema = z.object({
  foo: z.string(),
  bar: z.number(),
});

// 2. Export TypeScript type
export type MyEventPayload = z.infer<typeof MyEventPayloadSchema>;

// 3. Add topic constant
export const EventTopics = {
  MY_EVENT: 'my.event',
  // ...
};

// 4. Add to payload map
export type EventPayloadMap = {
  [EventTopics.MY_EVENT]: MyEventPayload,
  // ...
};
```

Rebuild types package:
```bash
npm run build --workspace=@dawg-ai/types
```

### 2. Use new event in code

```typescript
import { getEventBus, EventTopics } from '@dawg-ai/event-bus';

const bus = getEventBus({ mode: 'nats', agentName: 'my-agent' });

// Payload is validated at runtime via Zod
await bus.publish(EventTopics.MY_EVENT, {
  foo: 'hello',
  bar: 42,
});
```

### 3. Add new env var

Edit `packages/types/src/env.ts`:

```typescript
export const EnvSchema = z.object({
  MY_NEW_VAR: z.string().optional(),
  // ...
});
```

Use in code:
```typescript
import { validateEnv, requireEnvVar } from '@dawg-ai/types';

const env = validateEnv();
const myVar = requireEnvVar('MY_NEW_VAR');
```

## Transport Configuration

### NATS

```bash
# Required env vars
EVENT_BUS_MODE=nats
NATS_URL=nats://localhost:4222
```

### Redis Streams

```bash
# Required env vars
EVENT_BUS_MODE=redis
REDIS_URL=redis://localhost:6379
```

## Event Bus Features

### Automatic Validation

All published events are validated against Zod schemas before sending:

```typescript
await bus.publish(EventTopics.JOURNEY_STARTED, {
  journey_id: 123, // ❌ Type error: expected string
  // ❌ Runtime error: Zod validation fails
});
```

### HMAC Signatures

All events are signed with HMAC-SHA256:

```typescript
const envelope = {
  event: 'journey.started',
  version: 'v1',
  id: 'evt_...',
  trace_id: 'tr_...',
  producer: 'jerry',
  ts: '2025-10-03T06:00:00.000Z',
  signature: 'abc123...', // HMAC-SHA256(payload)
  payload: { ... }
};
```

### Type-Safe Handlers

Handlers receive typed payloads:

```typescript
bus.subscribe(EventTopics.JOURNEY_STARTED, (envelope) => {
  // envelope.payload is typed as JourneyStartedPayload
  const { journey_id, user_id, difficulty } = envelope.payload;
});
```

## Migration from Old EventBus

Old code (GitOps mode):
```typescript
import { getEventBus } from '@/src/core/eventBus';

const bus = getEventBus({ mode: 'gitops', agentName: 'jerry' });
await bus.publish('journey.started', payload); // Untyped
```

New code (typed packages):
```typescript
import { getEventBus, EventTopics } from '@dawg-ai/event-bus';

const bus = getEventBus({ mode: 'nats', agentName: 'jerry' });
await bus.publish(EventTopics.JOURNEY_STARTED, payload); // Typed!
```

## Troubleshooting

### "Module not found: @dawg-ai/types"

Run `npm install` to symlink workspace packages:
```bash
npm install
```

### Type errors after adding new event

Rebuild packages:
```bash
npm run build:packages
```

### Zod validation errors

Check payload matches schema in `packages/types/src/events.ts`:
```bash
# Enable debug logging
LOG_LEVEL=debug npm run dev
```

## Contributing

1. Add types to `@dawg-ai/types` first
2. Use types in `@dawg-ai/event-bus` or main app
3. Rebuild packages before testing
4. Update this README if adding major features

---

**Last Updated:** 2025-10-03
**Plan Version:** v2.0.0
