<script lang="ts">
	/**
	 * Voice Control Component
	 * Module 6: Voice Interface
	 *
	 * Floating voice control button with transcript display
	 */

	import { onMount, onDestroy } from 'svelte';
	import { VoiceInterface } from './VoiceInterface';

	let voiceInterface: VoiceInterface;
	let isListening = $state(false);
	let transcript = $state('');
	let interimTranscript = $state('');
	let isSpeaking = $state(false);
	let currentAction = $state('');
	let error = $state('');
	let isInitialized = $state(false);

	onMount(() => {
		try {
			voiceInterface = new VoiceInterface();
			isInitialized = true;

			// Event listeners
			window.addEventListener('voice:listening-started', handleListeningStarted as any);
			window.addEventListener('voice:listening-stopped', handleListeningStopped as any);
			window.addEventListener('voice:transcript', handleTranscript as any);
			window.addEventListener('voice:interim-transcript', handleInterimTranscript as any);
			window.addEventListener('voice:speaking', handleSpeaking as any);
			window.addEventListener('voice:speaking-done', handleSpeakingDone as any);
			window.addEventListener('voice:action-executed', handleActionExecuted as any);
			window.addEventListener('voice:error', handleError as any);
			window.addEventListener('voice:wake-word-detected', handleWakeWord as any);
		} catch (err: any) {
			console.error('Failed to initialize voice interface:', err);
			error = err.message || 'Failed to initialize voice interface';
		}
	});

	onDestroy(() => {
		voiceInterface?.dispose();
		window.removeEventListener('voice:listening-started', handleListeningStarted as any);
		window.removeEventListener('voice:listening-stopped', handleListeningStopped as any);
		window.removeEventListener('voice:transcript', handleTranscript as any);
		window.removeEventListener('voice:interim-transcript', handleInterimTranscript as any);
		window.removeEventListener('voice:speaking', handleSpeaking as any);
		window.removeEventListener('voice:speaking-done', handleSpeakingDone as any);
		window.removeEventListener('voice:action-executed', handleActionExecuted as any);
		window.removeEventListener('voice:error', handleError as any);
		window.removeEventListener('voice:wake-word-detected', handleWakeWord as any);
	});

	async function toggleListening() {
		if (!isInitialized) return;

		if (isListening) {
			voiceInterface.stopListening();
		} else {
			try {
				await voiceInterface.startListening();
			} catch (err: any) {
				error = err.message || 'Failed to start listening';
				setTimeout(() => (error = ''), 5000);
			}
		}
	}

	function handleListeningStarted() {
		isListening = true;
		error = '';
	}

	function handleListeningStopped() {
		isListening = false;
	}

	function handleTranscript(e: CustomEvent) {
		transcript = e.detail.transcript;
		interimTranscript = '';
	}

	function handleInterimTranscript(e: CustomEvent) {
		interimTranscript = e.detail.transcript;
	}

	function handleSpeaking(e: CustomEvent) {
		isSpeaking = true;
	}

	function handleSpeakingDone(e: CustomEvent) {
		isSpeaking = false;
	}

	function handleActionExecuted(e: CustomEvent) {
		currentAction = `Executed: ${e.detail.action}`;
		setTimeout(() => (currentAction = ''), 3000);
	}

	function handleError(e: CustomEvent) {
		console.error('Voice error:', e.detail.error);
		error = 'Voice error occurred';
		setTimeout(() => (error = ''), 5000);
	}

	function handleWakeWord(e: CustomEvent) {
		console.log('Wake word detected:', e.detail.transcript);
	}

	function resetConversation() {
		voiceInterface?.resetConversation();
		transcript = '';
		interimTranscript = '';
		currentAction = '';
	}
</script>

