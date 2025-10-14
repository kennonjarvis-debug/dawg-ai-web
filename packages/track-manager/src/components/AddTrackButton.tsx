/**
 * AddTrackButton - Button with dropdown menu for adding tracks
 *
 * Allows user to add audio or MIDI tracks
 */

import React, { useState, useRef, useEffect } from 'react';
import './AddTrackButton.css';

interface AddTrackButtonProps {
  onAdd: (type: 'audio' | 'midi') => void;
  className?: string;
}

export const AddTrackButton: React.FC<AddTrackButtonProps> = ({
  onAdd,
  className = '',
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMenu]);

  const handleAdd = (type: 'audio' | 'midi') => {
    onAdd(type);
    setShowMenu(false);
  };

  return (
    <div className={`add-track-button ${className}`}>
      <button
        ref={buttonRef}
        className="add-track-btn"
        onClick={() => setShowMenu(!showMenu)}
        title="Add Track"
      >
        <span className="add-track-icon">+</span>
        <span className="add-track-text">Add Track</span>
      </button>

      {showMenu && (
        <div ref={menuRef} className="track-menu">
          <button
            className="track-menu-item"
            onClick={() => handleAdd('audio')}
          >
            <span className="track-menu-icon">🎵</span>
            <div className="track-menu-content">
              <span className="track-menu-title">Audio Track</span>
              <span className="track-menu-desc">Record or import audio</span>
            </div>
          </button>

          <button
            className="track-menu-item"
            onClick={() => handleAdd('midi')}
          >
            <span className="track-menu-icon">🎹</span>
            <div className="track-menu-content">
              <span className="track-menu-title">MIDI Track</span>
              <span className="track-menu-desc">Virtual instruments</span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

export default AddTrackButton;
