/**
 * EQControls - Instance 2 (Audio Widgets)
 *
 * Dedicated 3-band parametric EQ control widget
 * Frequency, gain, and Q controls for low/mid/high bands
 */

'use client';

import { useState, useEffect } from 'react';
import { useEffects } from '@/src/core/useEffects';
import { EQ_PRESETS } from '@/src/utils/audioEffects';
import styles from './EQControls.module.css';

interface EQControlsProps {
  trackId: string;
  audioContext: AudioContext | null;
  enabled?: boolean;
}

export function EQControls({ trackId, audioContext, enabled = true }: EQControlsProps) {
  const effects = useEffects({ trackId, audioContext, enabled });

  // EQ State
  const [eqEnabled, setEQEnabled] = useState(true);
  const [lowGain, setLowGain] = useState(0);
  const [midGain, setMidGain] = useState(0);
  const [highGain, setHighGain] = useState(0);
  const [lowFreq, setLowFreq] = useState(250);
  const [midFreq, setMidFreq] = useState(1000);
  const [highFreq, setHighFreq] = useState(4000);
  const [lowQ, setLowQ] = useState(1.0);
  const [midQ, setMidQ] = useState(1.0);
  const [highQ, setHighQ] = useState(1.0);

  // Initialize EQ on mount
  useEffect(() => {
    if (eqEnabled && effects) {
      effects.toggleEQ(true);
    }
  }, [effects, eqEnabled]);

  // EQ Toggle
  const handleEQToggle = () => {
    const newState = !eqEnabled;
    setEQEnabled(newState);
    effects.toggleEQ(newState);
  };

  // Band Gain Controls
  const handleGainChange = (band: 'low' | 'mid' | 'high', value: number) => {
    if (band === 'low') {
      setLowGain(value);
      effects.updateEQ({ low: { gain: value, frequency: lowFreq, Q: lowQ, type: 'lowshelf' } });
    } else if (band === 'mid') {
      setMidGain(value);
      effects.updateEQ({ mid: { gain: value, frequency: midFreq, Q: midQ, type: 'peaking' } });
    } else {
      setHighGain(value);
      effects.updateEQ({ high: { gain: value, frequency: highFreq, Q: highQ, type: 'highshelf' } });
    }
  };

  // Band Frequency Controls
  const handleFreqChange = (band: 'low' | 'mid' | 'high', value: number) => {
    if (band === 'low') {
      setLowFreq(value);
      effects.updateEQ({ low: { gain: lowGain, frequency: value, Q: lowQ, type: 'lowshelf' } });
    } else if (band === 'mid') {
      setMidFreq(value);
      effects.updateEQ({ mid: { gain: midGain, frequency: value, Q: midQ, type: 'peaking' } });
    } else {
      setHighFreq(value);
      effects.updateEQ({ high: { gain: highGain, frequency: value, Q: highQ, type: 'highshelf' } });
    }
  };

  // Band Q Controls
  const handleQChange = (band: 'low' | 'mid' | 'high', value: number) => {
    if (band === 'low') {
      setLowQ(value);
      effects.updateEQ({ low: { gain: lowGain, frequency: lowFreq, Q: value, type: 'lowshelf' } });
    } else if (band === 'mid') {
      setMidQ(value);
      effects.updateEQ({ mid: { gain: midGain, frequency: midFreq, Q: value, type: 'peaking' } });
    } else {
      setHighQ(value);
      effects.updateEQ({ high: { gain: highGain, frequency: highFreq, Q: value, type: 'highshelf' } });
    }
  };

  // Preset Loader
  const handlePresetLoad = (preset: keyof typeof EQ_PRESETS) => {
    effects.loadEQPreset(preset);
    const params = effects.getEQParams();
    if (params) {
      setLowGain(params.low.gain);
      setMidGain(params.mid.gain);
      setHighGain(params.high.gain);
      setLowFreq(params.low.frequency);
      setMidFreq(params.mid.frequency);
      setHighFreq(params.high.frequency);
      setLowQ(params.low.Q);
      setMidQ(params.mid.Q);
      setHighQ(params.high.Q);
    }
  };

  // Reset to flat
  const handleReset = () => {
    handlePresetLoad('flat');
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h3>3-Band EQ</h3>
          <button
            className={`${styles.powerButton} ${eqEnabled ? styles.enabled : ''}`}
            onClick={handleEQToggle}
            title={eqEnabled ? 'Disable EQ' : 'Enable EQ'}
          >
            {eqEnabled ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* Preset Selector */}
        <div className={styles.presetSelector}>
          <select
            onChange={(e) => handlePresetLoad(e.target.value as keyof typeof EQ_PRESETS)}
            className={styles.presetDropdown}
          >
            <option value="">Select Preset</option>
            <option value="flat">Flat (Reset)</option>
            <option value="vocal">Vocal</option>
            <option value="warmth">Warmth</option>
            <option value="presence">Presence</option>
            <option value="radio">Radio</option>
          </select>
        </div>
      </div>

      {/* EQ Bands Grid */}
      <div className={styles.bandsGrid}>
        {/* Low Band */}
        <div className={styles.band}>
          <div className={styles.bandHeader}>
            <span className={styles.bandLabel}>Low</span>
            <span className={styles.bandValue}>{lowGain > 0 ? '+' : ''}{lowGain.toFixed(1)} dB</span>
          </div>

          {/* Gain Slider */}
          <div className={styles.sliderControl}>
            <label className={styles.controlLabel}>Gain</label>
            <input
              type="range"
              min="-12"
              max="12"
              step="0.5"
              value={lowGain}
              onChange={(e) => handleGainChange('low', parseFloat(e.target.value))}
              className={styles.slider}
              disabled={!eqEnabled}
            />
          </div>

          {/* Frequency Slider */}
          <div className={styles.sliderControl}>
            <label className={styles.controlLabel}>Freq</label>
            <input
              type="range"
              min="60"
              max="500"
              step="10"
              value={lowFreq}
              onChange={(e) => handleFreqChange('low', parseFloat(e.target.value))}
              className={styles.slider}
              disabled={!eqEnabled}
            />
            <span className={styles.valueLabel}>{lowFreq} Hz</span>
          </div>

          {/* Q Slider */}
          <div className={styles.sliderControl}>
            <label className={styles.controlLabel}>Q</label>
            <input
              type="range"
              min="0.5"
              max="5"
              step="0.1"
              value={lowQ}
              onChange={(e) => handleQChange('low', parseFloat(e.target.value))}
              className={styles.slider}
              disabled={!eqEnabled}
            />
            <span className={styles.valueLabel}>{lowQ.toFixed(1)}</span>
          </div>
        </div>

        {/* Mid Band */}
        <div className={styles.band}>
          <div className={styles.bandHeader}>
            <span className={styles.bandLabel}>Mid</span>
            <span className={styles.bandValue}>{midGain > 0 ? '+' : ''}{midGain.toFixed(1)} dB</span>
          </div>

          {/* Gain Slider */}
          <div className={styles.sliderControl}>
            <label className={styles.controlLabel}>Gain</label>
            <input
              type="range"
              min="-12"
              max="12"
              step="0.5"
              value={midGain}
              onChange={(e) => handleGainChange('mid', parseFloat(e.target.value))}
              className={styles.slider}
              disabled={!eqEnabled}
            />
          </div>

          {/* Frequency Slider */}
          <div className={styles.sliderControl}>
            <label className={styles.controlLabel}>Freq</label>
            <input
              type="range"
              min="500"
              max="4000"
              step="50"
              value={midFreq}
              onChange={(e) => handleFreqChange('mid', parseFloat(e.target.value))}
              className={styles.slider}
              disabled={!eqEnabled}
            />
            <span className={styles.valueLabel}>{midFreq} Hz</span>
          </div>

          {/* Q Slider */}
          <div className={styles.sliderControl}>
            <label className={styles.controlLabel}>Q</label>
            <input
              type="range"
              min="0.5"
              max="5"
              step="0.1"
              value={midQ}
              onChange={(e) => handleQChange('mid', parseFloat(e.target.value))}
              className={styles.slider}
              disabled={!eqEnabled}
            />
            <span className={styles.valueLabel}>{midQ.toFixed(1)}</span>
          </div>
        </div>

        {/* High Band */}
        <div className={styles.band}>
          <div className={styles.bandHeader}>
            <span className={styles.bandLabel}>High</span>
            <span className={styles.bandValue}>{highGain > 0 ? '+' : ''}{highGain.toFixed(1)} dB</span>
          </div>

          {/* Gain Slider */}
          <div className={styles.sliderControl}>
            <label className={styles.controlLabel}>Gain</label>
            <input
              type="range"
              min="-12"
              max="12"
              step="0.5"
              value={highGain}
              onChange={(e) => handleGainChange('high', parseFloat(e.target.value))}
              className={styles.slider}
              disabled={!eqEnabled}
            />
          </div>

          {/* Frequency Slider */}
          <div className={styles.sliderControl}>
            <label className={styles.controlLabel}>Freq</label>
            <input
              type="range"
              min="2000"
              max="16000"
              step="100"
              value={highFreq}
              onChange={(e) => handleFreqChange('high', parseFloat(e.target.value))}
              className={styles.slider}
              disabled={!eqEnabled}
            />
            <span className={styles.valueLabel}>{(highFreq / 1000).toFixed(1)}k Hz</span>
          </div>

          {/* Q Slider */}
          <div className={styles.sliderControl}>
            <label className={styles.controlLabel}>Q</label>
            <input
              type="range"
              min="0.5"
              max="5"
              step="0.1"
              value={highQ}
              onChange={(e) => handleQChange('high', parseFloat(e.target.value))}
              className={styles.slider}
              disabled={!eqEnabled}
            />
            <span className={styles.valueLabel}>{highQ.toFixed(1)}</span>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className={styles.footer}>
        <button onClick={handleReset} className={styles.resetButton}>
          Reset to Flat
        </button>
      </div>
    </div>
  );
}
