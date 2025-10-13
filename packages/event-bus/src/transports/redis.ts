/**
 * @package @dawg-ai/event-bus
 * @description Redis Streams transport implementation
 * @owner Jerry (AI Conductor)
 */

import { createClient, type RedisClientType } from 'redis';
import type { EventEnvelope, EventTopic } from '@dawg-ai/types';
import type { Transport, TransportConfig } from './types';

export interface RedisTransportConfig extends TransportConfig {
  url: string;
  consumerGroup?: string;
  consumerId?: string;
}

export class RedisTransport implements Transport {
  private publisher: RedisClientType | null = null;
  private subscriber: RedisClientType | null = null;
  private subscriptions = new Map<string, AbortController>();
  private config: RedisTransportConfig;

  constructor(config: RedisTransportConfig) {
    this.config = {
      consumerGroup: 'dawg-ai',
      consumerId: config.agentName || 'default-consumer',
      ...config,
    };
  }

  async connect(): Promise<void> {
    try {
      // Create publisher client
      this.publisher = createClient({ url: this.config.url });
      await this.publisher.connect();

      // Create subscriber client (separate connection for blocking reads)
      this.subscriber = createClient({ url: this.config.url });
      await this.subscriber.connect();

      console.log(`[RedisTransport] Connected to Redis at ${this.config.url}`);
    } catch (error) {
      console.error('[RedisTransport] Connection failed:', error);
      throw new Error(`Failed to connect to Redis: ${error}`);
    }
  }

  async disconnect(): Promise<void> {
    // Abort all subscriptions
    for (const [topic, controller] of this.subscriptions.entries()) {
      controller.abort();
      console.log(`[RedisTransport] Unsubscribed from ${topic}`);
    }
    this.subscriptions.clear();

    // Close connections
    if (this.publisher) {
      await this.publisher.quit();
      this.publisher = null;
    }
    if (this.subscriber) {
      await this.subscriber.quit();
      this.subscriber = null;
    }

    console.log('[RedisTransport] Disconnected from Redis');
  }

  async publish<T = any>(topic: EventTopic, envelope: EventEnvelope<T>): Promise<void> {
    if (!this.publisher) {
      throw new Error('[RedisTransport] Not connected to Redis');
    }

    try {
      const streamKey = `events:${topic}`;
      const message = JSON.stringify(envelope);

      await this.publisher.xAdd(streamKey, '*', {
        data: message,
        producer: this.config.agentName || 'unknown',
        timestamp: Date.now().toString(),
      });

      console.log(`[RedisTransport] Published to ${topic}`);
    } catch (error) {
      console.error(`[RedisTransport] Failed to publish to ${topic}:`, error);
      throw error;
    }
  }

  async subscribe<T = any>(
    topic: EventTopic,
    handler: (envelope: EventEnvelope<T>) => void | Promise<void>
  ): Promise<void> {
    if (!this.subscriber) {
      throw new Error('[RedisTransport] Not connected to Redis');
    }

    // Check if already subscribed
    if (this.subscriptions.has(topic)) {
      console.warn(`[RedisTransport] Already subscribed to ${topic}`);
      return;
    }

    const streamKey = `events:${topic}`;
    const consumerGroup = this.config.consumerGroup!;
    const consumerId = this.config.consumerId!;

    // Create consumer group if it doesn't exist
    try {
      await this.subscriber.xGroupCreate(streamKey, consumerGroup, '0', {
        MKSTREAM: true,
      });
    } catch (error: any) {
      // Ignore "BUSYGROUP Consumer Group name already exists" error
      if (!error.message?.includes('BUSYGROUP')) {
        console.error(`[RedisTransport] Failed to create consumer group:`, error);
      }
    }

    // Start consuming messages
    const controller = new AbortController();
    this.subscriptions.set(topic, controller);

    (async () => {
      let lastId = '>';

      while (!controller.signal.aborted) {
        try {
          const messages = await this.subscriber!.xReadGroup(
            consumerGroup,
            consumerId,
            [{ key: streamKey, id: lastId }],
            {
              COUNT: 10,
              BLOCK: 5000, // 5 second timeout
            }
          );

          if (!messages || messages.length === 0) {
            continue;
          }

          for (const stream of messages) {
            for (const message of stream.messages) {
              try {
                const data = message.message.data;
                if (typeof data === 'string') {
                  const envelope = JSON.parse(data) as EventEnvelope<T>;
                  await handler(envelope);

                  // Acknowledge message
                  await this.subscriber!.xAck(streamKey, consumerGroup, message.id);
                }
              } catch (error) {
                console.error(`[RedisTransport] Error processing message on ${topic}:`, error);
              }
            }
          }
        } catch (error: any) {
          if (controller.signal.aborted) {
            break;
          }
          console.error(`[RedisTransport] Error reading from ${topic}:`, error);
          // Wait before retrying
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }
    })();

    console.log(`[RedisTransport] Subscribed to ${topic}`);
  }

  async unsubscribe(topic: EventTopic): Promise<void> {
    const controller = this.subscriptions.get(topic);
    if (!controller) {
      console.warn(`[RedisTransport] Not subscribed to ${topic}`);
      return;
    }

    controller.abort();
    this.subscriptions.delete(topic);
    console.log(`[RedisTransport] Unsubscribed from ${topic}`);
  }

  isConnected(): boolean {
    return this.publisher?.isOpen === true && this.subscriber?.isOpen === true;
  }
}