<div class="voice-control">
	<button
		class="voice-button"
		class:listening={isListening}
		class:speaking={isSpeaking}
		class:disabled={!isInitialized}
		onclick={toggleListening}
		title={isListening ? 'Stop listening' : 'Start voice control'}
		disabled={!isInitialized}
	>
		{#if isListening}
			<span class="icon">🎤</span>
			<span class="pulse"></span>
		{:else}
			<span class="icon">🎤</span>
		{/if}
	</button>

	{#if error}
		<div class="error-display">
			<p class="error">❌ {error}</p>
		</div>
	{/if}

	{#if isListening || transcript}
		<div class="transcript-display">
			<div class="header">
				<h4>Voice Command</h4>
				<button class="reset-btn" onclick={resetConversation} title="Reset conversation">🔄</button>
			</div>

			{#if interimTranscript}
				<p class="interim">{interimTranscript}</p>
			{/if}
			{#if transcript}
				<p class="final">{transcript}</p>
			{/if}
			{#if isSpeaking}
				<p class="response">🔊 DAWG AI is speaking...</p>
			{/if}
			{#if currentAction}
				<p class="action">✓ {currentAction}</p>
			{/if}
		</div>
	{/if}
</div>

<style>
	.voice-control {
		position: fixed;
		bottom: 24px;
		right: 24px;
		z-index: 1000;
	}

	.voice-button {
		position: relative;
		width: 64px;
		height: 64px;
		border-radius: 50%;
		background: var(--color-accent-primary, #00d9ff);
		border: none;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.3s ease;
		box-shadow: 0 4px 12px rgba(0, 217, 255, 0.3);
	}

	.voice-button:hover:not(:disabled) {
		transform: scale(1.1);
		box-shadow: 0 6px 16px rgba(0, 217, 255, 0.5);
	}

	.voice-button.listening {
		background: #ff006e;
		box-shadow: 0 4px 12px rgba(255, 0, 110, 0.3);
	}

	.voice-button.speaking {
		animation: pulse 1s infinite;
	}

	.voice-button.disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.icon {
		font-size: 32px;
	}

	.pulse {
		position: absolute;
		width: 100%;
		height: 100%;
		border-radius: 50%;
		background: inherit;
		opacity: 0.5;
		animation: pulse-ring 1.5s infinite;
	}

	@keyframes pulse-ring {
		0% {
			transform: scale(1);
			opacity: 0.5;
		}
		100% {
			transform: scale(1.5);
			opacity: 0;
		}
	}

	@keyframes pulse {
		0%,
		100% {
			transform: scale(1);
		}
		50% {
			transform: scale(1.05);
		}
	}

	.transcript-display {
		position: absolute;
		bottom: 80px;
		right: 0;
		width: 400px;
		max-height: 300px;
		overflow-y: auto;
		background: var(--color-surface, #1a1a1a);
		border: 1px solid var(--color-border, #333);
		border-radius: 12px;
		padding: 16px;
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.7);
	}

	.error-display {
		position: absolute;
		bottom: 80px;
		right: 0;
		width: 400px;
		background: var(--color-surface, #1a1a1a);
		border: 1px solid #ff3366;
		border-radius: 12px;
		padding: 16px;
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.7);
	}

	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 12px;
		padding-bottom: 8px;
		border-bottom: 1px solid var(--color-border, #333);
	}

	.header h4 {
		margin: 0;
		font-size: 14px;
		font-weight: 600;
		color: var(--color-text, #fff);
	}

	.reset-btn {
		background: none;
		border: none;
		cursor: pointer;
		font-size: 18px;
		padding: 4px;
		opacity: 0.7;
		transition: opacity 0.2s;
	}

	.reset-btn:hover {
		opacity: 1;
	}

	.interim {
		color: var(--color-text-secondary, #999);
		font-style: italic;
		margin: 0 0 8px 0;
		font-size: 14px;
	}

	.final {
		color: var(--color-text, #fff);
		font-weight: 600;
		margin: 0 0 8px 0;
		font-size: 14px;
	}

	.response {
		color: var(--color-accent-primary, #00d9ff);
		margin: 8px 0;
		font-size: 14px;
	}

	.action {
		color: var(--color-success, #00ff88);
		margin: 8px 0;
		font-size: 14px;
	}

	.error {
		color: #ff3366;
		margin: 0;
		font-size: 14px;
	}
</style>
