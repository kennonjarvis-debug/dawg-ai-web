/**
 * @package @dawg-ai/types
 * @description Environment variable validation using Zod
 * @owner Jerry (AI Conductor)
 */

import { z } from 'zod';

// ============================================================================
// Environment Schema
// ============================================================================

export const EnvSchema = z.object({
  // Node environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Application
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  PORT: z.coerce.number().default(3000),

  // Event Bus Transport
  EVENT_BUS_MODE: z.enum(['nats', 'redis', 'gitops', 'test']).default('gitops'),
  NATS_URL: z.string().url().optional(),
  REDIS_URL: z.string().url().optional(),
  EVENT_BUS_AGENT_NAME: z.string().optional(),

  // Database
  DATABASE_URL: z.string().url().optional(),

  // S3 Storage
  S3_BUCKET: z.string().optional(),
  S3_REGION: z.string().default('us-east-1'),
  S3_ACCESS_KEY: z.string().optional(),
  S3_SECRET_KEY: z.string().optional(),

  // AI Services
  ANTHROPIC_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),

  // Audio Services
  ELEVENLABS_API_KEY: z.string().optional(),

  // Authentication
  NEXTAUTH_SECRET: z.string().optional(),
  NEXTAUTH_URL: z.string().url().optional(),

  // Feature Flags
  ENABLE_VOICE_INTERFACE: z.coerce.boolean().default(false),
  ENABLE_METRICS_COLLECTION: z.coerce.boolean().default(true),
  ENABLE_AGENT_COORDINATION: z.coerce.boolean().default(true),

  // Monitoring
  SENTRY_DSN: z.string().url().optional(),
  SENTRY_ENVIRONMENT: z.string().optional(),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

export type Env = z.infer<typeof EnvSchema>;

// ============================================================================
// Validation Function
// ============================================================================

let cachedEnv: Env | null = null;

export function validateEnv(): Env {
  if (cachedEnv) {
    return cachedEnv;
  }

  try {
    cachedEnv = EnvSchema.parse(process.env);
    return cachedEnv;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formattedErrors = error.issues.map((err) => {
        return `  - ${err.path.join('.')}: ${err.message}`;
      });

      throw new Error(
        `Environment validation failed:\n${formattedErrors.join('\n')}`
      );
    }
    throw error;
  }
}

// ============================================================================
// Runtime Environment Checks
// ============================================================================

export function requireEnvVar(key: keyof Env, customMessage?: string): string {
  const env = validateEnv();
  const value = env[key];

  if (value === undefined || value === null || value === '') {
    throw new Error(
      customMessage || `Required environment variable ${key} is not set`
    );
  }

  return String(value);
}

export function getEnvVar(key: keyof Env, fallback?: string): string | undefined {
  const env = validateEnv();
  const value = env[key];
  return value !== undefined && value !== null ? String(value) : fallback;
}

// ============================================================================
// Environment Type Guards
// ============================================================================

export function isProduction(): boolean {
  return validateEnv().NODE_ENV === 'production';
}

export function isDevelopment(): boolean {
  return validateEnv().NODE_ENV === 'development';
}

export function isTest(): boolean {
  return validateEnv().NODE_ENV === 'test';
}

// ============================================================================
// Event Bus Config Helpers
// ============================================================================

export function getEventBusConfig() {
  const env = validateEnv();

  return {
    mode: env.EVENT_BUS_MODE,
    natsUrl: env.NATS_URL,
    redisUrl: env.REDIS_URL,
    agentName: env.EVENT_BUS_AGENT_NAME || 'unknown-agent',
  };
}

// ============================================================================
// Database Config Helpers
// ============================================================================

export function getDatabaseConfig() {
  const env = validateEnv();

  if (!env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required for database operations');
  }

  return {
    url: env.DATABASE_URL,
  };
}

// ============================================================================
// S3 Config Helpers
// ============================================================================

export function getS3Config() {
  const env = validateEnv();

  if (!env.S3_BUCKET || !env.S3_ACCESS_KEY || !env.S3_SECRET_KEY) {
    throw new Error('S3_BUCKET, S3_ACCESS_KEY, and S3_SECRET_KEY are required for S3 operations');
  }

  return {
    bucket: env.S3_BUCKET,
    region: env.S3_REGION,
    accessKeyId: env.S3_ACCESS_KEY,
    secretAccessKey: env.S3_SECRET_KEY,
  };
}

// ============================================================================
// AI Services Config Helpers
// ============================================================================

export function getAnthropicConfig() {
  const env = validateEnv();

  if (!env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is required for Claude API operations');
  }

  return {
    apiKey: env.ANTHROPIC_API_KEY,
  };
}

export function getOpenAIConfig() {
  const env = validateEnv();

  if (!env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is required for OpenAI operations');
  }

  return {
    apiKey: env.OPENAI_API_KEY,
  };
}
