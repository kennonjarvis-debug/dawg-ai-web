/**
 * VocalStatsPanel - Instance 2 (Audio Widgets)
 *
 * Comprehensive vocal performance metrics display
 * Shows post-recording stats: pitch accuracy, stability, vibrato, overall score
 */

'use client';

import { useEffect, useState } from 'react';
import { usePitchDetection } from '@/src/core/usePitchDetection';
import styles from './VocalStatsPanel.module.css';

interface VocalStatsPanelProps {
  trackId: string;
  audioContext: AudioContext | null;
  mediaStream: MediaStream | null;
  enabled?: boolean;
  targetNote?: string | null;
}

// Calculate pitch stability (lower variance = more stable)
function calculatePitchStability(frequencies: number[]): number {
  if (frequencies.length < 2) return 100;

  const avg = frequencies.reduce((a, b) => a + b, 0) / frequencies.length;
  const variance =
    frequencies.reduce((sum, f) => sum + Math.pow(f - avg, 2), 0) / frequencies.length;
  const stdDev = Math.sqrt(variance);

  // Map std dev to 0-100 score (lower std dev = higher score)
  // Assume 0-10 Hz std dev maps to 100-0 score
  const score = Math.max(0, 100 - (stdDev / 10) * 100);
  return Math.round(score);
}

// Detect vibrato (periodic pitch oscillation)
function detectVibrato(frequencies: number[]): {
  hasVibrato: boolean;
  rate: number; // Hz (oscillations per second)
  extent: number; // Hz (amplitude of oscillation)
} {
  if (frequencies.length < 20) {
    return { hasVibrato: false, rate: 0, extent: 0 };
  }

  // Simple peak detection for vibrato
  let peaks = 0;
  let troughs = 0;
  let peakExtent = 0;

  for (let i = 1; i < frequencies.length - 1; i++) {
    if (frequencies[i] > frequencies[i - 1] && frequencies[i] > frequencies[i + 1]) {
      peaks++;
      peakExtent = Math.max(peakExtent, frequencies[i] - frequencies[i - 1]);
    }
    if (frequencies[i] < frequencies[i - 1] && frequencies[i] < frequencies[i + 1]) {
      troughs++;
    }
  }

  const hasVibrato = peaks >= 3 && troughs >= 3;
  const rate = hasVibrato ? ((peaks + troughs) / 2 / frequencies.length) * 20 : 0; // Assuming 20fps
  const extent = peakExtent;

  return { hasVibrato, rate, extent };
}

// Calculate overall performance score
function calculatePerformanceScore(
  inTunePercentage: number,
  stability: number,
  consistency: number
): number {
  // Weighted average: 50% in-tune, 30% stability, 20% consistency
  const score = inTunePercentage * 0.5 + stability * 0.3 + consistency * 0.2;
  return Math.round(score);
}

// Get letter grade from score
function getGrade(score: number): string {
  if (score >= 95) return 'A+';
  if (score >= 90) return 'A';
  if (score >= 85) return 'A-';
  if (score >= 80) return 'B+';
  if (score >= 75) return 'B';
  if (score >= 70) return 'B-';
  if (score >= 65) return 'C+';
  if (score >= 60) return 'C';
  if (score >= 55) return 'C-';
  if (score >= 50) return 'D';
  return 'F';
}

