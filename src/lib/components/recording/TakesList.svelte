<script lang="ts">
	import type { Take } from '$lib/audio/recording';

	interface Props {
		takes: Take[];
		selectedTakeId?: string | null;
		onTakeSelect?: (takeId: string) => void;
		onTakeDelete?: (takeId: string) => void;
	}

	let {
		takes = $bindable([]),
		selectedTakeId = $bindable(null as string | null),
		onTakeSelect,
		onTakeDelete
	}: Props = $props();

	function handleSelect(takeId: string) {
		onTakeSelect?.(takeId);
	}

	function handleDelete(takeId: string, event: Event) {
		event.stopPropagation();
		onTakeDelete?.(takeId);
	}

	// Format metrics for display
	function formatMetrics(take: Take) {
		return {
			peak: `${take.metrics.peakDb.toFixed(1)} dB`,
			rms: `${take.metrics.rmsDb.toFixed(1)} dB`,
			snr: `${take.metrics.snr.toFixed(1)} dB`,
			timing: `±${take.metrics.timingErrorMs.toFixed(1)} ms`
		};
	}

	// Get quality indicator color
	function getQualityColor(take: Take): string {
		const score = calculateQualityScore(take);
		if (score >= 80) return '#00ff88'; // Green - excellent
		if (score >= 60) return '#00d9ff'; // Blue - good
		if (score >= 40) return '#ff6b35'; // Orange - fair
		return '#ff006e'; // Red - poor
	}

	// Calculate quality score (0-100)
	function calculateQualityScore(take: Take): number {
		const { peakDb, snr, timingErrorMs } = take.metrics;

		// Scoring factors
		let score = 100;

		// Penalize clipping (peak > -1 dB)
		if (peakDb > -1) score -= 30;

		// Reward good SNR (higher is better, typical range 20-60 dB)
		if (snr < 20) score -= 20;
		else if (snr > 40) score += 10;

		// Penalize timing errors (> 10ms)
		if (timingErrorMs > 10) score -= 15;
		else if (timingErrorMs < 5) score += 10;

		// Penalize low signal (peak < -20 dB)
		if (peakDb < -20) score -= 20;

		return Math.max(0, Math.min(100, score));
	}
</script>

<div class="takes-list">
	<div class="takes-header">
		<h3>Takes ({takes.length})</h3>
		<div class="takes-hint">Click to preview, use best segments for comp</div>
	</div>

	<div class="takes-container">
		{#each takes as take, index (take.id)}
			<div
				class="take-card"
				class:selected={selectedTakeId === take.id}
				onclick={() => handleSelect(take.id)}
				role="button"
				tabindex="0"
			>
				<div class="take-header">
					<div class="take-title">
						<div class="take-index">Take {index + 1}</div>
						<div class="take-timestamp">
							{take.timestamp.toLocaleTimeString()}
						</div>
					</div>

					<div class="take-actions">
						<div
							class="quality-indicator"
							style="background-color: {getQualityColor(take)}"
							title="Quality Score: {calculateQualityScore(take)}%"
						></div>
						<button
							class="delete-button"
							onclick={(e) => handleDelete(take.id, e)}
							title="Delete take"
						>
							×
						</button>
					</div>
				</div>

				<div class="take-metrics">
					{@const metrics = formatMetrics(take)}
					<div class="metric">
						<span class="metric-label">Peak</span>
						<span class="metric-value">{metrics.peak}</span>
					</div>
					<div class="metric">
						<span class="metric-label">RMS</span>
						<span class="metric-value">{metrics.rms}</span>
					</div>
					<div class="metric">
						<span class="metric-label">SNR</span>
						<span class="metric-value">{metrics.snr}</span>
					</div>
					<div class="metric">
						<span class="metric-label">Timing</span>
						<span class="metric-value">{metrics.timing}</span>
					</div>
				</div>

				<div class="take-range">
					Bars {take.startBar}-{take.endBar}
				</div>
			</div>
		{/each}

		{#if takes.length === 0}
			<div class="empty-state">
				<div class="empty-icon">🎤</div>
				<div class="empty-message">No takes recorded yet</div>
				<div class="empty-hint">Start recording to capture takes</div>
			</div>
		{/if}
	</div>
</div>

<style>
	.takes-list {
		display: flex;
		flex-direction: column;
		height: 100%;
		background: #0a0a0a;
		border-radius: 8px;
		overflow: hidden;
	}

	.takes-header {
		padding: 16px 20px;
		border-bottom: 1px solid #222;
		background: #111;
	}

	.takes-header h3 {
		font-size: 16px;
		font-weight: 600;
		color: #fff;
		margin: 0 0 4px 0;
	}

	.takes-hint {
		font-size: 12px;
		color: #666;
	}

	.takes-container {
		flex: 1;
		overflow-y: auto;
		padding: 12px;
	}

	.take-card {
		background: #151515;
		border: 2px solid #222;
		border-radius: 8px;
		padding: 16px;
		margin-bottom: 12px;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.take-card:hover {
		border-color: #00d9ff;
		background: #1a1a1a;
	}

	.take-card.selected {
		border-color: #00d9ff;
		background: #1a2530;
		box-shadow: 0 0 16px rgba(0, 217, 255, 0.2);
	}

	.take-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 12px;
	}

	.take-title {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.take-index {
		font-size: 16px;
		font-weight: 600;
		color: #fff;
	}

	.take-timestamp {
		font-size: 12px;
		color: #666;
	}

	.take-actions {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.quality-indicator {
		width: 12px;
		height: 12px;
		border-radius: 50%;
		box-shadow: 0 0 8px currentColor;
	}

	.delete-button {
		width: 24px;
		height: 24px;
		border: none;
		background: #222;
		color: #888;
		border-radius: 4px;
		font-size: 20px;
		line-height: 1;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.delete-button:hover {
		background: #ff006e;
		color: #fff;
	}

	.take-metrics {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 8px;
		margin-bottom: 12px;
	}

	.metric {
		display: flex;
		justify-content: space-between;
		font-size: 12px;
	}

	.metric-label {
		color: #888;
	}

	.metric-value {
		color: #fff;
		font-weight: 500;
		font-variant-numeric: tabular-nums;
	}

	.take-range {
		font-size: 12px;
		color: #666;
		text-align: center;
		padding-top: 8px;
		border-top: 1px solid #222;
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 48px 24px;
		text-align: center;
	}

	.empty-icon {
		font-size: 48px;
		margin-bottom: 16px;
		opacity: 0.3;
	}

	.empty-message {
		font-size: 16px;
		color: #888;
		margin-bottom: 8px;
	}

	.empty-hint {
		font-size: 14px;
		color: #666;
	}
</style>
