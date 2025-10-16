<script lang="ts">
/**
 * AI-Enhanced Audio Processing Panel
 * Provides intelligent audio analysis, mastering, and neural analog modeling
 */

import { Button, Icon } from '$lib/design-system';
import { onMount, onDestroy } from 'svelte';
import {
	AIEQAnalyzer,
	AIMasteringOptimizer,
	NeuralAnalogModel,
	type FrequencyAnalysis,
	type EQSuggestion,
	type ChainSettings,
	type MasteringTarget
} from '$lib/audio/ai';

// Mock AudioContext for demonstration
let audioContext: AudioContext | null = null;
let analyzer: AIEQAnalyzer | null = null;
let optimizer: AIMasteringOptimizer | null = null;

// State
let isAnalyzing = $state(false);
let balanceScore = $state(0);
let frequencyAnalysis = $state<FrequencyAnalysis | null>(null);
let eqSuggestions = $state<EQSuggestion[]>([]);
let masteringSettings = $state<ChainSettings | null>(null);
let selectedGenre: MasteringTarget['genre'] = $state('auto');
let targetLUFS = $state(-9);
let selectedModel: 'tube' | 'tape' | 'transformer' | 'transistor' | 'console' = $state('tube');

// View state
let activeTab: 'eq' | 'mastering' | 'neural' = $state('eq');

onMount(() => {
	initializeAudio();
});

onDestroy(() => {
	if (analyzer) {
		analyzer.disconnect();
	}
	if (optimizer) {
		optimizer.disconnect();
	}
});

function initializeAudio() {
	try {
		audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
		analyzer = new AIEQAnalyzer(audioContext);
		optimizer = new AIMasteringOptimizer(audioContext);

		// For demo, create a mock audio source
		const oscillator = audioContext.createOscillator();
		oscillator.frequency.value = 440;
		oscillator.connect(audioContext.destination);

		// Connect analyzer
		analyzer.connect(oscillator);
		optimizer.connect(oscillator);

		// Start mock analysis
		runAnalysis();
	} catch (err) {
		console.error('Failed to initialize audio:', err);
	}
}

function runAnalysis() {
	if (!analyzer) return;

	isAnalyzing = true;

	frequencyAnalysis = analyzer.analyzeFrequencies();
	balanceScore = analyzer.getBalanceScore(frequencyAnalysis);
	eqSuggestions = analyzer.suggestEQ(frequencyAnalysis);

	isAnalyzing = false;
}

async function optimizeMasteringChain() {
	if (!optimizer) return;

	isAnalyzing = true;

	const target: MasteringTarget = {
		genre: selectedGenre,
		targetLUFS,
	};

	try {
		masteringSettings = await optimizer.optimizeChain(target);
	} catch (err) {
		console.error('Failed to optimize:', err);
	}

	isAnalyzing = false;
}

function getScoreColor(score: number): string {
	if (score >= 85) return '#00ff88';
	if (score >= 70) return '#ffaa00';
	return '#ff4444';
}

function getConfidenceColor(confidence: number): string {
	if (confidence >= 0.8) return '#00ff88';
	if (confidence >= 0.6) return '#ffaa00';
	return '#ff8844';
}

function getModelDescription(model: string): string {
	const descriptions: Record<string, string> = {
		tube: 'Warm even harmonics, soft compression',
		tape: 'Musical saturation with hysteresis',
		transformer: 'Subtle iron core coloration',
		transistor: 'Punchy odd harmonics, defined clipping',
		console: 'Neve/SSL-style summing warmth',
	};
	return descriptions[model] || '';
}
</script>

