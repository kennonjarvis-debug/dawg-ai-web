<script lang="ts">
	/**
	 * CompReview Component - DAWG AI
	 * Visual timeline showing which take was selected for each segment
	 */

	import type { CompResult, CompSegment } from '$lib/audio/comp/types';
	import type { Take } from '$lib/audio/recording/types';

	interface Props {
		compResult: CompResult;
		takes: Take[];
		onKeepSegment?: (takeId: string, startBar: number, endBar: number) => void;
		onSwapSegment?: (segmentIndex: number, newTakeId: string) => void;
	}

	let { compResult, takes, onKeepSegment, onSwapSegment }: Props = $props();

	// Assign colors to each take for visual distinction
	const takeColors = new Map<string, string>();
	const colors = [
		'#00d9ff', // Jarvis Blue
		'#ff6b35', // Jarvis Orange
		'#00ff88', // Jarvis Green
		'#ff006e', // Jarvis Red
		'#a855f7', // Purple
		'#fbbf24', // Yellow
	];

	$effect(() => {
		takes.forEach((take, index) => {
			if (!takeColors.has(take.id)) {
				takeColors.set(take.id, colors[index % colors.length]);
			}
		});
	});

	function getTakeName(takeId: string): string {
		const take = takes.find((t) => t.id === takeId);
		return take ? `Take ${take.passIndex + 1}` : 'Unknown Take';
	}

	function formatScore(score: number): string {
		return (score * 100).toFixed(1) + '%';
	}

	function handleKeepSegment(segment: CompSegment) {
		onKeepSegment?.(segment.takeId, segment.startBar, segment.endBar);
	}

	function handleSwapSegment(segmentIndex: number, event: Event) {
		const select = event.target as HTMLSelectElement;
		const newTakeId = select.value;
		onSwapSegment?.(segmentIndex, newTakeId);
	}
</script>

<div class="comp-review">
	<header class="comp-header">
		<h2>Comp Review</h2>
		<div class="comp-stats">
			<span class="stat">
				<span class="label">Segments:</span>
				<span class="value">{compResult.totalSegments}</span>
			</span>
			<span class="stat">
				<span class="label">Avg Score:</span>
				<span class="value">{formatScore(compResult.averageScore)}</span>
			</span>
			<span class="stat">
				<span class="label">Crossfades:</span>
				<span class="value">{compResult.crossfades.length}</span>
			</span>
		</div>
	</header>

	<!-- Visual Timeline -->
	<div class="timeline">
		{#each compResult.segments as segment, index}
			{@const takeColor = takeColors.get(segment.takeId) || '#666'}
			{@const takeName = getTakeName(segment.takeId)}
			{@const hasCrossfade = compResult.crossfades.some((cf) => cf.bar === segment.endBar)}

			<div class="segment" style:background-color={takeColor}>
				<div class="segment-header">
					<span class="take-name">{takeName}</span>
					<span class="bars">Bars {segment.startBar}-{segment.endBar}</span>
				</div>

				<div class="segment-info">
					<span class="score">{formatScore(segment.score)}</span>
					<span class="reason">{segment.reason}</span>
				</div>

				<div class="segment-actions">
					<button
						class="keep-button"
						onclick={() => handleKeepSegment(segment)}
						title="Keep this segment in manual mode"
					>
						✓ Keep
					</button>

					<select
						class="swap-select"
						onchange={(e) => handleSwapSegment(index, e)}
						value={segment.takeId}
					>
						{#each takes as take}
							<option value={take.id}>Take {take.passIndex + 1}</option>
						{/each}
					</select>
				</div>

				{#if hasCrossfade}
					<div class="crossfade-indicator" title="Crossfade at this boundary">
						<svg width="20" height="20" viewBox="0 0 20 20">
							<path d="M 5,15 L 15,5" stroke="white" stroke-width="2" />
							<path d="M 5,5 L 15,15" stroke="white" stroke-width="2" opacity="0.5" />
						</svg>
					</div>
				{/if}
			</div>
		{/each}
	</div>

	<!-- Take Legend -->
	<div class="take-legend">
		<h3>Takes</h3>
		<div class="legend-items">
			{#each takes as take}
				{@const color = takeColors.get(take.id) || '#666'}
				<div class="legend-item">
					<div class="color-box" style:background-color={color}></div>
					<span class="legend-label">Take {take.passIndex + 1}</span>
					<span class="legend-metrics">
						{take.metrics.timingErrorMs.toFixed(1)}ms • {take.metrics.snr.toFixed(1)}dB SNR
					</span>
				</div>
			{/each}
		</div>
	</div>
</div>

<style>
	.comp-review {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding: 1rem;
		background: #1a1a1a;
		border-radius: 8px;
		color: #fff;
	}

	.comp-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.comp-header h2 {
		margin: 0;
		font-size: 1.5rem;
		font-weight: 600;
	}

	.comp-stats {
		display: flex;
		gap: 1.5rem;
	}

	.stat {
		display: flex;
		gap: 0.5rem;
	}

	.label {
		color: #999;
		font-size: 0.875rem;
	}

	.value {
		color: #00d9ff;
		font-weight: 600;
		font-size: 0.875rem;
	}

	.timeline {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.segment {
		position: relative;
		padding: 1rem;
		border-radius: 4px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
		transition: transform 0.2s;
	}

	.segment:hover {
		transform: translateX(4px);
	}

	.segment-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.5rem;
	}

	.take-name {
		font-weight: 600;
		font-size: 1rem;
		color: #fff;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
	}

	.bars {
		font-size: 0.875rem;
		color: rgba(255, 255, 255, 0.8);
	}

	.segment-info {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.75rem;
	}

	.score {
		font-size: 1.25rem;
		font-weight: 700;
		color: #fff;
	}

	.reason {
		font-size: 0.875rem;
		color: rgba(255, 255, 255, 0.9);
		font-style: italic;
	}

	.segment-actions {
		display: flex;
		gap: 0.5rem;
	}

	.keep-button {
		padding: 0.5rem 1rem;
		background: rgba(255, 255, 255, 0.1);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 4px;
		color: #fff;
		font-size: 0.875rem;
		cursor: pointer;
		transition: all 0.2s;
	}

	.keep-button:hover {
		background: rgba(255, 255, 255, 0.2);
		border-color: rgba(255, 255, 255, 0.4);
	}

	.swap-select {
		padding: 0.5rem;
		background: rgba(0, 0, 0, 0.3);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 4px;
		color: #fff;
		font-size: 0.875rem;
		cursor: pointer;
	}

	.swap-select:hover {
		border-color: rgba(255, 255, 255, 0.4);
	}

	.crossfade-indicator {
		position: absolute;
		top: 0.5rem;
		right: 0.5rem;
		width: 20px;
		height: 20px;
		opacity: 0.7;
	}

	.take-legend {
		margin-top: 1rem;
		padding-top: 1rem;
		border-top: 1px solid rgba(255, 255, 255, 0.1);
	}

	.take-legend h3 {
		margin: 0 0 0.75rem 0;
		font-size: 1rem;
		font-weight: 600;
		color: #999;
	}

	.legend-items {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
	}

	.legend-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.color-box {
		width: 16px;
		height: 16px;
		border-radius: 2px;
	}

	.legend-label {
		font-size: 0.875rem;
		font-weight: 600;
	}

	.legend-metrics {
		font-size: 0.75rem;
		color: #999;
	}
</style>
