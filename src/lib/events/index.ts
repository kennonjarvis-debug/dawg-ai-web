/**
 * DAWG AI Event System
 * Centralized event bus with advanced patterns for cross-system communication
 * @module events
 */

// Core Event Bus
export {
	EventBus,
	eventBus,
	emit,
	on,
	once,
	off,
	type EventType,
	type EventData,
	type EventHandler
} from './eventBus';

// Advanced Patterns
export {
	RequestResponseBus,
	EventStore,
	PriorityEventBus,
	CircuitBreaker,
	requestResponseBus,
	eventStore,
	priorityEventBus,
	defaultCircuitBreaker,
	DEFAULT_CIRCUIT_BREAKER_CONFIG,
	type EventPriority,
	type EventFilter,
	type CircuitBreakerState,
	type CircuitBreakerConfig
} from './eventPatterns';

// Cross-System Communication
export {
	ServiceBridge,
	MessageQueueAdapter,
	WebSocketBridge,
	HTTPBridge,
	serviceBridge,
	messageQueue,
	wsBridge,
	type ServiceHandler,
	type Message
} from './crossSystem';
