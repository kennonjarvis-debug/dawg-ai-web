/**
 * WaveformAnnotations - Instance 2 (Audio Widgets)
 *
 * AI-powered annotations on waveform moments
 * Shows contextual comments for pitch events, timing, technique issues
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { usePitchDetection } from '@/src/core/usePitchDetection';
import styles from './WaveformAnnotations.module.css';

interface WaveformAnnotationsProps {
  trackId?: string;
  audioContext?: AudioContext | null;
  mediaStream?: MediaStream | null;
  isRecording: boolean;
  targetNote?: string | null;
  waveformWidth?: number; // Width of waveform display for positioning
}

interface Annotation {
  id: string;
  timestamp: number; // Recording timestamp in ms
  type: 'pitch' | 'timing' | 'technique' | 'highlight';
  severity: 'info' | 'warning' | 'error' | 'success';
  message: string;
  icon: string;
  position?: number; // X position on waveform (0-1)
}

export function WaveformAnnotations({
  trackId,
  audioContext = null,
  mediaStream = null,
  isRecording,
  targetNote = null,
  waveformWidth = 800,
}: WaveformAnnotationsProps) {
  const {
    currentPitch,
    pitchHistory,
    statistics,
    isActive,
    start,
    stop,
    setTargetNote,
  } = usePitchDetection({
    audioContext,
    mediaStream,
    enabled: isRecording,
    updateInterval: 100,
    targetNote,
  });

  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [recordingStartTime, setRecordingStartTime] = useState<number | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const analysisIntervalRef = useRef<NodeJS.Timeout>();

  // Start/stop detection
  useEffect(() => {
    if (isRecording && !isActive && mediaStream && audioContext) {
      start();
      setRecordingStartTime(Date.now());
      setAnnotations([]);
    } else if (!isRecording && isActive) {
      stop();
      setRecordingStartTime(null);
    }
  }, [isRecording, mediaStream, audioContext, isActive, start, stop]);

  // Update target note
  useEffect(() => {
    setTargetNote(targetNote);
  }, [targetNote, setTargetNote]);

  // Track recording duration
  useEffect(() => {
    if (!isRecording) {
      setRecordingDuration(0);
      return;
    }

    const interval = setInterval(() => {
      setRecordingDuration((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isRecording]);

  // Analyze pitch history and generate annotations
  useEffect(() => {
    if (!isRecording || pitchHistory.length < 5) return;

    const analyzeAndAnnotate = () => {
      const now = Date.now();
      const recentHistory = pitchHistory.slice(-20); // Last 20 points (~2 seconds)

      // Detect pitch issues
      const outOfTuneStreak = recentHistory.slice(-5).every((p) => !p.result.inTune);
      if (outOfTuneStreak) {
        addAnnotation({
          timestamp: now,
          type: 'pitch',
          severity: 'warning',
          message: 'Pitch drift detected',
          icon: '⚠️',
        });
      }

      // Detect excellent pitch streak
      const inTuneStreak = recentHistory.slice(-10).every((p) => p.result.inTune);
      if (inTuneStreak) {
        addAnnotation({
          timestamp: now,
          type: 'pitch',
          severity: 'success',
          message: 'Excellent pitch control',
          icon: '✨',
        });
      }

      // Detect pitch jumps (large interval changes)
      if (recentHistory.length >= 2) {
        const lastTwo = recentHistory.slice(-2);
        if (lastTwo[0].result.midiNote !== null && lastTwo[1].result.midiNote !== null) {
          const interval = Math.abs(lastTwo[1].result.midiNote - lastTwo[0].result.midiNote);
          if (interval > 7) { // More than a 5th
            addAnnotation({
              timestamp: now,
              type: 'technique',
              severity: 'info',
              message: `Large interval: ${interval} semitones`,
              icon: '🎵',
            });
          }
        }
      }

      // Detect vibrato (frequency oscillation)
      const frequencies = recentHistory
        .map((p) => p.result.frequency)
        .filter((f): f is number => f !== null);

      if (frequencies.length >= 10) {
        const avgFreq = frequencies.reduce((a, b) => a + b, 0) / frequencies.length;
        let crossings = 0;
        for (let i = 1; i < frequencies.length; i++) {
          if (
            (frequencies[i - 1] < avgFreq && frequencies[i] > avgFreq) ||
            (frequencies[i - 1] > avgFreq && frequencies[i] < avgFreq)
          ) {
            crossings++;
          }
        }

        // If frequency crosses average 4+ times in 1 second, likely vibrato
        if (crossings >= 4) {
          addAnnotation({
            timestamp: now,
            type: 'technique',
            severity: 'success',
            message: 'Vibrato detected',
            icon: '🎶',
          });
        }
      }

      // Detect low confidence (volume issues)
      const lowConfidence = recentHistory.slice(-5).every((p) => p.result.confidence < 0.4);
      if (lowConfidence) {
        addAnnotation({
          timestamp: now,
          type: 'technique',
          severity: 'warning',
          message: 'Increase volume for clarity',
          icon: '🔊',
        });
      }

      // Detect sustained note (same MIDI note for 1+ seconds)
      const sustainedNote = recentHistory.slice(-10).every(
        (p, i, arr) =>
          p.result.midiNote !== null &&
          arr[0].result.midiNote !== null &&
          p.result.midiNote === arr[0].result.midiNote
      );

      if (sustainedNote && recentHistory[0].result.inTune) {
        addAnnotation({
          timestamp: now,
          type: 'highlight',
          severity: 'success',
          message: 'Strong sustained note',
          icon: '🎯',
        });
      }
    };

    // Run analysis every 2 seconds
    analysisIntervalRef.current = setInterval(analyzeAndAnnotate, 2000);

    return () => {
      if (analysisIntervalRef.current) {
        clearInterval(analysisIntervalRef.current);
      }
    };
  }, [isRecording, pitchHistory]);

  const addAnnotation = (annotation: Omit<Annotation, 'id' | 'position'>) => {
    const id = `${annotation.timestamp}-${Math.random()}`;
    const position = recordingStartTime
      ? Math.min(1, (annotation.timestamp - recordingStartTime) / (recordingDuration * 1000 || 1))
      : 0;

    const newAnnotation: Annotation = {
      id,
      position,
      ...annotation,
    };

    setAnnotations((prev) => {
      // Limit to 20 annotations to prevent clutter
      const updated = [...prev, newAnnotation];
      if (updated.length > 20) {
        return updated.slice(-20);
      }
      return updated;
    });
  };

  const getSeverityColor = (severity: Annotation['severity']): string => {
    switch (severity) {
      case 'success':
        return '#00ff88';
      case 'info':
        return '#00e5ff';
      case 'warning':
        return '#ffaa00';
      case 'error':
        return '#ff5555';
    }
  };

  // Not recording
  if (!isRecording) {
    return (
      <div className={styles.container}>
        <div className={styles.inactive}>
          <div className={styles.inactiveIcon}>📝</div>
          <div className={styles.inactiveText}>
            Start recording to see AI-powered annotations
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.title}>AI Annotations</div>
        <div className={styles.count}>{annotations.length} notes</div>
      </div>

      {/* Waveform Overlay (visual representation) */}
      <div className={styles.waveformOverlay} style={{ width: waveformWidth }}>
        {annotations.map((annotation) => (
          <div
            key={annotation.id}
            className={styles.annotationMarker}
            style={{
              left: `${(annotation.position || 0) * 100}%`,
              borderColor: getSeverityColor(annotation.severity),
            }}
            title={annotation.message}
          >
            <div
              className={styles.markerIcon}
              style={{ color: getSeverityColor(annotation.severity) }}
            >
              {annotation.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Annotations List */}
      <div className={styles.annotationsList}>
        {annotations.length === 0 && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>⏳</div>
            <div className={styles.emptyText}>Analyzing your performance...</div>
          </div>
        )}

        {annotations.slice().reverse().map((annotation) => (
          <div
            key={annotation.id}
            className={`${styles.annotationItem} ${styles[annotation.severity]}`}
            style={{ borderLeftColor: getSeverityColor(annotation.severity) }}
          >
            <div className={styles.annotationIcon}>{annotation.icon}</div>
            <div className={styles.annotationContent}>
              <div className={styles.annotationMessage}>{annotation.message}</div>
              <div className={styles.annotationMeta}>
                <span className={styles.annotationType}>{annotation.type}</span>
                <span className={styles.annotationTime}>
                  {Math.floor((annotation.timestamp - (recordingStartTime || 0)) / 1000)}s
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      {annotations.length > 0 && (
        <div className={styles.summary}>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Success</span>
            <span className={styles.summaryValue} style={{ color: '#00ff88' }}>
              {annotations.filter((a) => a.severity === 'success').length}
            </span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Warnings</span>
            <span className={styles.summaryValue} style={{ color: '#ffaa00' }}>
              {annotations.filter((a) => a.severity === 'warning').length}
            </span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Info</span>
            <span className={styles.summaryValue} style={{ color: '#00e5ff' }}>
              {annotations.filter((a) => a.severity === 'info').length}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
