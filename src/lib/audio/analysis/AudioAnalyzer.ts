/**
 * AudioAnalyzer - DAWG AI Audio Engine
 * Real-time audio analysis for metering and visualization
 * @module audio/analysis/AudioAnalyzer
 */

import * as Tone from 'tone';

/**
 * Spectrum analysis data
 */
export interface SpectrumData {
	frequencies: Float32Array;
	magnitudes: Float32Array;
	binCount: number;
	sampleRate: number;
}

/**
 * Peak data for waveform visualization
 */
export interface PeakData {
	peaks: number[];
	rms: number;
	peakLevel: number;
	peakPosition: number;
}

/**
 * Loudness metering data (LUFS/RMS)
 */
export interface LoudnessData {
	integrated: number; // LUFS integrated loudness
	shortTerm: number; // LUFS short-term (3s window)
	momentary: number; // LUFS momentary (400ms window)
	rms: number; // RMS level in dB
	peak: number; // Peak level in dB
	truePeak: number; // True peak in dB
}

/**
 * Phase correlation data
 */
export interface PhaseCorrelation {
	correlation: number; // -1 to +1 (mono to stereo)
	balance: number; // L/R balance
}

/**
 * AudioAnalyzer - Provides audio analysis and metering
 */
export class AudioAnalyzer {
	private context: AudioContext;
	private analyser: AnalyserNode;
	private splitter: ChannelSplitterNode;
	private leftAnalyser: AnalyserNode;
	private rightAnalyser: AnalyserNode;

	// Analysis buffers
	private freqData: Float32Array;
	private timeData: Float32Array;
	private leftTimeData: Float32Array;
	private rightTimeData: Float32Array;

	// Metering state
	private peakHold: number = 0;
	private peakHoldTime: number = 0;
	private peakHoldDuration: number = 2000; // 2 seconds

	// RMS history for short-term and integrated loudness
	private rmsHistory: number[] = [];
	private maxHistorySize: number = 300; // 3 seconds at 100Hz update rate

	constructor(context: AudioContext) {
		this.context = context;

		// Create stereo analyser
		this.analyser = context.createAnalyser();
		this.analyser.fftSize = 2048;
		this.analyser.smoothingTimeConstant = 0.8;

		// Create stereo splitter and analysers
		this.splitter = context.createChannelSplitter(2);
		this.leftAnalyser = context.createAnalyser();
		this.rightAnalyser = context.createAnalyser();

		this.leftAnalyser.fftSize = 2048;
		this.rightAnalyser.fftSize = 2048;

		// Connect analysers
		this.analyser.connect(this.splitter);
		this.splitter.connect(this.leftAnalyser, 0);
		this.splitter.connect(this.rightAnalyser, 1);

		// Initialize buffers
		this.freqData = new Float32Array(this.analyser.frequencyBinCount);
		this.timeData = new Float32Array(this.analyser.fftSize);
		this.leftTimeData = new Float32Array(this.leftAnalyser.fftSize);
		this.rightTimeData = new Float32Array(this.rightAnalyser.fftSize);
	}

	/**
	 * Connect audio source to analyzer
	 */
	connect(source: AudioNode): void {
		source.connect(this.analyser);
	}

	/**
	 * Disconnect analyzer
	 */
	disconnect(): void {
		this.analyser.disconnect();
	}

	/**
	 * Get spectrum data for visualization
	 */
	getSpectrumData(): SpectrumData {
		this.analyser.getFloatFrequencyData(this.freqData);

		// Calculate frequencies for each bin
		const binCount = this.analyser.frequencyBinCount;
		const frequencies = new Float32Array(binCount);
		const nyquist = this.context.sampleRate / 2;

		for (let i = 0; i < binCount; i++) {
			frequencies[i] = (i / binCount) * nyquist;
		}

		return {
			frequencies,
			magnitudes: this.freqData.slice(0), // Copy array
			binCount,
			sampleRate: this.context.sampleRate
		};
	}

	/**
	 * Get waveform peak data
	 */
	getPeakData(windowSize: number = 100): PeakData {
		this.analyser.getFloatTimeDomainData(this.timeData);

		const peaks: number[] = [];
		const samplesPerPeak = Math.floor(this.timeData.length / windowSize);

		let rmsSum = 0;
		let peakLevel = 0;
		let peakPosition = 0;

		// Calculate peaks and RMS
		for (let i = 0; i < windowSize; i++) {
			const start = i * samplesPerPeak;
			const end = Math.min(start + samplesPerPeak, this.timeData.length);

			let maxInWindow = 0;
			let windowRmsSum = 0;

			for (let j = start; j < end; j++) {
				const value = Math.abs(this.timeData[j]);
				maxInWindow = Math.max(maxInWindow, value);
				windowRmsSum += value * value;

				if (value > peakLevel) {
					peakLevel = value;
					peakPosition = j / this.timeData.length;
				}
			}

			peaks.push(maxInWindow);
			rmsSum += windowRmsSum;
		}

		const rms = Math.sqrt(rmsSum / this.timeData.length);

		return {
			peaks,
			rms,
			peakLevel,
			peakPosition
		};
	}

