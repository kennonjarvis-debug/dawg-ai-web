<script lang="ts">
	import '../app.css';
	import { ThemeProvider, theme } from '$lib/design-system';
	import { authStore } from '$lib/stores/authStore';
	import { onMount } from 'svelte';
	import { getAudioEngine } from '$lib/audio';

	let isTestMode = false;

	onMount(async () => {
		// Import test bridge in browser (for E2E testing in dev mode)
		if (import.meta.env?.DEV || import.meta.env?.MODE === 'test') {
			await import('$lib/testing/bridge');
			isTestMode = true;
		}

		theme.initialize();
		authStore.initialize();
	});

	function handleTestQuantize() {
		console.log('Test quantize button clicked');

		try {
			const engine = getAudioEngine();
			const tracks = engine.getTracks();

			let quantizedCount = 0;

			// Apply quantization to all MIDI tracks
			tracks.forEach((track) => {
				if (track.type === 'midi') {
					const midiClips = track.getMIDIClips();
					midiClips.forEach((clip) => {
						clip.quantize(
							{
								grid: '1/16',
								strength: 1.0,
								swing: 0,
								quantizeNoteStarts: true,
								quantizeNoteEnds: false
							},
							120
						);
						quantizedCount++;
					});
				}
			});

			console.log(`Test quantize: processed ${quantizedCount} clip(s)`);
			alert(`Quantize applied to ${quantizedCount} clip(s)!`);
		} catch (err) {
			console.error('Test quantize error:', err);
			alert('Quantize test - no audio engine initialized yet');
		}
	}
</script>

<ThemeProvider>
	<slot />

	<!-- Test mode: floating quantize button for E2E tests -->
	{#if isTestMode}
		<button
			data-testid="quantize-button"
			onclick={handleTestQuantize}
			class="fixed bottom-4 right-4 z-50 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg shadow-lg text-sm"
		>
			Quantize (Test)
		</button>
	{/if}
</ThemeProvider>
