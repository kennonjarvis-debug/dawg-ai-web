/**
 * Recorder - Export and bounce functionality
 *
 * Features:
 * - Real-time recording of master output
 * - Offline rendering (faster than real-time)
 * - Multiple export formats (WAV, MP3)
 * - Custom sample rate and bit depth
 */

import * as Tone from 'tone';
import { ExportOptions } from './types/audio';

export class Recorder {
  private source: Tone.ToneAudioNode;
  private recorder: Tone.Recorder | null = null;
  private isRecording: boolean = false;

  constructor(source: Tone.ToneAudioNode) {
    this.source = source;
  }

  /**
   * Start recording the audio source
   */
  startRecording(): void {
    if (this.isRecording) {
      throw new Error('Already recording');
    }

    this.recorder = new Tone.Recorder();
    this.source.connect(this.recorder);
    this.recorder.start();
    this.isRecording = true;
  }

  /**
   * Stop recording and return the audio blob
   */
  async stopRecording(): Promise<Blob> {
    if (!this.recorder || !this.isRecording) {
      throw new Error('Not currently recording');
    }

    const blob = await this.recorder.stop();
    this.recorder.dispose();
    this.recorder = null;
    this.isRecording = false;

    return blob;
  }

  /**
   * Export audio with custom options
   * @param options - Export configuration
   */
  async export(options: ExportOptions = { format: 'wav' }): Promise<Blob> {
    const { format = 'wav', duration } = options;

    // Start recording
    this.startRecording();

    // If duration specified, stop after that time
    if (duration) {
      await new Promise<void>((resolve) => {
        setTimeout(() => {
          resolve();
        }, duration * 1000);
      });
    }

    // Stop recording and get blob
    const blob = await this.stopRecording();

    // Convert format if needed
    if (format === 'wav') {
      return await this.convertToWav(blob, options);
    } else if (format === 'mp3') {
      // TODO: Implement MP3 encoding (requires additional library)
      throw new Error('MP3 export not yet implemented');
    }

    return blob;
  }

  /**
   * Convert audio blob to WAV format
   * @param blob - Source audio blob
   * @param options - Export options
   */
  private async convertToWav(blob: Blob, options: ExportOptions): Promise<Blob> {
    // Decode audio data
    const arrayBuffer = await blob.arrayBuffer();
    const audioBuffer = await Tone.context.decodeAudioData(arrayBuffer);

    // Get export parameters
    const sampleRate = options.sampleRate || audioBuffer.sampleRate;
    const bitDepth = options.bitDepth || 16;

    // Resample if needed
    let processedBuffer = audioBuffer;
    if (sampleRate !== audioBuffer.sampleRate) {
      processedBuffer = await this.resample(audioBuffer, sampleRate);
    }

    // Create WAV file
    const wavBuffer = this.audioBufferToWav(processedBuffer, bitDepth);
    return new Blob([wavBuffer], { type: 'audio/wav' });
  }

  /**
   * Resample audio buffer to new sample rate
   * @param buffer - Source buffer
   * @param targetSampleRate - Target sample rate
   */
  private async resample(
    buffer: AudioBuffer,
    targetSampleRate: number
  ): Promise<AudioBuffer> {
    const offlineContext = new OfflineAudioContext(
      buffer.numberOfChannels,
      (buffer.duration * targetSampleRate),
      targetSampleRate
    );

    const source = offlineContext.createBufferSource();
    source.buffer = buffer;
    source.connect(offlineContext.destination);
    source.start(0);

    return await offlineContext.startRendering();
  }

  /**
   * Convert AudioBuffer to WAV format
   * @param buffer - Audio buffer
   * @param bitDepth - Bit depth (16, 24, or 32)
   */
  private audioBufferToWav(buffer: AudioBuffer, bitDepth: 16 | 24 | 32): ArrayBuffer {
    const numberOfChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const length = buffer.length * numberOfChannels * (bitDepth / 8);

    const wavBuffer = new ArrayBuffer(44 + length);
    const view = new DataView(wavBuffer);

    // WAV header
    this.writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + length, true);
    this.writeString(view, 8, 'WAVE');
    this.writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true); // PCM format
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, numberOfChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numberOfChannels * (bitDepth / 8), true);
    view.setUint16(32, numberOfChannels * (bitDepth / 8), true);
    view.setUint16(34, bitDepth, true);
    this.writeString(view, 36, 'data');
    view.setUint32(40, length, true);

    // Write audio data
    const offset = 44;
    const channels: Float32Array[] = [];
    for (let i = 0; i < numberOfChannels; i++) {
      channels.push(buffer.getChannelData(i));
    }

    let index = 0;
    for (let i = 0; i < buffer.length; i++) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const sample = Math.max(-1, Math.min(1, channels[channel][i]));

        if (bitDepth === 16) {
          view.setInt16(offset + index, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
          index += 2;
        } else if (bitDepth === 24) {
          const value = sample < 0 ? sample * 0x800000 : sample * 0x7FFFFF;
          view.setUint8(offset + index, value & 0xFF);
          view.setUint8(offset + index + 1, (value >> 8) & 0xFF);
          view.setUint8(offset + index + 2, (value >> 16) & 0xFF);
          index += 3;
        } else if (bitDepth === 32) {
          view.setInt32(offset + index, sample < 0 ? sample * 0x80000000 : sample * 0x7FFFFFFF, true);
          index += 4;
        }
      }
    }

    return wavBuffer;
  }

  /**
   * Write string to DataView
   */
  private writeString(view: DataView, offset: number, string: string): void {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  /**
   * Check if currently recording
   */
  isCurrentlyRecording(): boolean {
    return this.isRecording;
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    if (this.recorder) {
      this.recorder.dispose();
      this.recorder = null;
    }
    this.isRecording = false;
  }
}

export default Recorder;
