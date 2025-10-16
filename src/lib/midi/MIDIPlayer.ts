/**
 * MIDI Player
 * Module 4: MIDI Editor
 *
 * Integrates MIDI notes with Audio Engine for playback
 */

import * as Tone from 'tone';
import type { MIDINote, MIDIPattern } from './MIDIEditor';

export class MIDIPlayer {
  private synth: Tone.PolySynth;
  private part: Tone.Part | null = null;
  private notes: MIDINote[] = [];

  constructor() {
    // Create a polyphonic synthesizer
    this.synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: {
        type: 'triangle'
      },
      envelope: {
        attack: 0.005,
        decay: 0.1,
        sustain: 0.3,
        release: 1
      }
    }).toDestination();
  }

  /**
   * Load MIDI notes for playback
   */
  setNotes(notes: MIDINote[]): void {
    this.notes = notes;
    this.updatePart();
  }

  /**
   * Update the Tone.Part with current notes
   */
  private updatePart(): void {
    // Clear existing part
    if (this.part) {
      this.part.dispose();
      this.part = null;
    }

    if (this.notes.length === 0) {
      return;
    }

    // Convert MIDI notes to Tone.Part events
    const events: Array<{ time: number; note: string; duration: number; velocity: number }> = [];

    this.notes.forEach(note => {
      events.push({
        time: note.time,
        note: Tone.Frequency(note.pitch, 'midi').toNote(),
        duration: note.duration,
        velocity: note.velocity / 127
      });
    });

    // Create new part
    this.part = new Tone.Part((time, event) => {
      this.synth.triggerAttackRelease(
        event.note,
        event.duration,
        time,
        event.velocity
      );
    }, events);

    this.part.loop = false;
  }

  /**
   * Start playback
   */
  start(time?: number): void {
    if (this.part) {
      this.part.start(time);
    }
  }

  /**
   * Stop playback
   */
  stop(time?: number): void {
    if (this.part) {
      this.part.stop(time);
    }
  }

  /**
   * Connect to a destination
   */
  connect(destination: Tone.ToneAudioNode): void {
    this.synth.disconnect();
    this.synth.connect(destination);
  }

  /**
   * Set volume
   */
  setVolume(db: number): void {
    this.synth.volume.value = db;
  }

  /**
   * Trigger a single note (for preview/testing)
   */
  triggerNote(pitch: number, duration: number = 0.5, velocity: number = 100): void {
    const note = Tone.Frequency(pitch, 'midi').toNote();
    const vel = velocity / 127;
    this.synth.triggerAttackRelease(note, duration, undefined, vel);
  }

  /**
   * Export MIDI pattern
   */
  exportPattern(): MIDIPattern {
    return {
      notes: this.notes,
      duration: this.notes.reduce((max, note) => Math.max(max, note.time + note.duration), 0),
      bpm: Tone.getTransport().bpm.value,
      timeSignature: [4, 4]
    };
  }

  /**
   * Import MIDI pattern
   */
  importPattern(pattern: MIDIPattern): void {
    this.notes = pattern.notes;
    Tone.getTransport().bpm.value = pattern.bpm;
    this.updatePart();
  }

  /**
   * Cleanup
   */
  dispose(): void {
    if (this.part) {
      this.part.dispose();
      this.part = null;
    }
    this.synth.dispose();
  }
}
