/**
 * RecordingManager - DAWG AI Audio Engine
 * Professional loop recording with automatic take management
 * @module audio/recording/RecordingManager
 */

import * as Tone from 'tone';
import type {
	RecordingOptions,
	Take,
	TakeMetrics,
	RecordingState,
	CountInState
} from './types';
import type { UUID } from '../../types/core';
import { eventBus } from '../../events/eventBus';

/**
 * Recording Manager - Handles loop recording with takes
 */
export class RecordingManager {
	private recorder: Tone.Recorder | null = null;
	private takes: Take[] = [];
	private currentPassIndex: number = 0;
	private state: RecordingState = 'idle';
	private loopStartBar: number = 0;
	private loopEndBar: number = 0;
	private recordingTrackId: UUID | null = null;
	private countInTimer: NodeJS.Timeout | null = null;
	private metronome: Tone.MembraneSynth;
	private metronomeGain: Tone.Gain;

	constructor() {
		// Create metronome
		this.metronome = new Tone.MembraneSynth({
			pitchDecay: 0.05,
			octaves: 10,
			oscillator: { type: 'sine' },
			envelope: {
				attack: 0.001,
				decay: 0.3,
				sustain: 0,
				release: 0.01
			}
		});

		this.metronomeGain = new Tone.Gain(0.3);
		this.metronome.connect(this.metronomeGain);
		this.metronomeGain.toDestination();
	}

	/**
	 * Start loop recording
	 */
	async startLoopRecording(opts: RecordingOptions): Promise<{ trackId: UUID }> {
		if (this.state !== 'idle') {
			throw new Error('Recording already in progress');
		}

		// Reset state
		this.takes = [];
		this.currentPassIndex = 0;
		this.loopStartBar = 0;
		this.loopEndBar = opts.bars;

		// Set up loop region
		Tone.getTransport().loop = true;
		Tone.getTransport().loopStart = `${this.loopStartBar}:0:0`;
		Tone.getTransport().loopEnd = `${this.loopEndBar}:0:0`;

		// Generate track ID
		this.recordingTrackId = this.generateId();

		// Start count-in
		await this.startCountIn(opts.countInBars || 1, opts.metronomeVolume || 0.3);

		// After count-in, start recording
		this.state = 'recording';

		// Set up recorder
		await this.setupRecorder();

		// Listen for loop events
		this.setupLoopListeners();

		// Start transport
		Tone.getTransport().start();

		eventBus.emit('recording:started', {
			trackId: this.recordingTrackId,
			bars: opts.bars
		});

		return { trackId: this.recordingTrackId! };
	}

	/**
	 * Stop recording
	 */
	async stopRecording(): Promise<Take[]> {
		if (this.state !== 'recording') {
			throw new Error('No recording in progress');
		}

		this.state = 'processing';

		// Stop transport
		Tone.getTransport().stop();

		// Stop recorder and get final take
		if (this.recorder) {
			const recording = await this.recorder.stop();
			await this.processTake(recording, this.currentPassIndex);
			this.recorder.dispose();
			this.recorder = null;
		}

		// Disable loop
		Tone.getTransport().loop = false;

		this.state = 'idle';

		eventBus.emit('recording:stopped', {
			trackId: this.recordingTrackId,
			takeCount: this.takes.length
		});

		return this.takes;
	}

	/**
	 * Get all takes
	 */
	getTakes(): Take[] {
		return [...this.takes];
	}

	/**
	 * Get current recording state
	 */
	getState(): RecordingState {
		return this.state;
	}

	/**
	 * Get current pass index
	 */
	getCurrentPassIndex(): number {
		return this.currentPassIndex;
	}

	/**
	 * Set metronome volume
	 */
	setMetronomeVolume(volume: number): void {
		this.metronomeGain.gain.value = Math.max(0, Math.min(1, volume));
	}

	/**
	 * Start count-in
	 */
	private async startCountIn(bars: number, volume: number): Promise<void> {
		this.state = 'counting-in';
		this.setMetronomeVolume(volume);

		const beatsPerBar = 4; // TODO: Get from time signature
		const totalBeats = bars * beatsPerBar;

		return new Promise((resolve) => {
			let beatCount = 0;

			// Schedule metronome clicks
			const scheduleId = Tone.getTransport().scheduleRepeat(
				(time) => {
					const bar = Math.floor(beatCount / beatsPerBar) + 1;
					const beat = (beatCount % beatsPerBar) + 1;

					// Higher pitch on downbeat
					const pitch = beat === 1 ? 'C5' : 'C4';
					this.metronome.triggerAttackRelease(pitch, '8n', time);

					// Emit count-in state
					eventBus.emit('recording:countIn', {
						bar,
						beat,
						total: totalBeats,
						remaining: totalBeats - beatCount - 1
					});

					beatCount++;

					if (beatCount >= totalBeats) {
						Tone.getTransport().clear(scheduleId);
						resolve();
					}
				},
				'4n', // Every quarter note
				'0:0:0'
			);

			// Start transport for count-in
			Tone.getTransport().start();
		});
	}

