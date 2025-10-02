/**
 * CompactEQControls - Instance 2 (Audio Widgets)
 *
 * Mini version of EQControls for dashboard bottom row
 * Simple 3-band EQ sliders only (Low/Mid/High)
 * 100px height max
 */

'use client';

import { useState, useEffect } from 'react';
import { useEffects } from '@/src/core/useEffects';
import styles from './CompactEQControls.module.css';

interface CompactEQControlsProps {
  trackId?: string;
  audioContext?: AudioContext | null;
  enabled?: boolean;
}

export function CompactEQControls({
  trackId = 'default',
  audioContext = null,
  enabled = true,
}: CompactEQControlsProps) {
  const effects = useEffects({ trackId, audioContext, enabled });

  const [lowGain, setLowGain] = useState(0);
  const [midGain, setMidGain] = useState(0);
  const [highGain, setHighGain] = useState(0);

  // Initialize EQ on mount
  useEffect(() => {
    if (effects) {
      effects.toggleEQ(true);
    }
  }, [effects]);

  // Handle gain change
  const handleGainChange = (band: 'low' | 'mid' | 'high', value: number) => {
    if (band === 'low') {
      setLowGain(value);
      effects.updateEQ({ low: { gain: value, frequency: 250, Q: 1.0, type: 'lowshelf' } });
    } else if (band === 'mid') {
      setMidGain(value);
      effects.updateEQ({ mid: { gain: value, frequency: 1000, Q: 1.0, type: 'peaking' } });
    } else {
      setHighGain(value);
      effects.updateEQ({ high: { gain: value, frequency: 4000, Q: 1.0, type: 'highshelf' } });
    }
  };

  // No audio context
  if (!audioContext) {
    return (
      <div className={styles.container}>
        <div className={styles.noAudio}>No audio</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Low Band */}
      <div className={styles.band}>
        <div className={styles.bandLabel}>Low</div>
        <input
          type="range"
          min="-12"
          max="12"
          step="1"
          value={lowGain}
          onChange={(e) => handleGainChange('low', parseFloat(e.target.value))}
          className={styles.slider}
        />
        <div className={styles.bandValue}>
          {lowGain > 0 ? '+' : ''}{lowGain}
        </div>
      </div>

      {/* Mid Band */}
      <div className={styles.band}>
        <div className={styles.bandLabel}>Mid</div>
        <input
          type="range"
          min="-12"
          max="12"
          step="1"
          value={midGain}
          onChange={(e) => handleGainChange('mid', parseFloat(e.target.value))}
          className={styles.slider}
        />
        <div className={styles.bandValue}>
          {midGain > 0 ? '+' : ''}{midGain}
        </div>
      </div>

      {/* High Band */}
      <div className={styles.band}>
        <div className={styles.bandLabel}>High</div>
        <input
          type="range"
          min="-12"
          max="12"
          step="1"
          value={highGain}
          onChange={(e) => handleGainChange('high', parseFloat(e.target.value))}
          className={styles.slider}
        />
        <div className={styles.bandValue}>
          {highGain > 0 ? '+' : ''}{highGain}
        </div>
      </div>
    </div>
  );
}
