# Middleware

Security and utility middleware for SvelteKit API routes.

## Rate Limiting

Protects API endpoints from abuse by limiting requests per IP address.

### Basic Usage

```typescript
// src/routes/api/chat/+server.ts
import { rateLimit } from '$lib/middleware/rateLimit';

export async function POST({ request, getClientAddress }) {
  const clientIp = getClientAddress();

  // 50 requests per minute
  rateLimit(clientIp, 50, 60000);

  // ... rest of handler
}
```

### Tiered Rate Limiting

```typescript
import { applyTieredRateLimit } from '$lib/middleware/rateLimit';

export async function POST({ getClientAddress }) {
  // Use predefined tier
  applyTieredRateLimit(getClientAddress(), 'ai');

  // ... handler
}
```

### Available Tiers

| Tier | Max Requests | Window | Use Case |
|------|--------------|--------|----------|
| `auth` | 5 | 15 min | Login, signup |
| `ai` | 50 | 1 min | AI API calls |
| `upload` | 10 | 1 min | File uploads |
| `api` | 100 | 1 min | General API |
| `public` | 200 | 1 min | Public read-only |

### Check Limit Without Consuming

```typescript
import { checkRateLimit } from '$lib/middleware/rateLimit';

const status = checkRateLimit(clientIp, 50, 60000);
console.log(`Remaining: ${status.remaining}`);
```

### Response Headers

When rate limited, returns 429 with:

```json
{
  "message": "Too many requests. Please try again later.",
  "retryAfter": 45,
  "limit": 50,
  "windowMs": 60000
}
```

### Production Considerations

**Current**: In-memory store (single instance)

**For multi-instance deployments**, replace with Redis:

```typescript
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

async function rateLimit(identifier: string, maxRequests: number, windowMs: number) {
  const key = `ratelimit:${identifier}`;
  const current = await redis.incr(key);

  if (current === 1) {
    await redis.expire(key, Math.ceil(windowMs / 1000));
  }

  if (current > maxRequests) {
    throw error(429, 'Too many requests');
  }

  return { allowed: true, remaining: maxRequests - current };
}
```

### Testing

```typescript
import { resetRateLimit } from '$lib/middleware/rateLimit';

// Reset for testing
resetRateLimit('192.168.1.1');
```

## Future Middleware

- **Authentication**: JWT validation
- **CORS**: Custom CORS headers
- **Logging**: Request/response logging
- **Validation**: Request body validation
