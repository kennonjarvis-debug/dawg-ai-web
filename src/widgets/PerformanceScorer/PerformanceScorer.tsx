/**
 * PerformanceScorer - Instance 2 (Audio Widgets)
 *
 * Live performance scoring with accuracy %, pitch/timing visualization
 * Real-time grade display and performance metrics
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { usePitchDetection } from '@/src/core/usePitchDetection';
import styles from './PerformanceScorer.module.css';

interface PerformanceScorerProps {
  trackId?: string;
  audioContext?: AudioContext | null;
  mediaStream?: MediaStream | null;
  isRecording: boolean;
  targetNote?: string | null;
}

interface PerformanceMetrics {
  overallScore: number;
  pitchAccuracy: number;
  pitchStability: number;
  consistency: number;
  grade: string;
}

export function PerformanceScorer({
  trackId,
  audioContext = null,
  mediaStream = null,
  isRecording,
  targetNote = null,
}: PerformanceScorerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();

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
    updateInterval: 50,
    targetNote,
  });

  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    overallScore: 0,
    pitchAccuracy: 0,
    pitchStability: 0,
    consistency: 0,
    grade: 'N/A',
  });

  const [recordingStartTime, setRecordingStartTime] = useState<number | null>(null);

  // Start/stop detection
  useEffect(() => {
    if (isRecording && !isActive && mediaStream && audioContext) {
      start();
      setRecordingStartTime(Date.now());
    } else if (!isRecording && isActive) {
      stop();
      setRecordingStartTime(null);
    }
  }, [isRecording, mediaStream, audioContext, isActive, start, stop]);

  // Update target note
  useEffect(() => {
    setTargetNote(targetNote);
  }, [targetNote, setTargetNote]);

  // Calculate performance metrics
  useEffect(() => {
    if (pitchHistory.length < 10) {
      setMetrics({
        overallScore: 0,
        pitchAccuracy: 0,
        pitchStability: 0,
        consistency: 0,
        grade: 'N/A',
      });
      return;
    }

    // Pitch accuracy (in-tune percentage)
    const pitchAccuracy = statistics.inTunePercentage;

    // Pitch stability (variance of frequencies)
    const frequencies = pitchHistory
      .map((p) => p.result.frequency)
      .filter((f): f is number => f !== null);

    const avgFreq = frequencies.reduce((a, b) => a + b, 0) / frequencies.length;
    const variance = frequencies.reduce((sum, f) => sum + Math.pow(f - avgFreq, 2), 0) / frequencies.length;
    const stdDev = Math.sqrt(variance);
    const pitchStability = Math.max(0, 100 - (stdDev / 10) * 100);

    // Consistency (detection success rate)
    const consistency = statistics.totalDetections > 0
      ? (statistics.successfulDetections / statistics.totalDetections) * 100
      : 0;

    // Overall score (weighted average)
    const overallScore = (pitchAccuracy * 0.5) + (pitchStability * 0.3) + (consistency * 0.2);

    // Grade
    let grade = 'F';
    if (overallScore >= 95) grade = 'A+';
    else if (overallScore >= 90) grade = 'A';
    else if (overallScore >= 85) grade = 'A-';
    else if (overallScore >= 80) grade = 'B+';
    else if (overallScore >= 75) grade = 'B';
    else if (overallScore >= 70) grade = 'B-';
    else if (overallScore >= 65) grade = 'C+';
    else if (overallScore >= 60) grade = 'C';
    else if (overallScore >= 55) grade = 'C-';
    else if (overallScore >= 50) grade = 'D';

    setMetrics({
      overallScore: Math.round(overallScore),
      pitchAccuracy: Math.round(pitchAccuracy),
      pitchStability: Math.round(pitchStability),
      consistency: Math.round(consistency),
      grade,
    });
  }, [pitchHistory, statistics]);

  // Draw pitch timeline visualization
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isRecording) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      const width = canvas.width;
      const height = canvas.height;
      const now = Date.now();
      const timeWindow = 10000; // Last 10 seconds

      // Clear canvas
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, width, height);

      // Draw grid lines
      ctx.strokeStyle = '#222';
      ctx.lineWidth = 1;

      // Horizontal lines (pitch levels)
      for (let i = 0; i <= 4; i++) {
        const y = (height / 4) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw pitch history
      if (pitchHistory.length > 0 && recordingStartTime) {
        const visiblePoints = pitchHistory.filter(
          (point) => now - point.timestamp < timeWindow
        );

        if (visiblePoints.length > 1) {
          ctx.beginPath();
          ctx.lineWidth = 3;

          visiblePoints.forEach((point, index) => {
            if (point.result.midiNote === null) return;

            // Map time to x position
            const timeOffset = now - point.timestamp;
            const x = width - (timeOffset / timeWindow) * width;

            // Map MIDI note to y position (C3 = 48, C5 = 72)
            const midiMin = 48;
            const midiMax = 72;
            const midi = Math.max(midiMin, Math.min(midiMax, point.result.midiNote));
            const y = height - ((midi - midiMin) / (midiMax - midiMin)) * height;

            // Color based on in-tune status
            ctx.strokeStyle = point.result.inTune ? '#00ff88' : '#ff5555';

            if (index === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          });

          ctx.stroke();

          // Draw dots at each point
          visiblePoints.forEach((point) => {
            if (point.result.midiNote === null) return;

            const timeOffset = now - point.timestamp;
            const x = width - (timeOffset / timeWindow) * width;

            const midiMin = 48;
            const midiMax = 72;
            const midi = Math.max(midiMin, Math.min(midiMax, point.result.midiNote));
            const y = height - ((midi - midiMin) / (midiMax - midiMin)) * height;

            ctx.fillStyle = point.result.inTune ? '#00ff88' : '#ff5555';
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
          });
        }
      }

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [pitchHistory, isRecording, recordingStartTime]);

  const getScoreColor = (score: number): string => {
    if (score >= 90) return '#00ff88';
    if (score >= 75) return '#00e5ff';
    if (score >= 60) return '#ffaa00';
    return '#ff5555';
  };

  // Not recording
  if (!isRecording) {
    return (
      <div className={styles.container}>
        <div className={styles.inactive}>
          <div className={styles.inactiveIcon}>📊</div>
          <div className={styles.inactiveText}>Start recording to see performance score</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Score Display */}
      <div className={styles.scoreSection}>
        <div
          className={styles.scoreCircle}
          style={{ borderColor: getScoreColor(metrics.overallScore) }}
        >
          <div
            className={styles.scoreValue}
            style={{ color: getScoreColor(metrics.overallScore) }}
          >
            {metrics.overallScore}
          </div>
          <div className={styles.scoreGrade}>{metrics.grade}</div>
        </div>

        <div className={styles.scoreLabel}>Performance Score</div>
      </div>

      {/* Pitch Timeline Visualization */}
      <div className={styles.visualizationSection}>
        <div className={styles.visualizationHeader}>Pitch Timeline (Last 10s)</div>
        <div className={styles.canvasContainer}>
          <canvas
            ref={canvasRef}
            width={400}
            height={100}
            className={styles.canvas}
          />
        </div>
      </div>

      {/* Metrics Breakdown */}
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>Pitch Accuracy</div>
          <div
            className={styles.metricValue}
            style={{ color: getScoreColor(metrics.pitchAccuracy) }}
          >
            {metrics.pitchAccuracy}%
          </div>
          <div className={styles.metricBar}>
            <div
              className={styles.metricBarFill}
              style={{
                width: `${metrics.pitchAccuracy}%`,
                background: getScoreColor(metrics.pitchAccuracy),
              }}
            />
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>Pitch Stability</div>
          <div
            className={styles.metricValue}
            style={{ color: getScoreColor(metrics.pitchStability) }}
          >
            {metrics.pitchStability}%
          </div>
          <div className={styles.metricBar}>
            <div
              className={styles.metricBarFill}
              style={{
                width: `${metrics.pitchStability}%`,
                background: getScoreColor(metrics.pitchStability),
              }}
            />
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>Consistency</div>
          <div
            className={styles.metricValue}
            style={{ color: getScoreColor(metrics.consistency) }}
          >
            {metrics.consistency}%
          </div>
          <div className={styles.metricBar}>
            <div
              className={styles.metricBarFill}
              style={{
                width: `${metrics.consistency}%`,
                background: getScoreColor(metrics.consistency),
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