export function VocalStatsPanel({
  trackId,
  audioContext,
  mediaStream,
  enabled = true,
  targetNote = null,
}: VocalStatsPanelProps) {
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

  // Derived stats
  const [pitchStability, setPitchStability] = useState(0);
  const [vibrato, setVibrato] = useState({ hasVibrato: false, rate: 0, extent: 0 });
  const [performanceScore, setPerformanceScore] = useState(0);
  const [grade, setGrade] = useState('N/A');

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

  // Calculate derived stats when pitch history updates
  useEffect(() => {
    if (pitchHistory.length === 0) {
      setPitchStability(0);
      setVibrato({ hasVibrato: false, rate: 0, extent: 0 });
      setPerformanceScore(0);
      setGrade('N/A');
      return;
    }

    // Extract frequencies
    const frequencies = pitchHistory
      .map((p) => p.result.frequency)
      .filter((f): f is number => f !== null);

    // Calculate pitch stability
    const stability = calculatePitchStability(frequencies);
    setPitchStability(stability);

    // Detect vibrato
    const vibratoData = detectVibrato(frequencies);
    setVibrato(vibratoData);

    // Calculate consistency (based on successful detection rate)
    const consistency =
      statistics.totalDetections > 0
        ? (statistics.successfulDetections / statistics.totalDetections) * 100
        : 0;

    // Calculate overall performance score
    const score = calculatePerformanceScore(statistics.inTunePercentage, stability, consistency);
    setPerformanceScore(score);
    setGrade(getGrade(score));
  }, [pitchHistory, statistics]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>Vocal Performance Metrics</h3>
        <div className={styles.controls}>
          <button onClick={clearHistory} className={styles.clearButton}>
            Reset
          </button>
        </div>
      </div>

      {/* Overall Score Card */}
      <div className={styles.scoreCard}>
        <div className={styles.scoreCircle}>
          <div className={styles.scoreValue}>{performanceScore}</div>
          <div className={styles.scoreGrade}>{grade}</div>
        </div>
        <div className={styles.scoreLabel}>Overall Performance</div>
      </div>

      {/* Core Metrics Grid */}
      <div className={styles.metricsGrid}>
        {/* Pitch Accuracy */}
        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricIcon}>🎯</span>
            <span className={styles.metricTitle}>Pitch Accuracy</span>
          </div>
          <div className={styles.metricValue}>
            {statistics.inTunePercentage.toFixed(1)}%
          </div>
          <div className={styles.metricBar}>
            <div
              className={styles.metricBarFill}
              style={{
                width: `${statistics.inTunePercentage}%`,
                background: statistics.inTunePercentage >= 80 ? '#00ff88' : '#ffaa00',
              }}
            />
          </div>
          <div className={styles.metricSubtext}>
            {statistics.inTunePercentage >= 90
              ? 'Excellent'
              : statistics.inTunePercentage >= 75
              ? 'Good'
              : statistics.inTunePercentage >= 50
              ? 'Fair'
              : 'Needs Work'}
          </div>
        </div>

        {/* Pitch Stability */}
        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricIcon}>📊</span>
            <span className={styles.metricTitle}>Pitch Stability</span>
          </div>
          <div className={styles.metricValue}>{pitchStability}%</div>
          <div className={styles.metricBar}>
            <div
              className={styles.metricBarFill}
              style={{
                width: `${pitchStability}%`,
                background: pitchStability >= 80 ? '#00e5ff' : '#ffaa00',
              }}
            />
          </div>
          <div className={styles.metricSubtext}>
            {pitchStability >= 90
              ? 'Rock Solid'
              : pitchStability >= 75
              ? 'Stable'
              : pitchStability >= 50
              ? 'Moderate'
              : 'Unsteady'}
          </div>
        </div>

        {/* Average Frequency */}
        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricIcon}>🎵</span>
            <span className={styles.metricTitle}>Average Pitch</span>
          </div>
          <div className={styles.metricValue}>
            {statistics.averageFrequency.toFixed(1)} Hz
          </div>
          <div className={styles.metricSubtext}>
            {statistics.mostCommonNote || 'N/A'}
          </div>
        </div>

        {/* Detection Rate */}
        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricIcon}>✅</span>
            <span className={styles.metricTitle}>Detection Rate</span>
          </div>
          <div className={styles.metricValue}>
            {statistics.totalDetections > 0
              ? ((statistics.successfulDetections / statistics.totalDetections) * 100).toFixed(1)
              : 0}
            %
          </div>
          <div className={styles.metricSubtext}>
            {statistics.successfulDetections}/{statistics.totalDetections} detections
          </div>
        </div>
      </div>

      {/* Vibrato Analysis */}
      <div className={styles.vibratoSection}>
        <div className={styles.vibratoHeader}>
          <span className={styles.vibratoIcon}>🎼</span>
          <span className={styles.vibratoTitle}>Vibrato Analysis</span>
        </div>
        <div className={styles.vibratoContent}>
          {vibrato.hasVibrato ? (
            <>
              <div className={styles.vibratoStat}>
                <span className={styles.vibratoLabel}>Detected:</span>
                <span className={styles.vibratoValue}>Yes ✓</span>
              </div>
              <div className={styles.vibratoStat}>
                <span className={styles.vibratoLabel}>Rate:</span>
                <span className={styles.vibratoValue}>{vibrato.rate.toFixed(1)} Hz</span>
              </div>
              <div className={styles.vibratoStat}>
                <span className={styles.vibratoLabel}>Extent:</span>
                <span className={styles.vibratoValue}>{vibrato.extent.toFixed(1)} Hz</span>
              </div>
            </>
          ) : (
            <div className={styles.vibratoNone}>No vibrato detected</div>
          )}
        </div>
      </div>

      {/* Performance Tips */}
      <div className={styles.tipsSection}>
        <div className={styles.tipsHeader}>💡 Performance Tips</div>
        <div className={styles.tipsList}>
          {statistics.inTunePercentage < 75 && (
            <div className={styles.tip}>
              • Practice pitch matching exercises to improve accuracy
            </div>
          )}
          {pitchStability < 75 && (
            <div className={styles.tip}>
              • Focus on breath support to maintain steady pitch
            </div>
          )}
          {statistics.successfulDetections / statistics.totalDetections < 0.7 &&
            statistics.totalDetections > 0 && (
              <div className={styles.tip}>
                • Sing louder and clearer for better pitch detection
              </div>
            )}
          {vibrato.hasVibrato && vibrato.extent > 20 && (
            <div className={styles.tip}>
              • Vibrato extent is wide - practice controlled oscillation
            </div>
          )}
          {!vibrato.hasVibrato && pitchHistory.length > 50 && (
            <div className={styles.tip}>
              • Try adding subtle vibrato for expressiveness
            </div>
          )}
          {performanceScore >= 90 && (
            <div className={styles.tip}>
              ✨ Excellent performance! Keep up the great work!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
