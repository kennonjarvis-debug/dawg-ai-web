/**
 * PianoRoll - Instance 2 (Audio Widgets)
 *
 * Canvas-based pitch history visualizer
 * Shows pitch over time on a piano roll display
 */

'use client';

import { useEffect, useRef } from 'react';
import { usePitchDetection } from '@/src/core/usePitchDetection';
import styles from './PianoRoll.module.css';

interface PianoRollProps {
  trackId: string;
  audioContext: AudioContext | null;
  mediaStream: MediaStream | null;
  enabled?: boolean;
  targetNote?: string | null;
}

// Piano roll display constants
const MIDI_MIN = 36; // C2
const MIDI_MAX = 84; // C6
const MIDI_RANGE = MIDI_MAX - MIDI_MIN;
const NOTE_HEIGHT = 10; // pixels per semitone
const TIME_WINDOW = 10000; // Show last 10 seconds
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = MIDI_RANGE * NOTE_HEIGHT;

// Note names for labels
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export function PianoRoll({
  trackId,
  audioContext,
  mediaStream,
  enabled = true,
  targetNote = null,
}: PianoRollProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();

  // Initialize pitch detection
  const {
    currentPitch,
    pitchHistory,
    statistics,
    isActive,
    start,
    stop,
    clearHistory,
    setTargetNote,
  } = usePitchDetection({
    audioContext,
    mediaStream,
    enabled,
    updateInterval: 50, // 20fps
    targetNote,
  });

  // Start/stop detection based on enabled state
  useEffect(() => {
    if (enabled && !isActive && mediaStream && audioContext) {
      start();
    } else if (!enabled && isActive) {
      stop();
    }

    return () => {
      if (isActive) stop();
    };
  }, [enabled, mediaStream, audioContext, isActive, start, stop]);

  // Update target note when prop changes
  useEffect(() => {
    setTargetNote(targetNote);
  }, [targetNote, setTargetNote]);

  // Draw piano roll
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      const now = Date.now();

      // Clear canvas
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Draw piano roll grid (white/black keys)
      for (let midi = MIDI_MIN; midi <= MIDI_MAX; midi++) {
        const y = CANVAS_HEIGHT - (midi - MIDI_MIN) * NOTE_HEIGHT;
        const noteInOctave = midi % 12;
        const isBlackKey = [1, 3, 6, 8, 10].includes(noteInOctave);

        // Alternate row colors (lighter for white keys)
        ctx.fillStyle = isBlackKey ? '#1a1a1a' : '#151515';
        ctx.fillRect(0, y - NOTE_HEIGHT, CANVAS_WIDTH, NOTE_HEIGHT);

        // Draw note labels (C notes and target note)
        if (noteInOctave === 0) {
          const octave = Math.floor(midi / 12) - 1;
          ctx.fillStyle = '#666';
          ctx.font = '10px monospace';
          ctx.fillText(`C${octave}`, 5, y - 2);
        }
      }

      // Draw target note line if set
      if (targetNote && currentPitch?.midiNote !== null) {
        const targetMidi = currentPitch.midiNote; // Approximate
        if (targetMidi >= MIDI_MIN && targetMidi <= MIDI_MAX) {
          const y = CANVAS_HEIGHT - (targetMidi - MIDI_MIN) * NOTE_HEIGHT - NOTE_HEIGHT / 2;
          ctx.strokeStyle = 'rgba(59, 130, 246, 0.5)';
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 5]);
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(CANVAS_WIDTH, y);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }

      // Draw pitch history
      if (pitchHistory.length > 0) {
        ctx.strokeStyle = '#00e5ff';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Filter points in time window
        const visiblePoints = pitchHistory.filter(
          (point) => now - point.timestamp < TIME_WINDOW
        );

        ctx.beginPath();
        let firstPoint = true;

        visiblePoints.forEach((point) => {
          if (point.result.midiNote !== null) {
            const midi = point.result.midiNote;
            if (midi >= MIDI_MIN && midi <= MIDI_MAX) {
              const x =
                ((TIME_WINDOW - (now - point.timestamp)) / TIME_WINDOW) * CANVAS_WIDTH;
              const y = CANVAS_HEIGHT - (midi - MIDI_MIN) * NOTE_HEIGHT - NOTE_HEIGHT / 2;

              if (firstPoint) {
                ctx.moveTo(x, y);
                firstPoint = false;
              } else {
                ctx.lineTo(x, y);
              }
            }
          }
        });

        ctx.stroke();

        // Draw confidence indicators (dots)
        ctx.fillStyle = '#00e5ff';
        visiblePoints.forEach((point) => {
          if (point.result.midiNote !== null && point.result.confidence > 0.7) {
            const midi = point.result.midiNote;
            if (midi >= MIDI_MIN && midi <= MIDI_MAX) {
              const x =
                ((TIME_WINDOW - (now - point.timestamp)) / TIME_WINDOW) * CANVAS_WIDTH;
              const y = CANVAS_HEIGHT - (midi - MIDI_MIN) * NOTE_HEIGHT - NOTE_HEIGHT / 2;
              const radius = point.result.confidence * 3;

              ctx.beginPath();
              ctx.arc(x, y, radius, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        });

        // Draw current pitch indicator
        if (currentPitch?.midiNote !== null) {
          const midi = currentPitch.midiNote;
          if (midi >= MIDI_MIN && midi <= MIDI_MAX) {
            const x = CANVAS_WIDTH - 10;
            const y = CANVAS_HEIGHT - (midi - MIDI_MIN) * NOTE_HEIGHT - NOTE_HEIGHT / 2;

            ctx.fillStyle = currentPitch.inTune ? '#00ff88' : '#ff5555';
            ctx.beginPath();
            ctx.arc(x, y, 6, 0, Math.PI * 2);
            ctx.fill();

            // Draw note label
            ctx.fillStyle = currentPitch.inTune ? '#00ff88' : '#ff5555';
            ctx.font = 'bold 12px monospace';
            ctx.fillText(currentPitch.note || '', x + 15, y + 4);
          }
        }
      }

      // Request next frame
      animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [pitchHistory, currentPitch, targetNote]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>Pitch History (Last 10s)</h3>
        <div className={styles.controls}>
          <button onClick={clearHistory} className={styles.clearButton}>
            Clear
          </button>
        </div>
      </div>

      <div className={styles.canvasContainer}>
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className={styles.canvas}
        />
      </div>

      <div className={styles.stats}>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Avg Frequency:</span>
          <span className={styles.statValue}>
            {statistics.averageFrequency.toFixed(1)} Hz
          </span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>In-Tune:</span>
          <span className={styles.statValue}>
            {statistics.inTunePercentage.toFixed(0)}%
          </span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Most Common:</span>
          <span className={styles.statValue}>
            {statistics.mostCommonNote || 'N/A'}
          </span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Detections:</span>
          <span className={styles.statValue}>
            {statistics.successfulDetections}/{statistics.totalDetections}
          </span>
        </div>
      </div>
    </div>
  );
}
