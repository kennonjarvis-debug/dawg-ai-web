/**
 * Pitch Detector AudioWorklet Processor
 * Real-time pitch detection using autocorrelation (YIN algorithm)
 * @module audio/worklets/pitch-detector
 */

/**
 * Pitch Detector Processor
 * Detects fundamental frequency using autocorrelation
 */
class PitchDetectorProcessor extends AudioWorkletProcessor {
	private buffer: Float32Array;
	private bufferIndex: number = 0;
	private bufferSize: number = 2048;
	private threshold: number = 0.1;
	private sampleRate: number;

	constructor() {
		super();
		this.buffer = new Float32Array(this.bufferSize);
		this.sampleRate = 48000; // Will be updated from globalThis
	}

	/**
	 * Process audio samples
	 */
	process(inputs: Float32Array[][], outputs: Float32Array[][], parameters: Record<string, Float32Array>): boolean {
		const input = inputs[0];

		if (!input || input.length === 0) {
			return true;
		}

		const inputChannel = input[0];

		// Fill buffer with incoming samples
		for (let i = 0; i < inputChannel.length; i++) {
			this.buffer[this.bufferIndex] = inputChannel[i];
			this.bufferIndex = (this.bufferIndex + 1) % this.bufferSize;

			// Process every N samples
			if (this.bufferIndex % 512 === 0) {
				const pitch = this.detectPitch(this.buffer);

				if (pitch > 0) {
					this.port.postMessage({
						pitch,
						confidence: this.getConfidence(),
						timestamp: currentTime
					});
				}
			}
		}

		// Pass through audio
		if (outputs[0] && outputs[0][0]) {
			outputs[0][0].set(inputChannel);
		}

		return true;
	}

	/**
	 * Detect pitch using autocorrelation (simplified YIN algorithm)
	 */
	private detectPitch(buffer: Float32Array): number {
		// Calculate RMS to check if signal is present
		const rms = this.calculateRMS(buffer);
		if (rms < 0.01) {
			return -1; // No signal
		}

		// Autocorrelation
		const correlations = new Float32Array(this.bufferSize / 2);

		for (let lag = 0; lag < correlations.length; lag++) {
			let sum = 0;
			for (let i = 0; i < this.bufferSize / 2; i++) {
				sum += buffer[i] * buffer[i + lag];
			}
			correlations[lag] = sum;
		}

		// Find first peak after initial peak
		let maxCorrelation = -Infinity;
		let maxLag = -1;

		// Start after fundamental (skip DC and very low frequencies)
		const minLag = Math.floor(this.sampleRate / 1000); // Max 1000 Hz

		for (let lag = minLag; lag < correlations.length; lag++) {
			if (correlations[lag] > maxCorrelation) {
				maxCorrelation = correlations[lag];
				maxLag = lag;
			}
		}

		if (maxLag === -1 || maxCorrelation < this.threshold) {
			return -1;
		}

		// Convert lag to frequency
		const frequency = this.sampleRate / maxLag;

		// Validate frequency range (human voice/instruments: 80-2000 Hz)
		if (frequency < 80 || frequency > 2000) {
			return -1;
		}

		return frequency;
	}

	/**
	 * Calculate RMS of buffer
	 */
	private calculateRMS(buffer: Float32Array): number {
		let sum = 0;
		for (let i = 0; i < buffer.length; i++) {
			sum += buffer[i] * buffer[i];
		}
		return Math.sqrt(sum / buffer.length);
	}

	/**
	 * Get confidence of detection (placeholder)
	 */
	private getConfidence(): number {
		return 0.85; // Simplified - would need more sophisticated calculation
	}
}

// Register processor
registerProcessor('pitch-detector', PitchDetectorProcessor);

export {};
