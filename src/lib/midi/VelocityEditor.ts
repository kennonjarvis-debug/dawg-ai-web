/**
 * Velocity Editor
 * Module 4: MIDI Editor
 *
 * Displays and edits MIDI note velocities
 */

import type { MIDINote, UUID } from './MIDIEditor';

export class VelocityEditor {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private notes: MIDINote[] = [];
  private selectedNotes: Set<UUID> = new Set();
  private pixelsPerBeat: number;
  private isDragging: boolean = false;

  constructor(canvas: HTMLCanvasElement, pixelsPerBeat: number) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');
    this.ctx = ctx;
    this.pixelsPerBeat = pixelsPerBeat;

    this.setupEventListeners();
  }

  setNotes(notes: MIDINote[], selectedNotes: Set<UUID>): void {
    this.notes = notes;
    this.selectedNotes = selectedNotes;
    this.render();
  }

  render(): void {
    const width = this.canvas.width;
    const height = this.canvas.height;

    this.ctx.clearRect(0, 0, width, height);

    // Draw background
    this.ctx.fillStyle = '#0a0a0a';
    this.ctx.fillRect(0, 0, width, height);

    // Draw grid lines
    this.ctx.strokeStyle = '#2a2a2a';
    this.ctx.lineWidth = 1;

    // Horizontal velocity lines
    for (let v = 0; v <= 127; v += 32) {
      const y = height - (v / 127) * height;
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(width, y);
      this.ctx.stroke();
    }

    // Draw velocity bars
    this.notes.forEach(note => {
      const x = this.timeToPixel(note.time);
      const barWidth = this.timeToPixel(note.duration);
      const barHeight = (note.velocity / 127) * height;
      const y = height - barHeight;

      const isSelected = this.selectedNotes.has(note.id);

      // Velocity bar
      const gradient = this.ctx.createLinearGradient(x, y, x, height);
      gradient.addColorStop(0, isSelected ? '#00d9ff' : '#ff006e');
      gradient.addColorStop(1, isSelected ? '#00a0cc' : '#cc0044');

      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(x, y, barWidth, barHeight);

      // Border
      this.ctx.strokeStyle = isSelected ? '#ffffff' : '#000000';
      this.ctx.lineWidth = isSelected ? 2 : 1;
      this.ctx.strokeRect(x, y, barWidth, barHeight);
    });
  }

  private timeToPixel(time: number): number {
    const bpm = 120; // TODO: Get from Transport
    const beatDuration = 60 / bpm;
    const beats = time / beatDuration;
    return beats * this.pixelsPerBeat;
  }

  private pixelToTime(pixel: number): number {
    const bpm = 120; // TODO: Get from Transport
    const beatDuration = 60 / bpm;
    const beats = pixel / this.pixelsPerBeat;
    return beats * beatDuration;
  }

  private pixelToVelocity(pixel: number): number {
    const height = this.canvas.height;
    return Math.round((1 - pixel / height) * 127);
  }

  private setupEventListeners(): void {
    this.canvas.addEventListener('mousedown', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Find note at position
      const clickedNote = this.getNoteAtPosition(x);
      if (clickedNote) {
        this.isDragging = true;
        clickedNote.velocity = Math.max(1, Math.min(127, this.pixelToVelocity(y)));
        this.render();
        this.emitChange();
      }
    });

    this.canvas.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;

      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const note = this.getNoteAtPosition(x);
      if (note) {
        note.velocity = Math.max(1, Math.min(127, this.pixelToVelocity(y)));
        this.render();
        this.emitChange();
      }
    });

    this.canvas.addEventListener('mouseup', () => {
      this.isDragging = false;
    });
  }

  private getNoteAtPosition(x: number): MIDINote | null {
    for (const note of this.notes) {
      const noteX = this.timeToPixel(note.time);
      const noteWidth = this.timeToPixel(note.duration);

      if (x >= noteX && x <= noteX + noteWidth) {
        return note;
      }
    }
    return null;
  }

  private emitChange(): void {
    this.canvas.dispatchEvent(
      new CustomEvent('velocityChange', {
        detail: { notes: this.notes }
      })
    );
  }
}
