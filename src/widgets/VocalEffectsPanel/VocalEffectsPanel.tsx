/**
 * VocalEffectsPanel - Instance 2 (Audio Widgets)
 *
 * Professional vocal effects UI:
 * - Auto-Tune style pitch correction
 * - Vocal doubling (chorus/ADT)
 * - De-esser (sibilance reduction)
 * - Preset selection
 */

'use client';

import { useState } from 'react';
import { useVocalEffects } from '@/src/core/useVocalEffects';
import { useTrackStore } from '@/src/core/store';
import { VOCAL_PRESETS } from '@/src/utils/vocalEffects';
import styles from './VocalEffectsPanel.module.css';

interface VocalEffectsPanelProps {
  trackId: string;
  audioContext: AudioContext | null;
}

export function VocalEffectsPanel({ trackId, audioContext }: VocalEffectsPanelProps) {
  const track = useTrackStore((state) => state.tracks.find((t) => t.id === trackId));
  const [selectedPreset, setSelectedPreset] = useState<string>('natural');

  // Initialize vocal effects hook
  const {
    pitchCorrection,
    doubler,
    deEsser,
    updatePitchCorrection,
    togglePitchCorrection,
    getPitchCorrectionParams,
    updateDoubler,
    toggleDoubler,
    getDoublerParams,
    updateDeEsser,
    toggleDeEsser,
    getDeEsserParams,
    setDeEsserListenMode,
    loadPreset,
  } = useVocalEffects({
    trackId,
    audioContext,
    enabled: true,
  });

  const pitchParams = getPitchCorrectionParams();
  const doublerParams = getDoublerParams();
  const deEsserParams = getDeEsserParams();

  if (!track || !audioContext) {
    return (
      <div className={styles.container}>
        No track selected or audio context unavailable
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Vocal Effects - {track.name}</h2>
      </div>

      {/* Preset Selection */}
      <section className={styles.section}>
        <div className={styles.presetRow}>
          <label>Preset:</label>
          <select
            value={selectedPreset}
            onChange={(e) => {
              const preset = e.target.value as keyof typeof VOCAL_PRESETS;
              setSelectedPreset(preset);
              loadPreset(preset);
            }}
            className={styles.select}
          >
            <option value="natural">Natural (De-Esser Only)</option>
            <option value="radio">Radio (Heavy De-Esser)</option>
            <option value="autoTune">Auto-Tune (Hard Correction)</option>
            <option value="thick">Thick (Vocal Doubling)</option>
            <option value="telephone">Telephone (No Processing)</option>
          </select>
        </div>
      </section>

      {/* Pitch Correction Section */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3>Pitch Correction (Auto-Tune)</h3>
          <button
            className={`${styles.toggleButton} ${
              pitchParams?.enabled ? styles.active : ''
            }`}
            onClick={() => togglePitchCorrection(!pitchParams?.enabled)}
          >
            {pitchParams?.enabled ? 'ON' : 'OFF'}
          </button>
        </div>

        {pitchParams && (
          <div className={styles.controls}>
            <div className={styles.control}>
              <label>Strength (0 = natural, 1 = hard tune):</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={pitchParams.strength}
                onChange={(e) =>
                  updatePitchCorrection({ strength: Number(e.target.value) })
                }
              />
              <span>{(pitchParams.strength * 100).toFixed(0)}%</span>
            </div>

            <div className={styles.control}>
              <label>Speed (0 = instant, 100 = natural):</label>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={pitchParams.speed}
                onChange={(e) =>
                  updatePitchCorrection({ speed: Number(e.target.value) })
                }
              />
              <span>{pitchParams.speed}ms</span>
            </div>

            <div className={styles.control}>
              <label>Scale:</label>
              <select
                value={pitchParams.scale}
                onChange={(e) =>
                  updatePitchCorrection({
                    scale: e.target.value as any,
                  })
                }
                className={styles.select}
              >
                <option value="chromatic">Chromatic (All Notes)</option>
                <option value="major">Major Scale</option>
                <option value="minor">Minor Scale</option>
                <option value="pentatonic">Pentatonic</option>
              </select>
            </div>

            <div className={styles.control}>
              <label>Root Note:</label>
              <select
                value={pitchParams.rootNote}
                onChange={(e) =>
                  updatePitchCorrection({ rootNote: Number(e.target.value) })
                }
                className={styles.select}
              >
                <option value="0">C</option>
                <option value="1">C# / Db</option>
                <option value="2">D</option>
                <option value="3">D# / Eb</option>
                <option value="4">E</option>
                <option value="5">F</option>
                <option value="6">F# / Gb</option>
                <option value="7">G</option>
                <option value="8">G# / Ab</option>
                <option value="9">A</option>
                <option value="10">A# / Bb</option>
                <option value="11">B</option>
              </select>
            </div>
          </div>
        )}
      </section>

      {/* Vocal Doubler Section */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3>Vocal Doubler</h3>
          <button
            className={`${styles.toggleButton} ${
              doublerParams?.enabled ? styles.active : ''
            }`}
            onClick={() => toggleDoubler(!doublerParams?.enabled)}
          >
            {doublerParams?.enabled ? 'ON' : 'OFF'}
          </button>
        </div>

        {doublerParams && (
          <div className={styles.controls}>
            <div className={styles.control}>
              <label>Mix (wet/dry):</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={doublerParams.mix}
                onChange={(e) =>
                  updateDoubler({ mix: Number(e.target.value) })
                }
              />
              <span>{(doublerParams.mix * 100).toFixed(0)}%</span>
            </div>

            <div className={styles.control}>
              <label>Delay Time (5-50ms typical):</label>
              <input
                type="range"
                min="5"
                max="50"
                step="1"
                value={doublerParams.delay}
                onChange={(e) =>
                  updateDoubler({ delay: Number(e.target.value) })
                }
              />
              <span>{doublerParams.delay}ms</span>
            </div>

            <div className={styles.control}>
              <label>Stereo Width:</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={doublerParams.width}
                onChange={(e) =>
                  updateDoubler({ width: Number(e.target.value) })
                }
              />
              <span>{(doublerParams.width * 100).toFixed(0)}%</span>
            </div>

            <div className={styles.control}>
              <label>Voices (1-4):</label>
              <input
                type="range"
                min="1"
                max="4"
                step="1"
                value={doublerParams.voices}
                onChange={(e) =>
                  updateDoubler({ voices: Number(e.target.value) })
                }
              />
              <span>{doublerParams.voices}</span>
            </div>
          </div>
        )}
      </section>

      {/* De-Esser Section */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3>De-Esser (Sibilance Reduction)</h3>
          <button
            className={`${styles.toggleButton} ${
              deEsserParams?.enabled ? styles.active : ''
            }`}
            onClick={() => toggleDeEsser(!deEsserParams?.enabled)}
          >
            {deEsserParams?.enabled ? 'ON' : 'OFF'}
          </button>
        </div>

        {deEsserParams && (
          <div className={styles.controls}>
            <div className={styles.control}>
              <label>Frequency (target sibilance range):</label>
              <input
                type="range"
                min="4000"
                max="10000"
                step="100"
                value={deEsserParams.frequency}
                onChange={(e) =>
                  updateDeEsser({ frequency: Number(e.target.value) })
                }
              />
              <span>{deEsserParams.frequency}Hz</span>
            </div>

            <div className={styles.control}>
              <label>Threshold:</label>
              <input
                type="range"
                min="-60"
                max="0"
                step="1"
                value={deEsserParams.threshold}
                onChange={(e) =>
                  updateDeEsser({ threshold: Number(e.target.value) })
                }
              />
              <span>{deEsserParams.threshold}dB</span>
            </div>

            <div className={styles.control}>
              <label>Reduction:</label>
              <input
                type="range"
                min="0"
                max="20"
                step="1"
                value={deEsserParams.reduction}
                onChange={(e) =>
                  updateDeEsser({ reduction: Number(e.target.value) })
                }
              />
              <span>{deEsserParams.reduction}dB</span>
            </div>

            <div className={styles.control}>
              <label>
                <input
                  type="checkbox"
                  checked={deEsserParams.listenMode}
                  onChange={(e) => setDeEsserListenMode(e.target.checked)}
                />
                Listen Mode (hear only sibilants)
              </label>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
