/**
 * TrackHeader - Individual track UI component
 *
 * Displays track controls, name, meters, and parameters
 */

import React, { useState, useRef, useEffect } from 'react';
import { TrackState } from '../types/track';
import { useTrackStore } from '../stores/track-store';
import { TrackMeter } from './TrackMeter';
import './TrackHeader.css';

interface TrackHeaderProps {
  track: TrackState;
  isSelected?: boolean;
}

export const TrackHeader: React.FC<TrackHeaderProps> = ({ track, isSelected = false }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(track.name);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectTrack = useTrackStore((state) => state.selectTrack);
  const setTrackName = useTrackStore((state) => state.setTrackName);
  const setTrackVolume = useTrackStore((state) => state.setTrackVolume);
  const setTrackPan = useTrackStore((state) => state.setTrackPan);
  const toggleMute = useTrackStore((state) => state.toggleMute);
  const toggleSolo = useTrackStore((state) => state.toggleSolo);
  const toggleArm = useTrackStore((state) => state.toggleArm);
  const removeTrack = useTrackStore((state) => state.removeTrack);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSelect = () => {
    selectTrack(track.id);
  };

  const handleNameEdit = () => {
    setIsEditing(true);
    setEditName(track.name);
  };

  const handleNameSave = () => {
    if (editName.trim()) {
      setTrackName(track.id, editName.trim());
    }
    setIsEditing(false);
  };

  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameSave();
    } else if (e.key === 'Escape') {
      setEditName(track.name);
      setIsEditing(false);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const volume = parseFloat(e.target.value);
    setTrackVolume(track.id, volume);
  };

  const handlePanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pan = parseFloat(e.target.value);
    setTrackPan(track.id, pan);
  };

  const handleDelete = () => {
    if (window.confirm(`Delete track "${track.name}"?`)) {
      removeTrack(track.id);
    }
  };

  return (
    <div
      className={`track-header ${isSelected ? 'selected' : ''}`}
      onClick={handleSelect}
      style={{ '--track-color': track.color } as React.CSSProperties}
    >
      <div className="track-color-bar" />

      <div className="track-info">
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            className="track-name-input"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={handleNameSave}
            onKeyDown={handleNameKeyDown}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="track-name" onDoubleClick={handleNameEdit}>
            {track.name}
          </span>
        )}
        <span className="track-type">{track.type.toUpperCase()}</span>
      </div>

      <div className="track-controls">
        <button
          className={`track-btn ${track.armed ? 'active danger' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            toggleArm(track.id);
          }}
          title="Record Arm"
        >
          R
        </button>

        <button
          className={`track-btn ${track.mute ? 'active' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            toggleMute(track.id);
          }}
          title="Mute"
        >
          M
        </button>

        <button
          className={`track-btn ${track.solo ? 'active' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            toggleSolo(track.id);
          }}
          title="Solo"
        >
          S
        </button>
      </div>

      <div className="track-parameters">
        <div className="track-fader">
          <label className="track-label">Volume</label>
          <input
            type="range"
            min="-60"
            max="12"
            step="0.1"
            value={track.volume}
            onChange={handleVolumeChange}
            onClick={(e) => e.stopPropagation()}
            className="track-slider vertical"
            orient="vertical"
          />
          <span className="track-value">{track.volume.toFixed(1)} dB</span>
        </div>

        <div className="track-knob">
          <label className="track-label">Pan</label>
          <input
            type="range"
            min="-1"
            max="1"
            step="0.01"
            value={track.pan}
            onChange={handlePanChange}
            onClick={(e) => e.stopPropagation()}
            className="track-slider"
          />
          <span className="track-value">
            {track.pan === 0 ? 'C' : track.pan > 0 ? `${(track.pan * 100).toFixed(0)}R` : `${Math.abs(track.pan * 100).toFixed(0)}L`}
          </span>
        </div>

        <div className="track-meter-container">
          <label className="track-label">Level</label>
          <TrackMeter level={track.meter} height={60} width={16} />
        </div>
      </div>

      <button
        className="track-delete"
        onClick={(e) => {
          e.stopPropagation();
          handleDelete();
        }}
        title="Delete track"
      >
        ×
      </button>
    </div>
  );
};

export default TrackHeader;
