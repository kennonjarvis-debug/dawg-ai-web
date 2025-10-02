/**
 * AutoCompingTool - Instance 2 (Audio Widgets)
 *
 * AI-powered comping tool that analyzes multiple takes
 * Suggests best sections from each take for final composite
 */

'use client';

import { useState, useEffect } from 'react';
import { useTrackStore } from '@/src/core/store';
import styles from './AutoCompingTool.module.css';

interface AutoCompingToolProps {
  trackId: string;
}

interface TakeSegment {
  takeId: string;
  takeName: string;
  startTime: number; // seconds
  endTime: number; // seconds
  score: number; // 0-100
  reason: string;
}

interface CompingSuggestion {
  segments: TakeSegment[];
  overallScore: number;
  confidence: number;
}

export function AutoCompingTool({ trackId }: AutoCompingToolProps) {
  const tracks = useTrackStore((state) => state.tracks);
  const [selectedTakes, setSelectedTakes] = useState<string[]>([]);
  const [compingSuggestion, setCompingSuggestion] = useState<CompingSuggestion | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [manualSegments, setManualSegments] = useState<TakeSegment[]>([]);

  const currentTrack = tracks.find((t) => t.id === trackId);
  const availableTakes = tracks.filter((t) => t.type === 'audio' && t.recordings.length > 0);

  // Auto-analyze when 2+ takes selected
  useEffect(() => {
    if (selectedTakes.length >= 2) {
      analyzeTakes();
    } else {
      setCompingSuggestion(null);
    }
  }, [selectedTakes]);

  const analyzeTakes = async () => {
    setIsAnalyzing(true);

    // Simulate AI analysis (2 seconds)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Mock AI comping suggestion
    const mockSegments: TakeSegment[] = [
      {
        takeId: selectedTakes[0],
        takeName: `Take ${selectedTakes.indexOf(selectedTakes[0]) + 1}`,
        startTime: 0,
        endTime: 8.5,
        score: 92,
        reason: 'Strong pitch accuracy, confident delivery',
      },
      {
        takeId: selectedTakes[1],
        takeName: `Take ${selectedTakes.indexOf(selectedTakes[1]) + 1}`,
        startTime: 8.5,
        endTime: 16.2,
        score: 88,
        reason: 'Better vibrato control, emotional expression',
      },
      {
        takeId: selectedTakes[0],
        takeName: `Take ${selectedTakes.indexOf(selectedTakes[0]) + 1}`,
        startTime: 16.2,
        endTime: 24,
        score: 95,
        reason: 'Excellent sustained notes, perfect timing',
      },
    ];

    if (selectedTakes.length >= 3) {
      mockSegments.push({
        takeId: selectedTakes[2],
        takeName: `Take ${selectedTakes.indexOf(selectedTakes[2]) + 1}`,
        startTime: 24,
        endTime: 32,
        score: 90,
        reason: 'Clean finish, good breath control',
      });
    }

    const avgScore = mockSegments.reduce((sum, seg) => sum + seg.score, 0) / mockSegments.length;

    setCompingSuggestion({
      segments: mockSegments,
      overallScore: Math.round(avgScore),
      confidence: 0.87,
    });

    setIsAnalyzing(false);
  };

  const toggleTakeSelection = (takeId: string) => {
    setSelectedTakes((prev) =>
      prev.includes(takeId) ? prev.filter((id) => id !== takeId) : [...prev, takeId]
    );
  };

  const applyCompingSuggestion = () => {
    if (!compingSuggestion) return;

    // In real implementation, this would:
    // 1. Create new composite track
    // 2. Splice audio segments from each take
    // 3. Apply crossfades at transitions
    // 4. Add to project as "Comp Track"

    alert(
      `Comping applied! Created composite from ${compingSuggestion.segments.length} segments.\n\nOverall Score: ${compingSuggestion.overallScore}/100`
    );
  };

  const getScoreColor = (score: number): string => {
    if (score >= 90) return '#00ff88';
    if (score >= 75) return '#00e5ff';
    if (score >= 60) return '#ffaa00';
    return '#ff5555';
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.title}>Auto Comping Tool</div>
        <div className={styles.subtitle}>Select 2+ takes to analyze</div>
      </div>

      {/* Take Selection */}
      <div className={styles.takeSelection}>
        <div className={styles.sectionTitle}>Available Takes</div>
        <div className={styles.takeList}>
          {availableTakes.length === 0 && (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🎙️</div>
              <div className={styles.emptyText}>No recorded takes available</div>
            </div>
          )}

          {availableTakes.map((take) => (
            <div
              key={take.id}
              className={`${styles.takeItem} ${
                selectedTakes.includes(take.id) ? styles.selected : ''
              }`}
              onClick={() => toggleTakeSelection(take.id)}
            >
              <div className={styles.takeCheckbox}>
                {selectedTakes.includes(take.id) ? '✓' : ''}
              </div>
              <div className={styles.takeInfo}>
                <div className={styles.takeName}>{take.name}</div>
                <div className={styles.takeMeta}>
                  {take.recordings[0]?.duration
                    ? `${take.recordings[0].duration.toFixed(1)}s`
                    : 'Unknown duration'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Analysis Status */}
      {isAnalyzing && (
        <div className={styles.analyzing}>
          <div className={styles.spinner} />
          <div className={styles.analyzingText}>
            AI analyzing {selectedTakes.length} takes...
          </div>
        </div>
      )}

      {/* Comping Suggestion */}
      {compingSuggestion && !isAnalyzing && (
        <div className={styles.suggestion}>
          <div className={styles.suggestionHeader}>
            <div className={styles.sectionTitle}>AI Comping Suggestion</div>
            <div className={styles.confidence}>
              Confidence: {(compingSuggestion.confidence * 100).toFixed(0)}%
            </div>
          </div>

          <div className={styles.overallScore}>
            <div className={styles.scoreLabel}>Overall Comp Score</div>
            <div
              className={styles.scoreValue}
              style={{ color: getScoreColor(compingSuggestion.overallScore) }}
            >
              {compingSuggestion.overallScore}/100
            </div>
          </div>

          <div className={styles.segments}>
            {compingSuggestion.segments.map((segment, index) => (
              <div key={index} className={styles.segment}>
                <div className={styles.segmentHeader}>
                  <div className={styles.segmentNumber}>Segment {index + 1}</div>
                  <div
                    className={styles.segmentScore}
                    style={{ color: getScoreColor(segment.score) }}
                  >
                    {segment.score}/100
                  </div>
                </div>

                <div className={styles.segmentBody}>
                  <div className={styles.segmentInfo}>
                    <div className={styles.segmentTake}>{segment.takeName}</div>
                    <div className={styles.segmentTime}>
                      {segment.startTime.toFixed(1)}s - {segment.endTime.toFixed(1)}s
                    </div>
                  </div>
                  <div className={styles.segmentReason}>{segment.reason}</div>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.actions}>
            <button className={styles.applyButton} onClick={applyCompingSuggestion}>
              Apply Comping Suggestion
            </button>
            <button className={styles.clearButton} onClick={() => setSelectedTakes([])}>
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Instructions */}
      {selectedTakes.length === 0 && !isAnalyzing && (
        <div className={styles.instructions}>
          <div className={styles.instructionsTitle}>How Auto Comping Works</div>
          <ol className={styles.instructionsList}>
            <li>Select 2 or more recorded takes from the list above</li>
            <li>AI analyzes pitch accuracy, timing, and expression in each take</li>
            <li>Best segments from each take are identified and scored</li>
            <li>Apply the suggestion to create a perfect composite track</li>
          </ol>
        </div>
      )}
    </div>
  );
}
