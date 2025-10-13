/**
 * @package @dawg-ai/event-bus
 * @description Transport interface and types
 * @owner Jerry (AI Conductor)
 */

import type { EventEnvelope, EventTopic } from '@dawg-ai/types';

export interface TransportConfig {
  agentName: string;
}

export interface Transport {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  publish<T = any>(topic: EventTopic, envelope: EventEnvelope<T>): Promise<void>;
  subscribe<T = any>(
    topic: EventTopic,
    handler: (envelope: EventEnvelope<T>) => void | Promise<void>
  ): Promise<void>;
  unsubscribe(topic: EventTopic): Promise<void>;
  isConnected(): boolean;
}