	/**
	 * Set up recorder
	 */
	private async setupRecorder(): Promise<void> {
		// Get microphone input
		const stream = await navigator.mediaDevices.getUserMedia({
			audio: {
				echoCancellation: false,
				noiseSuppression: false,
				autoGainControl: false,
				sampleRate: 48000
			}
		});

		// Create recorder
		this.recorder = new Tone.Recorder();

		// Connect microphone to Tone.js
		const source = Tone.context.createMediaStreamSource(stream);
		const toneInput = new Tone.Gain(1);
		source.connect(toneInput.input as AudioNode);
		toneInput.connect(this.recorder);

		// Start recording
		await this.recorder.start();
	}

	/**
	 * Set up loop listeners
	 */
	private setupLoopListeners(): void {
		// Listen for loop end
		const loopEndTime = Tone.Time(`${this.loopEndBar}:0:0`).toSeconds();

		Tone.getTransport().scheduleRepeat(
			async (time) => {
				if (this.state === 'recording' && this.recorder) {
					// Stop current take
					const recording = await this.recorder.stop();

					// Process take
					await this.processTake(recording, this.currentPassIndex);

					// Increment pass index
					this.currentPassIndex++;

					// Start new recording for next pass
					await this.recorder.start();

					eventBus.emit('recording:loopComplete', {
						passIndex: this.currentPassIndex,
						totalTakes: this.takes.length
					});
				}
			},
			`${this.loopEndBar}m`,
			'0:0:0'
		);
	}

	/**
	 * Process take
	 */
	private async processTake(recording: Blob, passIndex: number): Promise<void> {
		// Convert Blob to AudioBuffer
		const arrayBuffer = await recording.arrayBuffer();
		const audioBuffer = await Tone.context.decodeAudioData(arrayBuffer);

		// Calculate metrics
		const metrics = this.calculateMetrics(audioBuffer);

		// Create take
		const take: Take = {
			id: this.generateId(),
			passIndex,
			startBar: this.loopStartBar,
			endBar: this.loopEndBar,
			clip: audioBuffer,
			metrics,
			timestamp: new Date()
		};

		this.takes.push(take);

		eventBus.emit('recording:takeCreated', {
			takeId: take.id,
			passIndex,
			metrics
		});
	}

	/**
	 * Calculate take metrics
	 */
	private calculateMetrics(buffer: AudioBuffer): TakeMetrics {
		const channelData = buffer.getChannelData(0);
		const length = channelData.length;

		// Calculate peak
		let peak = 0;
		let sumSquares = 0;

		for (let i = 0; i < length; i++) {
			const sample = Math.abs(channelData[i]);
			peak = Math.max(peak, sample);
			sumSquares += sample * sample;
		}

		// Calculate RMS
		const rms = Math.sqrt(sumSquares / length);

		// Convert to dB
		const peakDb = 20 * Math.log10(Math.max(peak, 1e-10));
		const rmsDb = 20 * Math.log10(Math.max(rms, 1e-10));

		// Calculate noise floor (simplified - use lowest 10% of samples)
		const sortedSamples = Array.from(channelData)
			.map(Math.abs)
			.sort((a, b) => a - b);
		const noiseFloorIndex = Math.floor(length * 0.1);
		const noiseFloor = sortedSamples[noiseFloorIndex];
		const noiseFloorDb = 20 * Math.log10(Math.max(noiseFloor, 1e-10));

		// SNR (Signal to Noise Ratio)
		const snr = peakDb - noiseFloorDb;

		// Timing error (simplified - detect beat grid alignment)
		// In production, this would analyze transients and compare to expected beat positions
		const timingErrorMs = this.calculateTimingError(buffer);

		return {
			peakDb,
			rmsDb,
			snr,
			timingErrorMs
		};
	}

	/**
	 * Calculate timing error (simplified)
	 */
	private calculateTimingError(buffer: AudioBuffer): number {
		// This is a simplified version
		// In production, you'd use onset detection and compare to beat grid
		const bpm = Tone.getTransport().bpm.value;
		const beatDuration = 60 / bpm;

		// Detect first transient
		const channelData = buffer.getChannelData(0);
		const threshold = 0.1;

		let firstTransient = -1;
		for (let i = 1; i < channelData.length; i++) {
			if (
				Math.abs(channelData[i]) > threshold &&
				Math.abs(channelData[i]) > Math.abs(channelData[i - 1])
			) {
				firstTransient = i;
				break;
			}
		}

		if (firstTransient === -1) {
			return 0; // No transient detected
		}

		// Calculate timing error
		const transientTime = firstTransient / buffer.sampleRate;
		const expectedBeatTime = Math.round(transientTime / beatDuration) * beatDuration;
		const timingErrorSec = Math.abs(transientTime - expectedBeatTime);

		return timingErrorSec * 1000; // Convert to ms
	}

	/**
	 * Generate unique ID
	 */
	private generateId(): UUID {
		return `take-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
	}

	/**
	 * Dispose resources
	 */
	dispose(): void {
		if (this.recorder) {
			this.recorder.dispose();
			this.recorder = null;
		}

		if (this.countInTimer) {
			clearTimeout(this.countInTimer);
			this.countInTimer = null;
		}

		this.metronome.dispose();
		this.metronomeGain.dispose();
	}
}
