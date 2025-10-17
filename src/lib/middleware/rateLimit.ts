/**
 * Rate Limiting Middleware
 *
 * Protects API endpoints from abuse by limiting requests per IP address
 *
 * Usage in +server.ts:
 * ```typescript
 * import { rateLimit } from '$lib/middleware/rateLimit';
 *
 * export async function POST({ request, getClientAddress }) {
 *   const clientIp = getClientAddress();
 *   rateLimit(clientIp, 50, 60000); // 50 requests per minute
 *
 *   // ... rest of handler
 * }
 * ```
 */

import { error } from '@sveltejs/kit';

interface RateLimitRecord {
  count: number;
  resetAt: number;
  firstRequestAt: number;
}

// In-memory store (consider Redis for production multi-instance deployments)
const rateLimitStore = new Map<string, RateLimitRecord>();

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetAt) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Rate limit a request by identifier (usually IP address)
 *
 * @param identifier - Unique identifier (e.g., IP address, user ID)
 * @param maxRequests - Maximum requests allowed in the window (default: 100)
 * @param windowMs - Time window in milliseconds (default: 60000 = 1 minute)
 * @throws {Error} 429 Too Many Requests if limit exceeded
 * @returns Object with rate limit info
 */
export function rateLimit(
  identifier: string,
  maxRequests: number = 100,
  windowMs: number = 60000
): {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfter?: number;
} {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  // No existing record or window expired - create new
  if (!record || now > record.resetAt) {
    const newRecord: RateLimitRecord = {
      count: 1,
      resetAt: now + windowMs,
      firstRequestAt: now,
    };
    rateLimitStore.set(identifier, newRecord);

    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetAt: newRecord.resetAt,
    };
  }

  // Existing record - check if limit exceeded
  if (record.count >= maxRequests) {
    const retryAfter = Math.ceil((record.resetAt - now) / 1000); // seconds

    throw error(429, {
      message: 'Too many requests. Please try again later.',
      retryAfter,
      limit: maxRequests,
      windowMs,
    });
  }

  // Increment count
  record.count++;

  return {
    allowed: true,
    remaining: maxRequests - record.count,
    resetAt: record.resetAt,
  };
}

/**
 * Get rate limit status without incrementing counter
 * Useful for checking limits without consuming a request
 */
export function checkRateLimit(
  identifier: string,
  maxRequests: number = 100,
  windowMs: number = 60000
): {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  current: number;
} {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  if (!record || now > record.resetAt) {
    return {
      allowed: true,
      remaining: maxRequests,
      resetAt: now + windowMs,
      current: 0,
    };
  }

  return {
    allowed: record.count < maxRequests,
    remaining: Math.max(0, maxRequests - record.count),
    resetAt: record.resetAt,
    current: record.count,
  };
}

/**
 * Reset rate limit for a specific identifier
 * Useful for testing or manual override
 */
export function resetRateLimit(identifier: string): void {
  rateLimitStore.delete(identifier);
}

/**
 * Get current size of rate limit store (for monitoring)
 */
export function getRateLimitStoreSize(): number {
  return rateLimitStore.size;
}

/**
 * Tiered rate limiting with different limits based on endpoint criticality
 */
export const RATE_LIMITS = {
  // Authentication endpoints - strict
  auth: {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
  },

  // AI endpoints - moderate (to control costs)
  ai: {
    maxRequests: 50,
    windowMs: 60 * 1000, // 1 minute
  },

  // Audio upload - moderate
  upload: {
    maxRequests: 10,
    windowMs: 60 * 1000, // 1 minute
  },

  // General API - lenient
  api: {
    maxRequests: 100,
    windowMs: 60 * 1000, // 1 minute
  },

  // Public read-only - very lenient
  public: {
    maxRequests: 200,
    windowMs: 60 * 1000, // 1 minute
  },
} as const;

/**
 * Helper to apply tiered rate limiting
 *
 * @example
 * ```typescript
 * export async function POST({ getClientAddress }) {
 *   applyTieredRateLimit(getClientAddress(), 'ai');
 *   // ... handler
 * }
 * ```
 */
export function applyTieredRateLimit(
  identifier: string,
  tier: keyof typeof RATE_LIMITS
): ReturnType<typeof rateLimit> {
  const { maxRequests, windowMs } = RATE_LIMITS[tier];
  return rateLimit(identifier, maxRequests, windowMs);
}
