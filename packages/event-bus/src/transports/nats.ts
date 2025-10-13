/**
 * @package @dawg-ai/event-bus
 * @description NATS transport implementation
 * @owner Jerry (AI Conductor)
 */

import { connect, type NatsConnection, type Subscription, StringCodec } from 'nats';
import type { EventEnvelope, EventTopic } from '@dawg-ai/types';
import type { Transport, TransportConfig } from './types';

export interface NatsTransportConfig extends TransportConfig {
  url: string;
  reconnect?: boolean;
  maxReconnectAttempts?: number;
}

export class NatsTransport implements Transport {
  private connection: NatsConnection | null = null;
  private subscriptions = new Map<string, Subscription>();
  private codec = StringCodec();
  private config: NatsTransportConfig;

  constructor(config: NatsTransportConfig) {
    this.config = {
      reconnect: true,
      maxReconnectAttempts: 10,
      ...config,
    };
  }

  async connect(): Promise<void> {
    try {
      this.connection = await connect({
        servers: this.config.url,
        reconnect: this.config.reconnect,
        maxReconnectAttempts: this.config.maxReconnectAttempts,
      });

      console.log(`[NatsTransport] Connected to NATS at ${this.config.url}`);
    } catch (error) {
      console.error('[NatsTransport] Connection failed:', error);
      throw new Error(`Failed to connect to NATS: ${error}`);
    }
  }

  async disconnect(): Promise<void> {
    // Close all subscriptions
    for (const [topic, subscription] of this.subscriptions.entries()) {
      try {
        await subscription.drain();
        console.log(`[NatsTransport] Unsubscribed from ${topic}`);
      } catch (error) {
        console.error(`[NatsTransport] Failed to unsubscribe from ${topic}:`, error);
      }
    }
    this.subscriptions.clear();

    // Close connection
    if (this.connection) {
      try {
        await this.connection.drain();
        console.log('[NatsTransport] Disconnected from NATS');
      } catch (error) {
        console.error('[NatsTransport] Disconnect error:', error);
      }
      this.connection = null;
    }
  }

  async publish<T = any>(topic: EventTopic, envelope: EventEnvelope<T>): Promise<void> {
    if (!this.connection) {
      throw new Error('[NatsTransport] Not connected to NATS');
    }

    try {
      const message = JSON.stringify(envelope);
      this.connection.publish(topic, this.codec.encode(message));
      console.log(`[NatsTransport] Published to ${topic}`);
    } catch (error) {
      console.error(`[NatsTransport] Failed to publish to ${topic}:`, error);
      throw error;
    }
  }

  async subscribe<T = any>(
    topic: EventTopic,
    handler: (envelope: EventEnvelope<T>) => void | Promise<void>
  ): Promise<void> {
    if (!this.connection) {
      throw new Error('[NatsTransport] Not connected to NATS');
    }

    // Check if already subscribed
    if (this.subscriptions.has(topic)) {
      console.warn(`[NatsTransport] Already subscribed to ${topic}`);
      return;
    }

    try {
      const subscription = this.connection.subscribe(topic);
      this.subscriptions.set(topic, subscription);

      // Process messages asynchronously
      (async () => {
        for await (const msg of subscription) {
          try {
            const data = this.codec.decode(msg.data);
            const envelope = JSON.parse(data) as EventEnvelope<T>;
            await handler(envelope);
          } catch (error) {
            console.error(`[NatsTransport] Error processing message on ${topic}:`, error);
          }
        }
      })();

      console.log(`[NatsTransport] Subscribed to ${topic}`);
    } catch (error) {
      console.error(`[NatsTransport] Failed to subscribe to ${topic}:`, error);
      throw error;
    }
  }

  async unsubscribe(topic: EventTopic): Promise<void> {
    const subscription = this.subscriptions.get(topic);
    if (!subscription) {
      console.warn(`[NatsTransport] Not subscribed to ${topic}`);
      return;
    }

    try {
      await subscription.drain();
      this.subscriptions.delete(topic);
      console.log(`[NatsTransport] Unsubscribed from ${topic}`);
    } catch (error) {
      console.error(`[NatsTransport] Failed to unsubscribe from ${topic}:`, error);
      throw error;
    }
  }

  isConnected(): boolean {
    return this.connection !== null && !this.connection.isClosed();
  }
}
