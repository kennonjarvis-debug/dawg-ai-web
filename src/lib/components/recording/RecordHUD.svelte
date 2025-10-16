<script lang="ts">
	import type { RecordingState, CountInState } from '$lib/audio/recording';

	interface Props {
		isRecording: boolean;
		recordingState: RecordingState;
		countInState?: CountInState | null;
		currentTake: number;
		loopRange: { start: number; end: number };
		peakDb?: number;
	}

	let {
		isRecording = $bindable(false),
		recordingState = $bindable('idle' as RecordingState),
		countInState = $bindable(null as CountInState | null),
		currentTake = $bindable(0),
		loopRange = $bindable({ start: 0, end: 16 }),
		peakDb = $bindable(-Infinity)
	}: Props = $props();

	// Calculate loop duration in bars
	const loopDuration = $derived(loopRange.end - loopRange.start);

	// Format peak meter
	const peakMeterLevel = $derived(() => {
		if (peakDb === -Infinity) return 0;
		// Map dB range (-60 to 0) to percentage (0 to 100)
		const normalized = Math.max(0, Math.min(100, ((peakDb + 60) / 60) * 100));
		return normalized;
	});

	// Get meter color based on peak level
	const meterColor = $derived(() => {
		const level = peakMeterLevel();
		if (level > 95) return '#ff006e'; // Red - clipping
		if (level > 85) return '#ff6b35'; // Orange - hot
		if (level > 60) return '#00ff88'; // Green - good
		return '#00d9ff'; // Blue - low
	});
</script>

<div
	class="recording-hud"
	class:counting-in={recordingState === 'counting-in'}
	class:recording={recordingState === 'recording'}
	class:processing={recordingState === 'processing'}
>
	{#if recordingState === 'counting-in' && countInState}
		<!-- Count-in display -->
		<div class="count-in">
			<div class="count-in-label">Count-in</div>
			<div class="count-in-numbers">
				<div class="bar-number">{countInState.bar}</div>
				<div class="beat-number">{countInState.beat}</div>
			</div>
			<div class="count-in-message">Get ready to record...</div>
		</div>
	{:else if recordingState === 'recording'}
		<!-- Recording status -->
		<div class="recording-status">
			<div class="rec-indicator">
				<div class="rec-dot"></div>
				<span>REC</span>
			</div>

			<div class="take-info">
				<div class="take-number">Take {currentTake + 1}</div>
				<div class="loop-info">
					Loop: {loopRange.start}-{loopRange.end} bars ({loopDuration} bars)
				</div>
			</div>

			<!-- Peak meter -->
			<div class="peak-meter">
				<div class="meter-label">Input</div>
				<div class="meter-bar">
					<div
						class="meter-fill"
						style="width: {peakMeterLevel()}%; background-color: {meterColor()}"
					></div>
				</div>
				<div class="meter-value">{peakDb?.toFixed(1)} dB</div>
			</div>
		</div>
	{:else if recordingState === 'processing'}
		<!-- Processing state -->
		<div class="processing-status">
			<div class="spinner"></div>
			<div class="processing-message">Processing take {currentTake}...</div>
		</div>
	{/if}
</div>

<style>
	.recording-hud {
		position: fixed;
		top: 20px;
		left: 50%;
		transform: translateX(-50%);
		z-index: 1000;
		padding: 24px 32px;
		background: rgba(10, 10, 10, 0.95);
		border: 2px solid #333;
		border-radius: 12px;
		backdrop-filter: blur(10px);
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
		min-width: 400px;
	}

	.recording-hud.counting-in {
		border-color: #00d9ff;
		animation: pulse-blue 1s ease-in-out infinite;
	}

	.recording-hud.recording {
		border-color: #ff006e;
		animation: pulse-red 1s ease-in-out infinite;
	}

	.recording-hud.processing {
		border-color: #ff6b35;
	}

	@keyframes pulse-blue {
		0%,
		100% {
			box-shadow: 0 8px 32px rgba(0, 217, 255, 0.3);
		}
		50% {
			box-shadow: 0 8px 48px rgba(0, 217, 255, 0.6);
		}
	}

	@keyframes pulse-red {
		0%,
		100% {
			box-shadow: 0 8px 32px rgba(255, 0, 110, 0.3);
		}
		50% {
			box-shadow: 0 8px 48px rgba(255, 0, 110, 0.6);
		}
	}

	/* Count-in styles */
	.count-in {
		text-align: center;
	}

	.count-in-label {
		font-size: 14px;
		color: #00d9ff;
		margin-bottom: 16px;
		text-transform: uppercase;
		letter-spacing: 2px;
		font-weight: 600;
	}

	.count-in-numbers {
		display: flex;
		justify-content: center;
		gap: 24px;
		margin-bottom: 16px;
	}

	.bar-number,
	.beat-number {
		font-size: 64px;
		font-weight: 700;
		color: #00d9ff;
		font-variant-numeric: tabular-nums;
		text-shadow: 0 0 20px rgba(0, 217, 255, 0.5);
	}

	.count-in-message {
		font-size: 14px;
		color: #888;
	}

	/* Recording status styles */
	.recording-status {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.rec-indicator {
		display: flex;
		align-items: center;
		gap: 12px;
		font-size: 18px;
		font-weight: 700;
		color: #ff006e;
		text-transform: uppercase;
		letter-spacing: 2px;
	}

	.rec-dot {
		width: 12px;
		height: 12px;
		background: #ff006e;
		border-radius: 50%;
		animation: blink 1s ease-in-out infinite;
	}

	@keyframes blink {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.3;
		}
	}

	.take-info {
		display: flex;
		align-items: center;
		gap: 16px;
	}

	.take-number {
		font-size: 20px;
		font-weight: 600;
		color: #fff;
	}

	.loop-info {
		font-size: 14px;
		color: #888;
	}

	/* Peak meter styles */
	.peak-meter {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.meter-label {
		font-size: 12px;
		color: #888;
		min-width: 40px;
	}

	.meter-bar {
		flex: 1;
		height: 24px;
		background: #1a1a1a;
		border-radius: 4px;
		overflow: hidden;
		position: relative;
	}

	.meter-fill {
		height: 100%;
		transition: width 0.05s ease-out;
		border-radius: 4px;
	}

	.meter-value {
		font-size: 12px;
		color: #fff;
		font-variant-numeric: tabular-nums;
		min-width: 60px;
		text-align: right;
	}

	/* Processing styles */
	.processing-status {
		display: flex;
		align-items: center;
		gap: 16px;
	}

	.spinner {
		width: 24px;
		height: 24px;
		border: 3px solid #333;
		border-top-color: #ff6b35;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.processing-message {
		font-size: 16px;
		color: #ff6b35;
		font-weight: 600;
	}
</style>
