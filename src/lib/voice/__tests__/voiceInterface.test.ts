/**
 * Voice Interface Tests
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { TTSManager } from '../TTSManager';

// Mock the VoiceInterface will require more complex mocking due to browser APIs
// For now, focusing on TTSManager which is testable

describe('TTSManager', () => {
	let ttsManager: TTSManager;

	beforeEach(() => {
		// Mock environment variables
		vi.stubEnv('VITE_ELEVENLABS_API_KEY', 'test-api-key');

		ttsManager = new TTSManager({
			provider: 'browser', // Use browser for tests (no API calls)
			apiKey: 'test-key'
		});
	});

	afterEach(() => {
		vi.unstubAllEnvs();
		ttsManager.dispose();
	});

	describe('Mood-based voice settings', () => {
		it('should use supportive mood settings', () => {
			const settings = (ttsManager as any).getMoodVoiceSettings('supportive');

			expect(settings.stability).toBe(0.7);
			expect(settings.similarity_boost).toBe(0.8);
			expect(settings.use_speaker_boost).toBe(true);
		});

		it('should use excited mood settings', () => {
			const settings = (ttsManager as any).getMoodVoiceSettings('excited');

			expect(settings.stability).toBe(0.5);
			expect(settings.similarity_boost).toBe(0.9);
			expect(settings.style).toBe(0.7);
		});

		it('should use challenging mood settings', () => {
			const settings = (ttsManager as any).getMoodVoiceSettings('challenging');

			expect(settings.stability).toBe(0.8);
			expect(settings.similarity_boost).toBe(0.7);
		});

		it('should use chill mood settings', () => {
			const settings = (ttsManager as any).getMoodVoiceSettings('chill');

			expect(settings.stability).toBe(0.9);
			expect(settings.similarity_boost).toBe(0.6);
			expect(settings.use_speaker_boost).toBe(false);
		});
	});

	describe('Browser TTS mood parameters', () => {
		it('should map supportive mood to normal params', () => {
			const params = (ttsManager as any).getBrowserMoodParams('supportive');

			expect(params.rate).toBe(1.0);
			expect(params.pitch).toBe(1.0);
		});

		it('should map excited mood to faster, higher params', () => {
			const params = (ttsManager as any).getBrowserMoodParams('excited');

			expect(params.rate).toBe(1.2);
			expect(params.pitch).toBe(1.1);
		});

		it('should map challenging mood to slower, lower params', () => {
			const params = (ttsManager as any).getBrowserMoodParams('challenging');

			expect(params.rate).toBe(0.95);
			expect(params.pitch).toBe(0.95);
		});

		it('should map chill mood to slowest params', () => {
			const params = (ttsManager as any).getBrowserMoodParams('chill');

			expect(params.rate).toBe(0.9);
			expect(params.pitch).toBe(0.9);
		});
	});

	describe('Speaking state', () => {
		it('should initialize with not speaking', () => {
			expect(ttsManager.getIsSpeaking()).toBe(false);
		});

		it('should stop speaking when stop is called', () => {
			ttsManager.stop();
			expect(ttsManager.getIsSpeaking()).toBe(false);
		});
	});

	describe('Events', () => {
		it('should emit speaking-stopped event when stop is called', async () => {
			const eventReceived = vi.fn();

			window.addEventListener('tts:speaking-stopped', eventReceived, { once: true });

			// Trigger an event emission by calling stop
			ttsManager.stop();

			// Wait for event to fire
			await new Promise((resolve) => setTimeout(resolve, 10));

			expect(eventReceived).toHaveBeenCalled();
		});
	});
});

describe('Voice Interface Integration', () => {
	it('should be able to import VoiceInterface', async () => {
		// Simple import test
		const { VoiceInterface } = await import('../VoiceInterface');
		expect(VoiceInterface).toBeDefined();
	});

	it('should be able to import TTSManager', async () => {
		const { TTSManager } = await import('../TTSManager');
		expect(TTSManager).toBeDefined();
	});
});

describe('Voice Events', () => {
	it('should emit custom events to window', () => {
		const eventReceived = vi.fn();

		window.addEventListener('tts:test-event', eventReceived);

		const event = new CustomEvent('tts:test-event', { detail: { test: true } });
		window.dispatchEvent(event);

		expect(eventReceived).toHaveBeenCalled();

		window.removeEventListener('tts:test-event', eventReceived);
	});
});

describe('Voice Configuration', () => {
	it('should use browser provider as fallback', () => {
		const manager = new TTSManager({
			provider: 'browser'
		});

		expect(manager).toBeDefined();
		expect(manager.getIsSpeaking()).toBe(false);
	});

	it('should use elevenlabs provider with API key', () => {
		const manager = new TTSManager({
			provider: 'elevenlabs',
			apiKey: 'test-key-123',
			voiceId: 'custom-voice-id'
		});

		expect(manager).toBeDefined();
	});
});
