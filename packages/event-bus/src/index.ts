/**
 * @package @dawg-ai/event-bus
 * @description Typed event bus with NATS/Redis transport
 * @owner Jerry (AI Conductor)
 */

export { EventBus, getEventBus, resetEventBus } from './EventBus';
export type { EventBusConfig } from './EventBus';
export type { Transport, TransportConfig } from './transports/types';
export { NatsTransport } from './transports/nats';
export { RedisTransport } from './transports/redis';
