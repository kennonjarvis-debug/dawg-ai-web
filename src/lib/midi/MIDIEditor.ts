/**
 * MIDI Editor - Piano Roll Implementation
 * Module 4: MIDI Editor
 *
 * Professional piano roll MIDI editor with drawing, selection, quantization
 * Conforms to API_CONTRACTS.md Module 4 specification
 */

import * as Tone from 'tone';
import type { UUID } from '../types/core';
import { EventBus } from '../events/eventBus';

export interface MIDINote {
  id: UUID;
  pitch: number; // MIDI note number (0-127)
  velocity: number; // 0-127
  time: number; // Start time in seconds
  duration: number; // Duration in seconds
}

export interface PianoRollConfig {
  width: number;
  height: number;
  pixelsPerBeat: number;
  lowestNote: number; // MIDI note number
  highestNote: number;
}

export type Tool = 'select' | 'draw' | 'erase';
export type GridDivision = '1/4' | '1/8' | '1/16' | '1/32' | '1/64' | '1/4T' | '1/8T' | '1/16T';

export interface MIDIPattern {
  notes: MIDINote[];
  duration: number;
  bpm: number;
  timeSignature: [number, number];
}

export class MIDIEditor {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private config: PianoRollConfig;
  private notes: MIDINote[] = [];
  private selectedNotes: Set<UUID> = new Set();
  private tool: Tool = 'draw';
  private gridDivision: GridDivision = '1/16';
  private snapToGrid: boolean = true;
  private snapToScale: boolean = false;
  private scale: number[] = [0, 2, 4, 5, 7, 9, 11]; // C major scale degrees
  private rootNote: number = 60; // C4

  // Drawing state
  private isDrawing: boolean = false;
  private dragStartX: number = 0;
  private dragStartY: number = 0;
  private selectionRect: { x1: number; y1: number; x2: number; y2: number } | null = null;

  // Note being edited
  private editingNote: { noteId: UUID; edge: 'start' | 'end' | 'move' } | null = null;

  constructor(canvas: HTMLCanvasElement, config: PianoRollConfig) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');
    this.ctx = ctx;
    this.config = config;

