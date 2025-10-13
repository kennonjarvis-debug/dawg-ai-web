/**
 * @package @dawg-ai/event-bus
 * @description Typed event bus with multi-transport support
 * @owner Jerry (AI Conductor)
 */

import crypto from 'crypto';
import {
  type EventEnvelope,
  type EventTopic,
  type EventPayloadMap,
  validateEventPayload,
  validateEnv,
} from '@dawg-ai/types';
import type { Transport } from './transports/types';
import { NatsTransport } from './transports/nats';
import { RedisTransport } from './transports/redis';

export interface EventBusConfig {
  mode: 'nats' | 'redis' | 'gitops' | 'test';
  agentName: string;
  natsUrl?: string;
  redisUrl?: string;
  signingSecret?: string;
}

type EventHandler<T = any> = (envelope: EventEnvelope<T>) => void | Promise<void>;

export class EventBus {
  private transport: Transport;
  private config: EventBusConfig;
  private handlers = new Map<string, Set<EventHandler>>();
  private signingSecret: string;

  constructor(config?: Partial<EventBusConfig>) {
    const env = validateEnv();

    const mode = (config?.mode || env.EVENT_BUS_MODE || 'gitops') as 'nats' | 'redis' | 'gitops' | 'test';
    const agentName: string = String(config?.agentName || env.EVENT_BUS_AGENT_NAME || 'unknown-agent');
    const natsUrl: string | undefined = typeof config?.natsUrl === 'string' ? config.natsUrl : typeof env.NATS_URL === 'string' ? env.NATS_URL : undefined;
    const redisUrl: string | undefined = typeof config?.redisUrl === 'string' ? config.redisUrl : typeof env.REDIS_URL === 'string' ? env.REDIS_URL : undefined;
    const signingSecret: string | undefined = typeof config?.signingSecret === 'string' ? config.signingSecret : typeof env.NEXTAUTH_SECRET === 'string' ? env.NEXTAUTH_SECRET : undefined;

    this.config = {
      mode,
      agentName,
      natsUrl,
      redisUrl,
      signingSecret,
    };

    this.signingSecret = this.config.signingSecret || 'default-secret';

    // Initialize transport based on mode
    this.transport = this.createTransport();
  }

  private createTransport(): Transport {
    switch (this.config.mode) {
      case 'nats':
        if (!this.config.natsUrl) {
          throw new Error('[EventBus] NATS_URL is required for NATS mode');
        }
        return new NatsTransport({
          url: this.config.natsUrl,
          agentName: this.config.agentName,
        });

      case 'redis':
        if (!this.config.redisUrl) {
          throw new Error('[EventBus] REDIS_URL is required for Redis mode');
        }
        return new RedisTransport({
          url: this.config.redisUrl,
          agentName: this.config.agentName,
        });

      default:
        throw new Error(`[EventBus] Unsupported mode: ${this.config.mode}`);
    }
  }

  async connect(): Promise<void> {
    await this.transport.connect();
    console.log(`[EventBus] Connected (mode: ${this.config.mode}, agent: ${this.config.agentName})`);
  }

  async disconnect(): Promise<void> {
    await this.transport.disconnect();
    this.handlers.clear();
    console.log('[EventBus] Disconnected');
  }

  /**
   * Publish an event with type-safe payload
   */
  async publish<T extends EventTopic>(
    topic: T,
    payload: EventPayloadMap[T],
    options?: {
      traceId?: string;
      skipValidation?: boolean;
    }
  ): Promise<void> {
    // Validate payload against schema (unless skipped)
    if (!options?.skipValidation) {
      validateEventPayload(topic, payload);
    }

    const envelope: EventEnvelope<EventPayloadMap[T]> = {
      event: topic,
      version: 'v1',
      id: this.generateId(),
      trace_id: options?.traceId || this.generateTraceId(),
      producer: this.config.agentName,
      ts: new Date().toISOString(),
      signature: this.signPayload(payload),
      payload,
    };

    await this.transport.publish(topic, envelope);

    // Trigger local handlers (for same-process subscribers)
    this.triggerHandlers(topic, envelope);
  }