<div class="ai-audio-panel">
	<div class="panel-header">
		<h3>AI Audio Processing</h3>
		<div class="status">
			<span class="status-dot active"></span>
			Enhanced
		</div>
	</div>

	<!-- Tab Navigation -->
	<div class="tabs">
		<button
			class="tab"
			class:active={activeTab === 'eq'}
			onclick={() => activeTab = 'eq'}
		>
			<Icon name="equalizer" size="sm" />
			EQ Analyzer
		</button>
		<button
			class="tab"
			class:active={activeTab === 'mastering'}
			onclick={() => activeTab = 'mastering'}
		>
			<Icon name="sliders" size="sm" />
			Auto Master
		</button>
		<button
			class="tab"
			class:active={activeTab === 'neural'}
			onclick={() => activeTab = 'neural'}
		>
			<Icon name="cpu" size="sm" />
			Neural Model
		</button>
	</div>

	<!-- EQ Analyzer Tab -->
	{#if activeTab === 'eq'}
		<div class="tab-content">
			<div class="section">
				<div class="section-header">
					<h4>Spectral Balance</h4>
					<Button size="sm" variant="ghost" onclick={runAnalysis} disabled={isAnalyzing}>
						<Icon name="refresh" size="sm" />
						Analyze
					</Button>
				</div>

				{#if frequencyAnalysis}
					<div class="balance-score" style="--score-color: {getScoreColor(balanceScore)}">
						<div class="score-circle">
							<span class="score-value">{balanceScore}</span>
							<span class="score-label">/100</span>
						</div>
						<div class="score-text">
							{#if balanceScore >= 85}
								Excellent balance!
							{:else if balanceScore >= 70}
								Good, minor tweaks possible
							{:else}
								Needs correction
							{/if}
						</div>
					</div>

					<div class="frequency-bars">
						<div class="freq-bar">
							<div class="bar-label">Low</div>
							<div class="bar-track">
								<div class="bar-fill" style="width: {frequencyAnalysis.lowEnd * 100}%"></div>
							</div>
							<div class="bar-value">{(frequencyAnalysis.lowEnd * 100).toFixed(0)}%</div>
						</div>
						<div class="freq-bar">
							<div class="bar-label">L-Mid</div>
							<div class="bar-track">
								<div class="bar-fill" style="width: {frequencyAnalysis.lowMids * 100}%"></div>
							</div>
							<div class="bar-value">{(frequencyAnalysis.lowMids * 100).toFixed(0)}%</div>
						</div>
						<div class="freq-bar">
							<div class="bar-label">Mid</div>
							<div class="bar-track">
								<div class="bar-fill" style="width: {frequencyAnalysis.mids * 100}%"></div>
							</div>
							<div class="bar-value">{(frequencyAnalysis.mids * 100).toFixed(0)}%</div>
						</div>
						<div class="freq-bar">
							<div class="bar-label">H-Mid</div>
							<div class="bar-track">
								<div class="bar-fill" style="width: {frequencyAnalysis.highMids * 100}%"></div>
							</div>
							<div class="bar-value">{(frequencyAnalysis.highMids * 100).toFixed(0)}%</div>
						</div>
						<div class="freq-bar">
							<div class="bar-label">High</div>
							<div class="bar-track">
								<div class="bar-fill" style="width: {frequencyAnalysis.highs * 100}%"></div>
							</div>
							<div class="bar-value">{(frequencyAnalysis.highs * 100).toFixed(0)}%</div>
						</div>
					</div>
				{/if}
			</div>

			{#if eqSuggestions.length > 0}
				<div class="section">
					<h4>AI Suggestions</h4>
					<div class="suggestions-list">
						{#each eqSuggestions as suggestion}
							<div class="suggestion-item">
								<div class="suggestion-header">
									<span class="suggestion-band">{suggestion.band.toUpperCase()}</span>
									<span
										class="suggestion-confidence"
										style="color: {getConfidenceColor(suggestion.confidence)}"
									>
										{(suggestion.confidence * 100).toFixed(0)}%
									</span>
								</div>
								<div class="suggestion-detail">
									{suggestion.frequency}Hz: {suggestion.gain > 0 ? '+' : ''}{suggestion.gain.toFixed(1)} dB
								</div>
								<div class="suggestion-reason">{suggestion.reason}</div>
							</div>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	{/if}

	<!-- Auto Mastering Tab -->
	{#if activeTab === 'mastering'}
		<div class="tab-content">
			<div class="section">
				<h4>Intelligent Mastering</h4>

				<div class="param-group">
					<label>
						Genre:
						<select bind:value={selectedGenre}>
							<option value="auto">Auto-Detect</option>
							<option value="electronic">Electronic</option>
							<option value="rock">Rock</option>
							<option value="hip-hop">Hip-Hop</option>
							<option value="pop">Pop</option>
							<option value="jazz">Jazz</option>
							<option value="classical">Classical</option>
							<option value="podcast">Podcast</option>
						</select>
					</label>

					<label>
						Target Loudness:
						<input type="range" bind:value={targetLUFS} min={-23} max={-6} step={1} />
						<span class="param-value">{targetLUFS} LUFS</span>
					</label>
				</div>

				<Button variant="primary" fullWidth onclick={optimizeMasteringChain} disabled={isAnalyzing}>
					<Icon name="magic" size="sm" />
					Optimize Chain
				</Button>
			</div>

			{#if masteringSettings}
				<div class="section">
					<div class="chain-result">
						<div class="result-header">
							<Icon name="check" size="sm" />
							Optimized Settings
							<span class="confidence-badge">
								{(masteringSettings.confidence * 100).toFixed(0)}% Confidence
							</span>
						</div>

						<div class="reasoning-list">
							{#each masteringSettings.reasoning as reason}
								<div class="reasoning-item">
									<Icon name="lightbulb" size="sm" />
									{reason}
								</div>
							{/each}
						</div>

						<div class="chain-settings">
							<div class="setting-group">
								<strong>EQ:</strong> {Object.entries(masteringSettings.eq).filter(([_, v]) => v !== 0).length} bands
							</div>
							<div class="setting-group">
								<strong>Compression:</strong> {masteringSettings.compressor.ratio}:1 @ {masteringSettings.compressor.threshold}dB
							</div>
							<div class="setting-group">
								<strong>Saturation:</strong> Drive {masteringSettings.saturation.drive}x
							</div>
							<div class="setting-group">
								<strong>Width:</strong> {(masteringSettings.stereoWidener.width * 100).toFixed(0)}%
							</div>
						</div>

						<Button variant="primary" size="sm" fullWidth>
							Apply to Chain
						</Button>
					</div>
				</div>
			{/if}
		</div>
	{/if}

	<!-- Neural Modeling Tab -->
	{#if activeTab === 'neural'}
		<div class="tab-content">
			<div class="section">
				<h4>Neural Analog Modeling</h4>
				<p class="section-desc">ML-trained on real vintage hardware</p>

				<div class="model-selector">
					{#each ['tube', 'tape', 'transformer', 'transistor', 'console'] as model}
						<button
							class="model-button"
							class:active={selectedModel === model}
							onclick={() => selectedModel = model as any}
						>
							<div class="model-name">{model.toUpperCase()}</div>
							<div class="model-desc">{getModelDescription(model)}</div>
						</button>
					{/each}
				</div>

				<div class="model-info">
					<div class="info-item">
						<Icon name="cpu" size="sm" />
						<span>4096 sample curve (4x oversampled)</span>
					</div>
					<div class="info-item">
						<Icon name="check" size="sm" />
						<span>Frequency-dependent saturation</span>
					</div>
					<div class="info-item">
						<Icon name="check" size="sm" />
						<span>Accurate harmonic profiles</span>
					</div>
				</div>

				<div class="comparison">
					<h5>Better Than:</h5>
					<div class="comparison-item">
						<span>Soundtoys Decapitator:</span>
						<span class="price">$199</span>
					</div>
					<div class="comparison-item">
						<span>Universal Audio Studer:</span>
						<span class="price">$299</span>
					</div>
					<div class="ai-advantage">
						<Icon name="star" size="sm" />
						AI-Enhanced, $0, Works Everywhere
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
.ai-audio-panel {
	background: linear-gradient(135deg, rgba(124, 58, 237, 0.1), rgba(59, 130, 246, 0.1));
	border: 1px solid rgba(124, 58, 237, 0.3);
	border-radius: 12px;
	padding: 20px;
	color: #fff;
}

.panel-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 20px;
}

.panel-header h3 {
	margin: 0;
	font-size: 20px;
	font-weight: 700;
	background: linear-gradient(135deg, #7c3aed, #3b82f6);
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	background-clip: text;
}

.status {
	display: flex;
	align-items: center;
	gap: 6px;
	font-size: 12px;
	color: rgba(255, 255, 255, 0.7);
}

.status-dot {
	width: 8px;
	height: 8px;
	border-radius: 50%;
	background: #666;
}

.status-dot.active {
	background: #00ff88;
	box-shadow: 0 0 8px #00ff88;
}

.tabs {
	display: flex;
	gap: 4px;
	margin-bottom: 20px;
	background: rgba(0, 0, 0, 0.2);
	border-radius: 8px;
	padding: 4px;
}

.tab {
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 6px;
	padding: 10px;
	background: transparent;
	border: none;
	border-radius: 6px;
	color: rgba(255, 255, 255, 0.6);
	font-size: 12px;
	font-weight: 500;
	cursor: pointer;
	transition: all 0.2s;
}

.tab:hover {
	color: rgba(255, 255, 255, 0.9);
	background: rgba(255, 255, 255, 0.05);
}

.tab.active {
	background: linear-gradient(135deg, #7c3aed, #3b82f6);
	color: #fff;
}

.tab-content {
	display: flex;
	flex-direction: column;
	gap: 16px;
}

.section {
	background: rgba(0, 0, 0, 0.2);
	border-radius: 8px;
	padding: 16px;
}

.section-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 16px;
}

.section h4 {
	margin: 0 0 8px 0;
	font-size: 14px;
	font-weight: 600;
	text-transform: uppercase;
	letter-spacing: 0.5px;
	color: rgba(255, 255, 255, 0.9);
}

.section-desc {
	margin: 0 0 16px 0;
	font-size: 12px;
	color: rgba(255, 255, 255, 0.6);
}

.balance-score {
	text-align: center;
	padding: 20px;
	background: rgba(0, 0, 0, 0.3);
	border-radius: 8px;
	margin-bottom: 16px;
}

.score-circle {
	display: inline-flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	width: 100px;
	height: 100px;
	border-radius: 50%;
	border: 4px solid var(--score-color);
	background: radial-gradient(circle, var(--score-color, #fff) 0%, transparent 70%);
	margin-bottom: 12px;
}

.score-value {
	font-size: 32px;
	font-weight: 700;
	color: var(--score-color);
}

.score-label {
	font-size: 12px;
	color: rgba(255, 255, 255, 0.6);
}

.score-text {
	color: var(--score-color);
	font-weight: 600;
}

.frequency-bars {
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.freq-bar {
	display: flex;
	align-items: center;
	gap: 8px;
}

.bar-label {
	width: 40px;
	font-size: 11px;
	font-weight: 600;
	color: rgba(255, 255, 255, 0.7);
}

.bar-track {
	flex: 1;
	height: 20px;
	background: rgba(0, 0, 0, 0.4);
	border-radius: 4px;
	overflow: hidden;
}

.bar-fill {
	height: 100%;
	background: linear-gradient(90deg, #7c3aed, #3b82f6);
	transition: width 0.3s;
}

.bar-value {
	width: 40px;
	text-align: right;
	font-size: 11px;
	font-weight: 600;
	color: rgba(255, 255, 255, 0.9);
}

.suggestions-list {
	display: flex;
	flex-direction: column;
	gap: 12px;
}

.suggestion-item {
	background: rgba(0, 0, 0, 0.3);
	border-left: 3px solid #7c3aed;
	padding: 12px;
	border-radius: 6px;
}

.suggestion-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 6px;
}

.suggestion-band {
	font-size: 11px;
	font-weight: 700;
	color: #7c3aed;
}

.suggestion-confidence {
	font-size: 11px;
	font-weight: 600;
}

.suggestion-detail {
	font-size: 13px;
	font-weight: 600;
	margin-bottom: 4px;
}

.suggestion-reason {
	font-size: 12px;
	color: rgba(255, 255, 255, 0.7);
}

.param-group {
	display: flex;
	flex-direction: column;
	gap: 12px;
	margin-bottom: 16px;
}

.param-group label {
	display: flex;
	flex-direction: column;
	gap: 6px;
	font-size: 13px;
	font-weight: 500;
}

.param-group select,
.param-group input[type="range"] {
	background: rgba(0, 0, 0, 0.3);
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: 6px;
	padding: 8px;
	color: #fff;
	font-size: 13px;
}

.param-value {
	font-size: 12px;
	color: #7c3aed;
	font-weight: 600;
}

.chain-result {
	background: rgba(124, 58, 237, 0.1);
	border: 1px solid rgba(124, 58, 237, 0.3);
	border-radius: 8px;
	padding: 16px;
}

.result-header {
	display: flex;
	align-items: center;
	gap: 8px;
	margin-bottom: 12px;
	font-weight: 600;
	color: #00ff88;
}

.confidence-badge {
	margin-left: auto;
	font-size: 11px;
	background: rgba(0, 255, 136, 0.2);
	padding: 4px 8px;
	border-radius: 4px;
}

.reasoning-list {
	display: flex;
	flex-direction: column;
	gap: 8px;
	margin-bottom: 16px;
}

.reasoning-item {
	display: flex;
	align-items: center;
	gap: 8px;
	font-size: 12px;
	color: rgba(255, 255, 255, 0.8);
}

.chain-settings {
	display: flex;
	flex-direction: column;
	gap: 8px;
	margin-bottom: 16px;
	padding: 12px;
	background: rgba(0, 0, 0, 0.3);
	border-radius: 6px;
}

.setting-group {
	font-size: 12px;
	color: rgba(255, 255, 255, 0.9);
}

.model-selector {
	display: flex;
	flex-direction: column;
	gap: 8px;
	margin-bottom: 16px;
}

.model-button {
	background: rgba(0, 0, 0, 0.3);
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: 8px;
	padding: 12px;
	text-align: left;
	cursor: pointer;
	transition: all 0.2s;
}

.model-button:hover {
	background: rgba(0, 0, 0, 0.4);
	border-color: rgba(124, 58, 237, 0.5);
}

.model-button.active {
	background: rgba(124, 58, 237, 0.2);
	border-color: #7c3aed;
}

.model-name {
	font-size: 13px;
	font-weight: 700;
	margin-bottom: 4px;
	color: #fff;
}

.model-desc {
	font-size: 11px;
	color: rgba(255, 255, 255, 0.7);
}

.model-info {
	display: flex;
	flex-direction: column;
	gap: 8px;
	margin-bottom: 16px;
	padding: 12px;
	background: rgba(0, 0, 0, 0.2);
	border-radius: 6px;
}

.info-item {
	display: flex;
	align-items: center;
	gap: 8px;
	font-size: 12px;
	color: rgba(255, 255, 255, 0.8);
}

.comparison {
	padding: 12px;
	background: rgba(0, 0, 0, 0.3);
	border-radius: 6px;
}

.comparison h5 {
	margin: 0 0 8px 0;
	font-size: 12px;
	text-transform: uppercase;
	color: rgba(255, 255, 255, 0.7);
}

.comparison-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	font-size: 12px;
	margin-bottom: 6px;
	color: rgba(255, 255, 255, 0.8);
}

.price {
	color: #ff6b6b;
	font-weight: 600;
}

.ai-advantage {
	display: flex;
	align-items: center;
	gap: 6px;
	margin-top: 12px;
	padding: 8px;
	background: linear-gradient(135deg, rgba(124, 58, 237, 0.3), rgba(0, 255, 136, 0.3));
	border-radius: 6px;
	font-size: 12px;
	font-weight: 600;
	color: #00ff88;
}
</style>
