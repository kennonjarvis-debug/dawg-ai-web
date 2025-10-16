<script lang="ts">
	/**
	 * Voice Interface Demo Page
	 * Module 6: Voice Interface Demo
	 */

	import VoiceControl from '$lib/voice/VoiceControl.svelte';
	import { Button } from '$lib/design-system';

	let showInstructions = $state(true);
</script>

<svelte:head>
	<title>Voice Interface Demo - DAWG AI</title>
</svelte:head>

<div class="min-h-screen p-8">
	<div class="mb-8">
		<h1
			class="text-4xl font-bold mb-2 bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent"
		>
			Voice Interface Demo
		</h1>
		<p class="text-white/70">Module 6: Conversational DAW Control</p>
	</div>

	{#if showInstructions}
		<div class="glass-strong rounded-panel p-8 mb-8">
			<h2 class="text-2xl font-bold mb-4">Getting Started</h2>

			<div class="mb-6">
				<h3 class="text-xl font-semibold mb-2">Setup Required:</h3>
				<p class="text-white/70 mb-4">
					Add these environment variables to your <code>.env</code> file:
				</p>
				<pre
					class="bg-black/50 p-4 rounded border border-white/10 overflow-x-auto"><code>VITE_DEEPGRAM_API_KEY=your_deepgram_api_key
VITE_ANTHROPIC_API_KEY=your_anthropic_api_key
VITE_ELEVENLABS_API_KEY=your_elevenlabs_api_key</code></pre>
			</div>

			<div class="mb-6">
				<h3 class="text-xl font-semibold mb-2">How to Use:</h3>
				<ol class="list-decimal list-inside space-y-2 text-white/70">
					<li>Click the floating microphone button (bottom right)</li>
					<li>Say the wake word: <strong>"Hey DAWG"</strong></li>
					<li>Give a voice command (see examples below)</li>
					<li>DAWG AI will execute the command and respond</li>
				</ol>
			</div>

			<div class="mb-6">
				<h3 class="text-xl font-semibold mb-2">Example Commands:</h3>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div class="bg-black/30 p-4 rounded">
						<h4 class="font-semibold mb-2 text-accent-primary">Playback</h4>
						<ul class="text-sm text-white/70 space-y-1">
							<li>"Play"</li>
							<li>"Stop playback"</li>
							<li>"Pause"</li>
							<li>"Start recording"</li>
						</ul>
					</div>

					<div class="bg-black/30 p-4 rounded">
						<h4 class="font-semibold mb-2 text-accent-primary">Track Management</h4>
						<ul class="text-sm text-white/70 space-y-1">
							<li>"Add an audio track"</li>
							<li>"Add a MIDI track called Drums"</li>
							<li>"Mute track 1"</li>
							<li>"Solo the vocals"</li>
						</ul>
					</div>

					<div class="bg-black/30 p-4 rounded">
						<h4 class="font-semibold mb-2 text-accent-primary">Volume Control</h4>
						<ul class="text-sm text-white/70 space-y-1">
							<li>"Make the vocals louder"</li>
							<li>"Set volume to -6 dB"</li>
							<li>"Turn down track 2 by 3 dB"</li>
						</ul>
					</div>

					<div class="bg-black/30 p-4 rounded">
						<h4 class="font-semibold mb-2 text-accent-primary">Effects</h4>
						<ul class="text-sm text-white/70 space-y-1">
							<li>"Add reverb to the vocals"</li>
							<li>"Put a compressor on track 1"</li>
							<li>"Add EQ to the selected track"</li>
						</ul>
					</div>

					<div class="bg-black/30 p-4 rounded">
						<h4 class="font-semibold mb-2 text-accent-primary">Tempo</h4>
						<ul class="text-sm text-white/70 space-y-1">
							<li>"Set the tempo to 120 BPM"</li>
							<li>"Change BPM to 140"</li>
						</ul>
					</div>

					<div class="bg-black/30 p-4 rounded">
						<h4 class="font-semibold mb-2 text-accent-secondary">
							AI Generation (Coming Soon)
						</h4>
						<ul class="text-sm text-white/70 space-y-1">
							<li>"Generate a trap beat" (Module 7)</li>
							<li>"Create a lo-fi drum pattern" (Module 7)</li>
							<li>"Help me mix these vocals" (Module 9)</li>
						</ul>
					</div>
				</div>
			</div>

			<Button variant="ghost" size="sm" onclick={() => (showInstructions = false)}>
				Hide Instructions
			</Button>
		</div>
	{:else}
		<Button variant="ghost" size="sm" onclick={() => (showInstructions = true)}>
			Show Instructions
		</Button>
	{/if}

	<div class="glass rounded-panel p-6 mb-8">
		<h3 class="text-xl font-bold mb-4">Status</h3>
		<div class="space-y-2 text-sm">
			<div class="flex items-center gap-2">
				<span class="w-24 text-white/70">API Keys:</span>
				<span class="font-mono text-xs">
					{#if import.meta.env.VITE_DEEPGRAM_API_KEY}
						<span class="text-success">✓ Deepgram</span>
					{:else}
						<span class="text-danger">✗ Deepgram</span>
					{/if}
					{#if import.meta.env.VITE_ANTHROPIC_API_KEY}
						<span class="text-success ml-2">✓ Anthropic</span>
					{:else}
						<span class="text-danger ml-2">✗ Anthropic</span>
					{/if}
					{#if import.meta.env.VITE_ELEVENLABS_API_KEY}
						<span class="text-success ml-2">✓ ElevenLabs</span>
					{:else}
						<span class="text-white/50 ml-2">○ ElevenLabs (optional)</span>
					{/if}
				</span>
			</div>
			<div class="flex items-center gap-2">
				<span class="w-24 text-white/70">Microphone:</span>
				<span class="text-xs">
					{#if navigator.mediaDevices}
						<span class="text-success">✓ Available</span>
					{:else}
						<span class="text-danger">✗ Not available</span>
					{/if}
				</span>
			</div>
		</div>
	</div>

	<div class="glass rounded-panel p-6">
		<h3 class="text-xl font-bold mb-4">Features</h3>
		<div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
			<div>
				<h4 class="font-semibold mb-2">Implemented:</h4>
				<ul class="list-disc list-inside space-y-1 text-white/70">
					<li>Real-time speech-to-text (Deepgram Nova-2)</li>
					<li>Natural language understanding (Claude 3.5 Sonnet)</li>
					<li>Text-to-speech responses (ElevenLabs + Browser fallback)</li>
					<li>Wake word detection ("Hey DAWG")</li>
					<li>Conversation memory (last 10 exchanges)</li>
					<li>Playback control</li>
					<li>Track management</li>
					<li>Volume adjustment</li>
					<li>Effect management</li>
					<li>Tempo control</li>
				</ul>
			</div>
			<div>
				<h4 class="font-semibold mb-2">Coming Soon:</h4>
				<ul class="list-disc list-inside space-y-1 text-white/70">
					<li>AI beat generation (Module 7)</li>
					<li>AI vocal coaching (Module 8)</li>
					<li>Automated mixing/mastering (Module 9)</li>
					<li>MIDI editing commands</li>
					<li>Complex multi-step workflows</li>
					<li>Project management commands</li>
				</ul>
			</div>
		</div>
	</div>

	<!-- Voice Control Button (floating) -->
	<VoiceControl />
</div>

<style>
	code {
		background: rgba(0, 217, 255, 0.1);
		padding: 2px 6px;
		border-radius: 4px;
		font-family: 'JetBrains Mono', monospace;
	}

	pre {
		font-family: 'JetBrains Mono', monospace;
	}
</style>
