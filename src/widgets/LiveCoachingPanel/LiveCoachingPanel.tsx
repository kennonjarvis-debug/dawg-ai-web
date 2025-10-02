/**
 * LiveCoachingPanel - Instance 2 (Audio Widgets)
 *
 * Real-time vocal coaching feedback overlay during recording
 * Shows live pitch accuracy, timing cues, breathing reminders
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePitchDetection } from '@/src/core/usePitchDetection';
import styles from './LiveCoachingPanel.module.css';

interface LiveCoachingPanelProps {
  trackId?: string;
  audioContext?: AudioContext | null;
  mediaStream?: MediaStream | null;
  isRecording: boolean;
  bpm?: number;
  targetNote?: string | null;
}

interface CoachingFeedback {
  type: 'success' | 'warning' | 'tip' | 'error';
  message: string;
  timestamp: number;
  priority: number; // 1-5, higher = more important
}

export function LiveCoachingPanel({
  trackId,
  audioContext = null,
  mediaStream = null,
  isRecording,
  bpm = 120,
  targetNote = null,
}: LiveCoachingPanelProps) {
  const {
    currentPitch,
    statistics,
    isActive,
    start,
    stop,
    setTargetNote,
  } = usePitchDetection({
    audioContext,
    mediaStream,
    enabled: isRecording,
    updateInterval: 100, // 10fps for coaching
    targetNote,
  });

  const [feedback, setFeedback] = useState<CoachingFeedback[]>([]);
  const [currentTip, setCurrentTip] = useState<string>('');
  const [breathingReminder, setBreathingReminder] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);

  // Start/stop detection with recording
  useEffect(() => {
    if (isRecording && !isActive && mediaStream && audioContext) {
      start();
      setRecordingDuration(0);
    } else if (!isRecording && isActive) {
      stop();
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

  // Breathing reminder every 8 bars (32 beats at 4/4)
  useEffect(() => {
    if (!isRecording) return;

    const beatsPerReminder = 32;
    const msPerBeat = (60 / bpm) * 1000;
    const reminderInterval = beatsPerReminder * msPerBeat;

    const interval = setInterval(() => {
      setBreathingReminder(true);
      addFeedback({
        type: 'tip',
        message: 'Take a breath',
        timestamp: Date.now(),
        priority: 3,
      });

      setTimeout(() => setBreathingReminder(false), 2000);
    }, reminderInterval);

    return () => clearInterval(interval);
  }, [isRecording, bpm]);

  // Analyze pitch and provide feedback
  useEffect(() => {
    if (!isRecording || !currentPitch || currentPitch.frequency === null) return;

    const now = Date.now();

    // Check pitch accuracy
    if (currentPitch.inTune) {
      if (Math.random() < 0.05) { // Occasional encouragement
        addFeedback({
          type: 'success',
          message: 'Perfect pitch!',
          timestamp: now,
          priority: 2,
        });
      }
    } else if (currentPitch.cents !== null) {
      const deviation = Math.abs(currentPitch.cents);

      if (deviation > 40) {
        addFeedback({
          type: 'warning',
          message: currentPitch.cents > 0 ? 'Slightly sharp' : 'Slightly flat',
          timestamp: now,
          priority: 4,
        });
      }
    }

    // Check confidence (volume)
    if (currentPitch.confidence < 0.5) {
      if (Math.random() < 0.1) {
        addFeedback({
          type: 'tip',
          message: 'Sing louder for better tone',
          timestamp: now,
          priority: 3,
        });
      }
    }
  }, [currentPitch, isRecording]);

  // Check overall performance statistics
  useEffect(() => {
    if (!isRecording || statistics.totalDetections < 20) return;

    const now = Date.now();

    // Check in-tune percentage
    if (statistics.inTunePercentage < 50) {
      addFeedback({
        type: 'tip',
        message: 'Focus on pitch accuracy',
        timestamp: now,
        priority: 4,
      });
    } else if (statistics.inTunePercentage > 85) {
      if (Math.random() < 0.05) {
        addFeedback({
          type: 'success',
          message: 'Great accuracy!',
          timestamp: now,
          priority: 2,
        });
      }
    }
  }, [statistics, isRecording]);

  // Rotate tips periodically
  useEffect(() => {
    if (!isRecording) return;

    const tips = [
      'Relax your jaw',
      'Support from diaphragm',
      'Keep shoulders down',
      'Open your throat',
      'Think tall posture',
      'Smile for brighter tone',
      'Drop your larynx',
      'Breathe deeply',
    ];

    const interval = setInterval(() => {
      setCurrentTip(tips[Math.floor(Math.random() * tips.length)]);
    }, 15000); // New tip every 15 seconds

    return () => clearInterval(interval);
  }, [isRecording]);

  const addFeedback = useCallback((newFeedback: CoachingFeedback) => {
    setFeedback((prev) => {
      // Keep only last 5 feedback items
      const updated = [newFeedback, ...prev].slice(0, 5);
      return updated;
    });

    // Auto-remove after 5 seconds
    setTimeout(() => {
      setFeedback((prev) => prev.filter((f) => f.timestamp !== newFeedback.timestamp));
    }, 5000);
  }, []);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Not recording
  if (!isRecording) {
    return (
      <div className={styles.container}>
        <div className={styles.inactive}>
          <div className={styles.inactiveIcon}>🎤</div>
          <div className={styles.inactiveText}>Start recording to get live coaching</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header with recording indicator */}
      <div className={styles.header}>
        <div className={styles.recordingIndicator}>
          <div className={styles.recordingDot} />
          <span className={styles.recordingText}>Recording</span>
        </div>
        <div className={styles.duration}>{formatDuration(recordingDuration)}</div>
      </div>

      {/* Current pitch display */}
      {currentPitch && currentPitch.frequency !== null && (
        <div className={styles.pitchDisplay}>
          <div className={`${styles.note} ${currentPitch.inTune ? styles.inTune : styles.outOfTune}`}>
            {currentPitch.note || '--'}
          </div>
          <div className={styles.frequency}>
            {currentPitch.frequency.toFixed(1)} Hz
          </div>
          {currentPitch.cents !== null && (
            <div className={styles.cents}>
              {currentPitch.cents > 0 ? '+' : ''}{currentPitch.cents.toFixed(0)}¢
            </div>
          )}
        </div>
      )}

      {/* Live statistics */}
      <div className={styles.stats}>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Accuracy</span>
          <span className={styles.statValue}>{statistics.inTunePercentage.toFixed(0)}%</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Confidence</span>
          <span className={styles.statValue}>
            {currentPitch?.confidence ? (currentPitch.confidence * 100).toFixed(0) : '0'}%
          </span>
        </div>
      </div>

      {/* Breathing reminder */}
      {breathingReminder && (
        <div className={styles.breathingReminder}>
          <div className={styles.breathingIcon}>🫁</div>
          <div className={styles.breathingText}>Take a breath</div>
        </div>
      )}

      {/* Live feedback messages */}
      <div className={styles.feedbackList}>
        {feedback.map((f) => (
          <div
            key={f.timestamp}
            className={`${styles.feedbackItem} ${styles[f.type]}`}
          >
            <div className={styles.feedbackIcon}>
              {f.type === 'success' && '✓'}
              {f.type === 'warning' && '⚠'}
              {f.type === 'tip' && '💡'}
              {f.type === 'error' && '✗'}
            </div>
            <div className={styles.feedbackMessage}>{f.message}</div>
          </div>
        ))}
      </div>

      {/* Current tip */}
      {currentTip && (
        <div className={styles.currentTip}>
          <div className={styles.tipIcon}>💡</div>
          <div className={styles.tipText}>{currentTip}</div>
        </div>
      )}
    </div>
  );
}
