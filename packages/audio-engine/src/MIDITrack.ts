/**
 * MIDITrack - Track for MIDI sequencing and synthesis
 *
 * Features:
 * - MIDI note sequencing
 * - Built-in synthesizer
 * - Pattern recording and playback
 * - Velocity and timing control
 */

import * as Tone from 'tone';
import { Track } from './Track';
import { TrackConfig, MIDITrackData, MIDINoteData } from './types/audio';

export class MIDITrack extends Track {
  private synth: Tone.PolySynth;
  private part: Tone.Part | null = null;
  private notes: MIDINoteData[] = [];
  private instrumentType: string;

  constructor(id: string, config: TrackConfig) {
    super(id, 'midi', config);

    // Initialize default synthesizer (polyphonic)
    this.synth = new Tone.PolySynth(Tone.Synth).connect(this.volumeNode);
    this.instrumentType = 'synth';
  }

  /**
   * Add a MIDI note to the sequence
   * @param note - Note data (note, time, duration, velocity)
   */
  addNote(note: MIDINoteData): void {
    this.notes.push(note);
    this.rebuildPart();
  }

  /**
   * Remove a note at specific index
   * @param index - Index of note to remove
   */
  removeNote(index: number): void {
    if (index >= 0 && index < this.notes.length) {
      this.notes.splice(index, 1);
      this.rebuildPart();
    }
  }

  /**
   * Clear all notes
   */
  clearNotes(): void {
    this.notes = [];
    this.rebuildPart();
  }

  /**
   * Get all notes
   */
  getNotes(): MIDINoteData[] {
    return [...this.notes];
  }

  /**
   * Set notes from array (replaces existing)
   */
  setNotes(notes: MIDINoteData[]): void {
    this.notes = [...notes];
    this.rebuildPart();
  }

  /**
   * Rebuild the Tone.Part with current notes
   */
  private rebuildPart(): void {
    // Dispose old part if exists
    if (this.part) {
      this.part.dispose();
    }

    // Create new part with notes
    this.part = new Tone.Part((time, value) => {
      this.synth.triggerAttackRelease(
        value.note,
        value.duration,
        time,
        value.velocity
      );
    }, this.notes.map(note => ({
      time: note.time,
      duration: note.duration,
      note: note.note,
      velocity: note.velocity,
    }))).start(0);
  }

  /**
   * Change synthesizer type
   * @param type - Synth type (synth, fmsynth, amsynth, membrane, etc.)
   */
  setSynthType(type: string): void {
    this.synth.disconnect();
    this.synth.dispose();

    switch (type.toLowerCase()) {
      case 'fmsynth':
        this.synth = new Tone.PolySynth(Tone.FMSynth) as Tone.PolySynth;
        break;
      case 'amsynth':
        this.synth = new Tone.PolySynth(Tone.AMSynth) as Tone.PolySynth;
        break;
      case 'membrane':
        this.synth = new Tone.PolySynth(Tone.MembraneSynth) as Tone.PolySynth;
        break;
      default:
        this.synth = new Tone.PolySynth(Tone.Synth);
    }

    this.synth.connect(this.volumeNode);
    this.instrumentType = type;
  }

  /**
   * Get current synth type
   */
  getSynthType(): string {
    return this.instrumentType;
  }

  /**
   * Manually trigger a note (for live input)
   * @param note - Note to play (e.g., "C4", 60)
   * @param duration - Note duration
   * @param velocity - Note velocity (0-1)
   */
  triggerNote(note: string | number, duration: Tone.Unit.Time = '8n', velocity: number = 1): void {
    this.synth.triggerAttackRelease(note, duration, undefined, velocity);
  }

  /**
   * Start recording MIDI input
   */
  startRecording(): void {
    // Clear existing notes for new recording
    this.clearNotes();
    // TODO: Implement MIDI input recording
    // This would require Web MIDI API integration
  }

  /**
   * Stop recording MIDI input
   */
  stopRecording(): void {
    // TODO: Implement stop recording
  }

  /**
   * Serialize track state
   */
  serialize(): MIDITrackData {
    return {
      id: this.id,
      type: 'midi',
      name: this.name,
      color: this.color,
      volume: this.getVolume(),
      pan: this.getPan(),
      mute: this.isMuted(),
      solo: this.isSolo(),
      midiNotes: this.notes,
      instrumentType: this.instrumentType,
      effects: this.getEffects().map((effect) => ({
        type: effect.name,
        params: {},
      })),
    };
  }

  /**
   * Deserialize and restore track state
   */
  async deserialize(data: MIDITrackData): Promise<void> {
    this.name = data.name;
    this.color = data.color;
    this.setVolume(data.volume);
    this.setPan(data.pan);
    this.setMute(data.mute);
    this.setSolo(data.solo);

    // Restore synth type
    if (data.instrumentType !== this.instrumentType) {
      this.setSynthType(data.instrumentType);
    }

    // Restore notes
    this.setNotes(data.midiNotes);

    // TODO: Deserialize and add effects
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    if (this.part) this.part.dispose();
    this.synth.dispose();
    super.dispose();
  }
}

export default MIDITrack;