	/**
	 * Get loudness metering data (LUFS/RMS)
	 */
	getLoudnessData(): LoudnessData {
		this.leftAnalyser.getFloatTimeDomainData(this.leftTimeData);
		this.rightAnalyser.getFloatTimeDomainData(this.rightTimeData);

		// Calculate RMS
		let rmsSum = 0;
		let peak = 0;

		for (let i = 0; i < this.leftTimeData.length; i++) {
			const left = this.leftTimeData[i];
			const right = this.rightTimeData[i];
			const mono = (left + right) / 2;

			rmsSum += mono * mono;
			peak = Math.max(peak, Math.abs(left), Math.abs(right));
		}

		const rmsLinear = Math.sqrt(rmsSum / this.leftTimeData.length);
		const rmsDb = 20 * Math.log10(Math.max(rmsLinear, 1e-10));
		const peakDb = 20 * Math.log10(Math.max(peak, 1e-10));

		// Update RMS history
		this.rmsHistory.push(rmsLinear);
		if (this.rmsHistory.length > this.maxHistorySize) {
			this.rmsHistory.shift();
		}

		// Calculate short-term loudness (3s window)
		const shortTermSamples = Math.min(30, this.rmsHistory.length); // ~300ms
		let shortTermSum = 0;
		for (let i = this.rmsHistory.length - shortTermSamples; i < this.rmsHistory.length; i++) {
			shortTermSum += this.rmsHistory[i] * this.rmsHistory[i];
		}
		const shortTermRms = Math.sqrt(shortTermSum / shortTermSamples);
		const shortTermLufs = this.convertToLUFS(shortTermRms);

		// Calculate integrated loudness (entire history)
		let integratedSum = 0;
		for (const rms of this.rmsHistory) {
			integratedSum += rms * rms;
		}
		const integratedRms = Math.sqrt(integratedSum / this.rmsHistory.length);
		const integratedLufs = this.convertToLUFS(integratedRms);

		// Momentary loudness is current RMS
		const momentaryLufs = this.convertToLUFS(rmsLinear);

		// Update peak hold
		const now = Date.now();
		if (peak > this.peakHold || now - this.peakHoldTime > this.peakHoldDuration) {
			this.peakHold = peak;
			this.peakHoldTime = now;
		}

		const truePeakDb = 20 * Math.log10(Math.max(this.peakHold, 1e-10));

		return {
			integrated: integratedLufs,
			shortTerm: shortTermLufs,
			momentary: momentaryLufs,
			rms: rmsDb,
			peak: peakDb,
			truePeak: truePeakDb
		};
	}

	/**
	 * Convert RMS to LUFS (simplified approximation)
	 */
	private convertToLUFS(rms: number): number {
		// LUFS is approximately -0.691 dB offset from RMS
		// This is a simplified approximation without K-weighting
		const db = 20 * Math.log10(Math.max(rms, 1e-10));
		return db - 0.691; // LUFS offset
	}

	/**
	 * Get phase correlation data
	 */
	getPhaseCorrelation(): PhaseCorrelation {
		this.leftAnalyser.getFloatTimeDomainData(this.leftTimeData);
		this.rightAnalyser.getFloatTimeDomainData(this.rightTimeData);

		let leftSum = 0;
		let rightSum = 0;
		let leftSquareSum = 0;
		let rightSquareSum = 0;
		let productSum = 0;

		// Calculate correlation
		for (let i = 0; i < this.leftTimeData.length; i++) {
			const left = this.leftTimeData[i];
			const right = this.rightTimeData[i];

			leftSum += left;
			rightSum += right;
			leftSquareSum += left * left;
			rightSquareSum += right * right;
			productSum += left * right;
		}

		const n = this.leftTimeData.length;
		const leftMean = leftSum / n;
		const rightMean = rightSum / n;

		// Pearson correlation coefficient
		const numerator = productSum - n * leftMean * rightMean;
		const denominator = Math.sqrt(
			(leftSquareSum - n * leftMean * leftMean) * (rightSquareSum - n * rightMean * rightMean)
		);

		const correlation = denominator !== 0 ? numerator / denominator : 0;

		// Calculate balance (L/R ratio)
		const leftRms = Math.sqrt(leftSquareSum / n);
		const rightRms = Math.sqrt(rightSquareSum / n);
		const balance = rightRms !== 0 ? leftRms / rightRms : 1;

		return {
			correlation: Math.max(-1, Math.min(1, correlation)),
			balance
		};
	}

	/**
	 * Reset metering state
	 */
	reset(): void {
		this.peakHold = 0;
		this.peakHoldTime = 0;
		this.rmsHistory = [];
	}

	/**
	 * Set peak hold duration
	 */
	setPeakHoldDuration(milliseconds: number): void {
		this.peakHoldDuration = milliseconds;
	}

	/**
	 * Set FFT size for analysis
	 */
	setFFTSize(size: number): void {
		this.analyser.fftSize = size;
		this.leftAnalyser.fftSize = size;
		this.rightAnalyser.fftSize = size;

		// Reinitialize buffers
		this.freqData = new Float32Array(this.analyser.frequencyBinCount);
		this.timeData = new Float32Array(this.analyser.fftSize);
		this.leftTimeData = new Float32Array(this.leftAnalyser.fftSize);
		this.rightTimeData = new Float32Array(this.rightAnalyser.fftSize);
	}

	/**
	 * Set smoothing time constant
	 */
	setSmoothingTimeConstant(value: number): void {
		this.analyser.smoothingTimeConstant = Math.max(0, Math.min(1, value));
		this.leftAnalyser.smoothingTimeConstant = this.analyser.smoothingTimeConstant;
		this.rightAnalyser.smoothingTimeConstant = this.analyser.smoothingTimeConstant;
	}

	/**
	 * Dispose analyzer
	 */
	dispose(): void {
		this.analyser.disconnect();
		this.splitter.disconnect();
		this.leftAnalyser.disconnect();
		this.rightAnalyser.disconnect();
	}
}