    this.setupEventListeners();
    this.render();
  }

  // ===================================
  // Note Operations
  // ===================================

  addNote(pitch: number, time: number, duration: number, velocity: number = 100): MIDINote {
    if (this.snapToScale) {
      pitch = this.quantizePitchToScale(pitch);
    }

    if (this.snapToGrid) {
      time = this.quantizeTime(time);
      duration = this.quantizeTime(duration);
    }

    const note: MIDINote = {
      id: this.generateId(),
      pitch,
      velocity,
      time,
      duration
    };

    this.notes.push(note);
    this.render();
    this.emitChange();

    EventBus.getInstance().emit('midi:note-added', { note });

    return note;
  }

  removeNote(id: UUID): void {
    this.notes = this.notes.filter(n => n.id !== id);
    this.selectedNotes.delete(id);
    this.render();
    this.emitChange();

    EventBus.getInstance().emit('midi:note-removed', { noteId: id });
  }

  updateNote(id: UUID, updates: Partial<MIDINote>): void {
    const note = this.notes.find(n => n.id === id);
    if (note) {
      Object.assign(note, updates);
      this.render();
      this.emitChange();

      EventBus.getInstance().emit('midi:note-updated', { note });
    }
  }

  // ===================================
  // Selection
  // ===================================

  selectNote(id: UUID, addToSelection: boolean = false): void {
    if (!addToSelection) {
      this.selectedNotes.clear();
    }
    this.selectedNotes.add(id);
    this.render();
  }

  selectNotesInRect(x1: number, y1: number, x2: number, y2: number): void {
    this.selectedNotes.clear();

    const time1 = this.pixelToTime(Math.min(x1, x2));
    const time2 = this.pixelToTime(Math.max(x1, x2));
    const pitch1 = this.pixelToPitch(Math.max(y1, y2));
    const pitch2 = this.pixelToPitch(Math.min(y1, y2));

    this.notes.forEach(note => {
      if (
        note.time >= time1 &&
        note.time + note.duration <= time2 &&
        note.pitch >= pitch1 &&
        note.pitch <= pitch2
      ) {
        this.selectedNotes.add(note.id);
      }
    });

    this.render();
  }

  getSelectedNotes(): UUID[] {
    return Array.from(this.selectedNotes);
  }

  clearSelection(): void {
    this.selectedNotes.clear();
    this.render();
  }

  // ===================================
  // Quantization
  // ===================================

  quantizeTime(time: number): number {
    const beatDuration = 60 / Tone.getTransport().bpm.value;
    const division = this.getDivisionValue();
    const snapInterval = beatDuration / division;

    return Math.round(time / snapInterval) * snapInterval;
  }

  quantizePitchToScale(pitch: number): number {
    const octave = Math.floor(pitch / 12);
    const pitchClass = pitch % 12;
    const rootPitchClass = this.rootNote % 12;

    // Find closest scale degree
    let closestDegree = this.scale[0];
    let minDistance = Math.abs(pitchClass - (rootPitchClass + this.scale[0]) % 12);

    for (const degree of this.scale) {
      const scalePitch = (rootPitchClass + degree) % 12;
      const distance = Math.abs(pitchClass - scalePitch);

      if (distance < minDistance) {
        minDistance = distance;
        closestDegree = degree;
      }
    }

    return octave * 12 + (rootPitchClass + closestDegree) % 12;
  }

  quantizeSelectedNotes(): void {
    this.selectedNotes.forEach(id => {
      const note = this.notes.find(n => n.id === id);
      if (note) {
        note.time = this.quantizeTime(note.time);
        note.duration = this.quantizeTime(note.duration);
        if (this.snapToScale) {
          note.pitch = this.quantizePitchToScale(note.pitch);
        }
      }
    });

    this.render();
    this.emitChange();
  }

  // ===================================
  // Coordinate Conversion
  // ===================================

  timeToPixel(time: number): number {
    const beatDuration = 60 / Tone.getTransport().bpm.value;
    const beats = time / beatDuration;
    return beats * this.config.pixelsPerBeat;
  }

  pixelToTime(pixel: number): number {
    const beatDuration = 60 / Tone.getTransport().bpm.value;
    const beats = pixel / this.config.pixelsPerBeat;
    return beats * beatDuration;
  }

  pitchToPixel(pitch: number): number {
    const noteRange = this.config.highestNote - this.config.lowestNote;
    const noteHeight = this.config.height / noteRange;
    return (this.config.highestNote - pitch) * noteHeight;
  }

  pixelToPitch(pixel: number): number {
    const noteRange = this.config.highestNote - this.config.lowestNote;
    const noteHeight = this.config.height / noteRange;
    return Math.floor(this.config.highestNote - pixel / noteHeight);
  }

  // ===================================
  // Rendering
  // ===================================

  render(): void {
    this.ctx.clearRect(0, 0, this.config.width, this.config.height);

    this.drawGrid();
    this.drawNotes();
    this.drawSelectionRect();
  }

  private drawGrid(): void {
    const beatDuration = 60 / Tone.getTransport().bpm.value;
    const division = this.getDivisionValue();
    const snapInterval = beatDuration / division;

    // Vertical lines (time grid)
    this.ctx.strokeStyle = '#333';
    this.ctx.lineWidth = 1;

    for (let time = 0; time < this.pixelToTime(this.config.width); time += snapInterval) {
      const x = this.timeToPixel(time);

      // Highlight beats
      const isBeat = Math.abs(time % beatDuration) < 0.001;
      this.ctx.strokeStyle = isBeat ? '#444' : '#2a2a2a';

      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.config.height);
      this.ctx.stroke();
    }

    // Horizontal lines (piano roll)
    const noteRange = this.config.highestNote - this.config.lowestNote;
    const noteHeight = this.config.height / noteRange;

    for (let pitch = this.config.lowestNote; pitch <= this.config.highestNote; pitch++) {
      const y = this.pitchToPixel(pitch);
      const isBlackKey = [1, 3, 6, 8, 10].includes(pitch % 12);
      const isC = pitch % 12 === 0;

      this.ctx.fillStyle = isBlackKey ? '#1a1a1a' : '#0a0a0a';
      this.ctx.fillRect(0, y, this.config.width, noteHeight);

      this.ctx.strokeStyle = isC ? '#444' : '#222';
      this.ctx.lineWidth = isC ? 2 : 1;
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.config.width, y);
      this.ctx.stroke();
    }
  }

  private drawNotes(): void {
    const noteRange = this.config.highestNote - this.config.lowestNote;
    const noteHeight = this.config.height / noteRange;

    this.notes.forEach(note => {
      const x = this.timeToPixel(note.time);
      const y = this.pitchToPixel(note.pitch);
      const width = this.timeToPixel(note.duration);
      const height = noteHeight;

      const isSelected = this.selectedNotes.has(note.id);

      // Note rectangle with velocity opacity
      const gradient = this.ctx.createLinearGradient(x, y, x + width, y);
      gradient.addColorStop(0, isSelected ? '#00d9ff' : '#ff006e');
      gradient.addColorStop(1, isSelected ? '#0088cc' : '#cc0055');

      this.ctx.fillStyle = gradient;
      this.ctx.globalAlpha = note.velocity / 127 * 0.7 + 0.3;
      this.ctx.fillRect(x + 1, y + 1, width - 2, height - 2);

      // Note border
      this.ctx.strokeStyle = isSelected ? '#ffffff' : '#000000';
      this.ctx.lineWidth = isSelected ? 2 : 1;
      this.ctx.globalAlpha = 1;
      this.ctx.strokeRect(x, y, width, height);
    });
  }

  private drawSelectionRect(): void {
    if (this.selectionRect) {
      const { x1, y1, x2, y2 } = this.selectionRect;
      const x = Math.min(x1, x2);
      const y = Math.min(y1, y2);
      const width = Math.abs(x2 - x1);
      const height = Math.abs(y2 - y1);

      this.ctx.strokeStyle = '#00d9ff';
      this.ctx.lineWidth = 2;
      this.ctx.setLineDash([5, 5]);
      this.ctx.strokeRect(x, y, width, height);
      this.ctx.setLineDash([]);

      this.ctx.fillStyle = 'rgba(0, 217, 255, 0.1)';
      this.ctx.fillRect(x, y, width, height);
    }
  }

  // ===================================
  // Event Handling
  // ===================================

  private setupEventListeners(): void {
    this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
    this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
    this.canvas.addEventListener('dblclick', this.handleDoubleClick.bind(this));
  }

  private handleMouseDown(e: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    this.dragStartX = x;
    this.dragStartY = y;
    this.isDrawing = true;

    if (this.tool === 'draw') {
      const pitch = this.pixelToPitch(y);
      const time = this.pixelToTime(x);
      const defaultDuration = this.pixelToTime(this.config.pixelsPerBeat / 4);
      this.addNote(pitch, time, defaultDuration, 100);
    } else if (this.tool === 'select') {
      // Check if clicking on existing note
      const clickedNote = this.getNoteAtPosition(x, y);

      if (clickedNote) {
        if (!this.selectedNotes.has(clickedNote.id) && !e.shiftKey) {
          this.selectedNotes.clear();
        }
        this.selectedNotes.add(clickedNote.id);
        this.render();
      } else {
        // Start selection rectangle
        if (!e.shiftKey) {
          this.selectedNotes.clear();
        }
        this.selectionRect = { x1: x, y1: y, x2: x, y2: y };
      }
    } else if (this.tool === 'erase') {
      const clickedNote = this.getNoteAtPosition(x, y);
      if (clickedNote) {
        this.removeNote(clickedNote.id);
      }
    }
  }

  private handleMouseMove(e: MouseEvent): void {
    if (!this.isDrawing) return;

    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (this.tool === 'select' && this.selectionRect) {
      this.selectionRect.x2 = x;
      this.selectionRect.y2 = y;
      this.selectNotesInRect(
        this.selectionRect.x1,
        this.selectionRect.y1,
        this.selectionRect.x2,
        this.selectionRect.y2
      );
      this.render();
    }
  }

  private handleMouseUp(): void {
    this.isDrawing = false;
    this.selectionRect = null;
    this.editingNote = null;
    this.render();
  }

  private handleDoubleClick(e: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const clickedNote = this.getNoteAtPosition(x, y);
    if (clickedNote) {
      this.removeNote(clickedNote.id);
    }
  }

  private getNoteAtPosition(x: number, y: number): MIDINote | null {
    for (const note of this.notes) {
      const noteX = this.timeToPixel(note.time);
      const noteY = this.pitchToPixel(note.pitch);
      const noteWidth = this.timeToPixel(note.duration);
      const noteHeight = this.config.height / (this.config.highestNote - this.config.lowestNote);

      if (x >= noteX && x <= noteX + noteWidth && y >= noteY && y <= noteY + noteHeight) {
        return note;
      }
    }
    return null;
  }

  // ===================================
  // Utilities
  // ===================================

  private getDivisionValue(): number {
    const divisions: Record<GridDivision, number> = {
      '1/4': 1,
      '1/8': 2,
      '1/16': 4,
      '1/32': 8,
      '1/64': 16,
      '1/4T': 3 / 4,
      '1/8T': 3 / 2,
      '1/16T': 3
    };
    return divisions[this.gridDivision];
  }

  private generateId(): UUID {
    return `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private emitChange(): void {
    this.canvas.dispatchEvent(
      new CustomEvent('notesChange', {
        detail: { notes: this.notes }
      })
    );

    EventBus.getInstance().emit('midi:pattern-changed', {
      notes: this.notes
    });
  }

  // ===================================
  // Public API (conforms to API_CONTRACTS.md)
  // ===================================

  setTool(tool: Tool): void {
    this.tool = tool;
  }

  setGridDivision(division: GridDivision): void {
    this.gridDivision = division;
    this.render();
  }

  setSnapToGrid(enabled: boolean): void {
    this.snapToGrid = enabled;
  }

  setSnapToScale(enabled: boolean): void {
    this.snapToScale = enabled;
  }

  setScale(scale: number[], rootNote: number): void {
    this.scale = scale;
    this.rootNote = rootNote;
  }

  getNotes(): MIDINote[] {
    return [...this.notes];
  }

  setNotes(notes: MIDINote[]): void {
    this.notes = notes;
    this.render();
  }
}
