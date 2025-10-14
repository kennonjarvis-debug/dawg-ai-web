/**
 * TrackMeter - Real-time audio level meter
 *
 * Displays peak and RMS levels with proper ballistics
 */

import React, { useEffect, useRef } from 'react';
import './TrackMeter.css';

interface TrackMeterProps {
  level: number; // 0-1
  height?: number;
  width?: number;
  showPeak?: boolean;
}

export const TrackMeter: React.FC<TrackMeterProps> = ({
  level,
  height = 100,
  width = 20,
  showPeak = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const peakLevelRef = useRef<number>(0);
  const peakHoldTimeRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Update peak hold
    if (level > peakLevelRef.current) {
      peakLevelRef.current = level;
      peakHoldTimeRef.current = 60; // Hold for 60 frames (~1 second at 60fps)
    } else if (peakHoldTimeRef.current > 0) {
      peakHoldTimeRef.current--;
    } else {
      peakLevelRef.current = Math.max(0, peakLevelRef.current - 0.01);
    }

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw meter background
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, width, height);

    // Calculate level height
    const levelHeight = level * height;

    // Create gradient
    const gradient = ctx.createLinearGradient(0, height, 0, 0);

    // Green zone (0-60%)
    gradient.addColorStop(0, '#00ff00');
    gradient.addColorStop(0.6, '#00ff00');

    // Yellow zone (60-85%)
    gradient.addColorStop(0.6, '#ffff00');
    gradient.addColorStop(0.85, '#ffff00');

    // Red zone (85-100%)
    gradient.addColorStop(0.85, '#ff4444');
    gradient.addColorStop(1, '#ff0000');

    // Draw level
    ctx.fillStyle = gradient;
    ctx.fillRect(0, height - levelHeight, width, levelHeight);

    // Draw peak indicator
    if (showPeak && peakLevelRef.current > 0) {
      const peakY = height - (peakLevelRef.current * height);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, peakY - 1, width, 2);
    }

    // Draw scale markers
    ctx.fillStyle = '#666666';
    const markers = [0, 0.25, 0.5, 0.75, 1.0];
    markers.forEach((marker) => {
      const y = height - (marker * height);
      ctx.fillRect(0, y, width, 1);
    });
  }, [level, height, width, showPeak]);

  return (
    <div className="track-meter">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="track-meter-canvas"
      />
    </div>
  );
};

export default TrackMeter;