  /**
   * Subscribe to an event with type-safe handler
   */
  subscribe<T extends EventTopic>(
    topic: T,
    handler: (envelope: EventEnvelope<EventPayloadMap[T]>) => void | Promise<void>
  ): void {
    if (!this.handlers.has(topic)) {
      this.handlers.set(topic, new Set());

      // Register with transport (only once per topic)
      this.transport.subscribe(topic, (envelope) => {
        this.triggerHandlers(topic, envelope);
      });
    }

    this.handlers.get(topic)!.add(handler as EventHandler);
    console.log(`[EventBus] Subscribed to ${topic} (${this.handlers.get(topic)!.size} handlers)`);
  }

  /**
   * Unsubscribe from an event
   */
  async unsubscribe<T extends EventTopic>(
    topic: T,
    handler?: (envelope: EventEnvelope<EventPayloadMap[T]>) => void | Promise<void>
  ): Promise<void> {
    const topicHandlers = this.handlers.get(topic);
    if (!topicHandlers) {
      return;
    }

    if (handler) {
      // Remove specific handler
      topicHandlers.delete(handler as EventHandler);
      console.log(`[EventBus] Unsubscribed handler from ${topic}`);

      // If no more handlers, unsubscribe from transport
      if (topicHandlers.size === 0) {
        await this.transport.unsubscribe(topic);
        this.handlers.delete(topic);
      }
    } else {
      // Remove all handlers for this topic
      await this.transport.unsubscribe(topic);
      this.handlers.delete(topic);
      console.log(`[EventBus] Unsubscribed all handlers from ${topic}`);
    }
  }

  /**
   * Trigger all handlers for a topic
   */
  private triggerHandlers<T = any>(topic: string, envelope: EventEnvelope<T>): void {
    const topicHandlers = this.handlers.get(topic);
    if (!topicHandlers || topicHandlers.size === 0) {
      return;
    }

    for (const handler of topicHandlers) {
      try {
        const result = handler(envelope);
        if (result instanceof Promise) {
          result.catch((error) => {
            console.error(`[EventBus] Handler error for ${topic}:`, error);
          });
        }
      } catch (error) {
        console.error(`[EventBus] Handler error for ${topic}:`, error);
      }
    }
  }

  /**
   * Wait for a specific event (useful for testing)
   */
  async waitForEvent<T extends EventTopic>(
    topic: T,
    timeoutMs: number = 5000
  ): Promise<EventEnvelope<EventPayloadMap[T]>> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.unsubscribe(topic, handler);
        reject(new Error(`[EventBus] Timeout waiting for ${topic}`));
      }, timeoutMs);

      const handler = (envelope: EventEnvelope<EventPayloadMap[T]>) => {
        clearTimeout(timeout);
        this.unsubscribe(topic, handler);
        resolve(envelope);
      };

      this.subscribe(topic, handler);
    });
  }

  /**
   * Generate unique event ID (ULID-like)
   */
  private generateId(): string {
    const timestamp = Date.now().toString(36);
    const randomPart = crypto.randomBytes(8).toString('hex');
    return `evt_${timestamp}_${randomPart}`;
  }

  /**
   * Generate trace ID for request correlation
   */
  private generateTraceId(): string {
    const timestamp = Date.now().toString(36);
    const randomPart = crypto.randomBytes(8).toString('hex');
    return `tr_${timestamp}_${randomPart}`;
  }

  /**
   * Sign payload using HMAC-SHA256
   */
  private signPayload(payload: any): string {
    const message = JSON.stringify(payload);
    const hmac = crypto.createHmac('sha256', this.signingSecret);
    hmac.update(message);
    return hmac.digest('hex');
  }

  /**
   * Verify payload signature
   */
  verifySignature(payload: any, signature: string): boolean {
    const expectedSignature = this.signPayload(payload);
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  }

  /**
   * Get connection status
   */
  isConnected(): boolean {
    return this.transport.isConnected();
  }

  /**
   * Get current config
   */
  getConfig(): EventBusConfig {
    return { ...this.config };
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let globalEventBus: EventBus | null = null;

export function getEventBus(config?: Partial<EventBusConfig>): EventBus {
  if (!globalEventBus) {
    globalEventBus = new EventBus(config);
  }
  return globalEventBus;
}

export function resetEventBus(): void {
  if (globalEventBus) {
    globalEventBus.disconnect();
    globalEventBus = null;
  }
}
