/**
 * TrackList - Main container component for track management
 *
 * Displays all tracks with controls, handles metering updates
 */

import React, { useEffect, useRef } from 'react';
import { useTrackStore } from '../stores/track-store';
import { TrackHeader } from './TrackHeader';
import { AddTrackButton } from './AddTrackButton';
import { AudioEngine } from '@dawg-ai/audio-engine';
import './TrackList.css';

export const TrackList: React.FC = () => {
  const tracks = useTrackStore((state) => Array.from(state.tracks.values()));
  const selectedTrackId = useTrackStore((state) => state.selectedTrackId);
  const addTrack = useTrackStore((state) => state.addTrack);
  const updateMeter = useTrackStore((state) => state.updateMeter);

  const meterIntervalRef = useRef<number>();

  // Set up real-time meter updates
  useEffect(() => {
    const engine = AudioEngine.getInstance();

    meterIntervalRef.current = window.setInterval(() => {
      tracks.forEach((track) => {
        const engineTrack = engine.getTrack(track.id);
        if (engineTrack) {
          // Get meter level from audio engine
          // In production, this would use AudioWorklet for accurate metering
          const masterBus = engine.getMasterBus();
          const level = Math.abs(masterBus.getMeterLevel()) / 100; // Normalize to 0-1
          updateMeter(track.id, level);
        }
      });
    }, 33); // ~30 FPS (good balance for UI performance)

    return () => {
      if (meterIntervalRef.current) {
        clearInterval(meterIntervalRef.current);
      }
    };
  }, [tracks, updateMeter]);

  const handleAddTrack = (type: 'audio' | 'midi') => {
    addTrack(type);
  };

  return (
    <div className="track-list">
      <div className="track-list-header">
        <h2 className="track-list-title">Tracks</h2>
        <AddTrackButton onAdd={handleAddTrack} />
      </div>

      <div className="track-list-content">
        {tracks.length === 0 ? (
          <div className="track-list-empty">
            <div className="empty-state">
              <svg
                className="empty-icon"
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M9 18V5l12-2v13" />
                <circle cx="6" cy="18" r="3" />
                <circle cx="18" cy="16" r="3" />
              </svg>
              <p className="empty-text">No tracks yet</p>
              <p className="empty-subtext">Add an audio or MIDI track to get started</p>
              <button
                className="empty-action"
                onClick={() => handleAddTrack('audio')}
              >
                Add Your First Track
              </button>
            </div>
          </div>
        ) : (
          <div className="track-list-tracks">
            {tracks.map((track) => (
              <TrackHeader
                key={track.id}
                track={track}
                isSelected={track.id === selectedTrackId}
              />
            ))}
          </div>
        )}
      </div>

      <div className="track-list-footer">
        <span className="track-count">
          {tracks.length} {tracks.length === 1 ? 'track' : 'tracks'}
        </span>
      </div>
    </div>
  );
};

export default TrackList;
