/**
 * CompactPitchMonitor - Instance 2 (Audio Widgets)
 *
 * Mini version of PitchMonitor for dashboard bottom row
 * Shows only current note + frequency (no visualization)
 * 100px height max
 */

'use client';

import { useEffect } from 'react';
import { usePitchDetection } from '@/src/core/usePitchDetection';
import styles from './CompactPitchMonitor.module.css';

interface CompactPitchMonitorProps {
  trackId?: string;
  audioContext?: AudioContext | null;
  mediaStream?: MediaStream | null;
  enabled?: boolean;
}

export function CompactPitchMonitor({
  trackId,
  audioContext = null,
  mediaStream = null,
  enabled = true,
}: CompactPitchMonitorProps) {
  const {
    currentPitch,
    isActive,
    start,
    stop,
  } = usePitchDetection({
    audioContext,
    mediaStream,
    enabled,
    updateInterval: 50,
  });

  // Start/stop detection
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

  // No audio context available
  if (!audioContext) {
    return (
      <div className={styles.container}>
        <div className={styles.noAudio}>No audio</div>
      </div>
    );
  }

  // Not detecting pitch
  if (!currentPitch || currentPitch.frequency === null) {
    return (
      <div className={styles.container}>
        <div className={styles.noSignal}>--</div>
        <div className={styles.frequencyLabel}>No signal</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Current Note Display */}
      <div className={`${styles.noteDisplay} ${currentPitch.inTune ? styles.inTune : styles.outOfTune}`}>
        {currentPitch.note || '--'}
      </div>

      {/* Frequency Display */}
      <div className={styles.frequencyDisplay}>
        <span className={styles.frequencyValue}>{currentPitch.frequency.toFixed(1)}</span>
        <span className={styles.frequencyUnit}>Hz</span>
      </div>

      {/* Cents Deviation Bar */}
      {currentPitch.cents !== null && (
        <div className={styles.centsBar}>
          <div className={styles.centsBarTrack}>
            <div
              className={styles.centsBarFill}
              style={{
                left: `${50 + (currentPitch.cents / 50) * 25}%`,
                background: currentPitch.inTune ? '#00ff88' : '#ff5555'
              }}
            />
          </div>
          <div className={styles.centsValue}>
            {currentPitch.cents > 0 ? '+' : ''}{currentPitch.cents.toFixed(0)}¢
          </div>
        </div>
      )}
    </div>
  );
}
