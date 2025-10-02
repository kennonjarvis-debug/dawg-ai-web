/**
 * ExerciseLibrary - Instance 2 (Audio Widgets)
 *
 * Library of vocal exercises for targeted skill practice
 * Exercises filtered by skill area, difficulty, and user profile
 */

'use client';

import { useState } from 'react';
import styles from './ExerciseLibrary.module.css';

interface ExerciseLibraryProps {
  profileId?: string;
  onExerciseStart?: (exerciseId: string) => void;
}

interface VocalExercise {
  id: string;
  name: string;
  description: string;
  targetArea: string;
  difficulty: number; // 1-5
  durationSeconds: number;
  instructions: string[];
  targetNotes: string[];
  audioGuideUrl?: string;
  videoTutorialUrl?: string;
}

const MOCK_EXERCISES: VocalExercise[] = [
  {
    id: 'ex_breathing_01',
    name: 'Diaphragm Breathing',
    description: 'Build breath support and control through focused diaphragm exercises',
    targetArea: 'breathing',
    difficulty: 1,
    durationSeconds: 180,
    instructions: [
      'Place hand on stomach, below ribcage',
      'Inhale deeply through nose, feel stomach expand',
      'Exhale slowly through mouth, stomach contracts',
      'Repeat 10 times, keeping shoulders relaxed',
    ],
    targetNotes: [],
  },
  {
    id: 'ex_pitch_01',
    name: 'Siren Slides',
    description: 'Smooth pitch transitions from low to high register',
    targetArea: 'pitch_control',
    difficulty: 2,
    durationSeconds: 240,
    instructions: [
      'Start on comfortable low note',
      'Slide smoothly up to highest comfortable note',
      'Slide back down to starting note',
      'Keep tone even and supported throughout',
    ],
    targetNotes: ['C3', 'C5'],
  },
  {
    id: 'ex_range_01',
    name: 'Octave Jumps',
    description: 'Build vocal range and interval accuracy',
    targetArea: 'range_extension',
    difficulty: 3,
    durationSeconds: 300,
    instructions: [
      'Sing "ah" on C4',
      'Jump up to C5 (one octave)',
      'Jump back down to C4',
      'Repeat, moving up by half-steps',
    ],
    targetNotes: ['C4', 'C5', 'C#4', 'C#5', 'D4', 'D5'],
  },
  {
    id: 'ex_vibrato_01',
    name: 'Vibrato Development',
    description: 'Learn controlled vibrato technique',
    targetArea: 'vibrato',
    difficulty: 4,
    durationSeconds: 360,
    instructions: [
      'Sing sustained "ah" on A4',
      'Relax throat completely',
      'Let natural oscillation develop (4-6 Hz)',
      'Control speed and width gradually',
    ],
    targetNotes: ['A4', 'Bb4', 'B4'],
  },
  {
    id: 'ex_agility_01',
    name: 'Lip Trills',
    description: 'Improve vocal agility and relaxation',
    targetArea: 'agility',
    difficulty: 2,
    durationSeconds: 180,
    instructions: [
      'Relax lips loosely together',
      'Blow air through lips to create trill',
      'Add pitch, starting on C4',
      'Move up and down scale while trilling',
    ],
    targetNotes: ['C4', 'D4', 'E4', 'F4', 'G4'],
  },
  {
    id: 'ex_warmup_01',
    name: '5-Tone Scale Warmup',
    description: 'Standard warmup exercise for vocal preparation',
    targetArea: 'warmup',
    difficulty: 1,
    durationSeconds: 240,
    instructions: [
      'Sing "do-re-mi-fa-sol-fa-mi-re-do"',
      'Start on comfortable pitch (C4)',
      'Move up by half-steps',
      'Keep tone consistent across range',
    ],
    targetNotes: ['C4', 'D4', 'E4', 'F4', 'G4'],
  },
  {
    id: 'ex_resonance_01',
    name: 'Humming Resonance',
    description: 'Develop forward resonance and placement',
    targetArea: 'tone_quality',
    difficulty: 2,
    durationSeconds: 180,
    instructions: [
      'Hum with lips closed, teeth slightly apart',
      'Feel vibration in nose and face (mask)',
      'Move through comfortable pitch range',
      'Transition to "mah" on same pitch',
    ],
    targetNotes: ['G3', 'A3', 'B3', 'C4'],
  },
  {
    id: 'ex_belting_01',
    name: 'Belt Training',
    description: 'Develop powerful chest voice coordination',
    targetArea: 'power',
    difficulty: 5,
    durationSeconds: 300,
    instructions: [
      'Start with "hey" on E4 with strong support',
      'Keep chest voice engaged (no flip to head)',
      'Gradually increase volume and intensity',
      'Move up to G4, maintain chest coordination',
    ],
    targetNotes: ['E4', 'F4', 'F#4', 'G4'],
  },
];

export function ExerciseLibrary({ profileId, onExerciseStart }: ExerciseLibraryProps) {
  const [selectedArea, setSelectedArea] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<number>(0); // 0 = all
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);

  const areas = [
    { id: 'all', name: 'All Areas' },
    { id: 'breathing', name: 'Breathing' },
    { id: 'pitch_control', name: 'Pitch Control' },
    { id: 'range_extension', name: 'Range Extension' },
    { id: 'vibrato', name: 'Vibrato' },
    { id: 'agility', name: 'Agility' },
    { id: 'warmup', name: 'Warmup' },
    { id: 'tone_quality', name: 'Tone Quality' },
    { id: 'power', name: 'Power/Belting' },
  ];

  const filteredExercises = MOCK_EXERCISES.filter((ex) => {
    const areaMatch = selectedArea === 'all' || ex.targetArea === selectedArea;
    const difficultyMatch = selectedDifficulty === 0 || ex.difficulty === selectedDifficulty;
    return areaMatch && difficultyMatch;
  });

  const handleExerciseClick = (exerciseId: string) => {
    setExpandedExercise(expandedExercise === exerciseId ? null : exerciseId);
  };

  const handleStartExercise = (exerciseId: string) => {
    if (onExerciseStart) {
      onExerciseStart(exerciseId);
    } else {
      alert(`Starting exercise: ${exerciseId}\n\nThis would launch the exercise practice mode.`);
    }
  };

  const getDifficultyLabel = (difficulty: number): string => {
    const labels = ['', 'Beginner', 'Easy', 'Intermediate', 'Advanced', 'Expert'];
    return labels[difficulty] || '';
  };

  const getDifficultyColor = (difficulty: number): string => {
    if (difficulty <= 2) return '#00ff88';
    if (difficulty === 3) return '#00e5ff';
    if (difficulty === 4) return '#ffaa00';
    return '#ff5555';
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.title}>Vocal Exercise Library</div>
        <div className={styles.subtitle}>
          {filteredExercises.length} exercises available
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <div className={styles.filterLabel}>Skill Area</div>
          <select
            className={styles.filterSelect}
            value={selectedArea}
            onChange={(e) => setSelectedArea(e.target.value)}
          >
            {areas.map((area) => (
              <option key={area.id} value={area.id}>
                {area.name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <div className={styles.filterLabel}>Difficulty</div>
          <select
            className={styles.filterSelect}
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(Number(e.target.value))}
          >
            <option value={0}>All Levels</option>
            <option value={1}>Beginner</option>
            <option value={2}>Easy</option>
            <option value={3}>Intermediate</option>
            <option value={4}>Advanced</option>
            <option value={5}>Expert</option>
          </select>
        </div>
      </div>

      {/* Exercise List */}
      <div className={styles.exerciseList}>
        {filteredExercises.length === 0 && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🎵</div>
            <div className={styles.emptyText}>
              No exercises match your filters. Try adjusting your selection.
            </div>
          </div>
        )}

        {filteredExercises.map((exercise) => {
          const isExpanded = expandedExercise === exercise.id;

          return (
            <div
              key={exercise.id}
              className={`${styles.exerciseCard} ${isExpanded ? styles.expanded : ''}`}
            >
              <div
                className={styles.exerciseHeader}
                onClick={() => handleExerciseClick(exercise.id)}
              >
                <div className={styles.exerciseInfo}>
                  <div className={styles.exerciseName}>{exercise.name}</div>
                  <div className={styles.exerciseMeta}>
                    <span
                      className={styles.difficulty}
                      style={{ color: getDifficultyColor(exercise.difficulty) }}
                    >
                      {getDifficultyLabel(exercise.difficulty)}
                    </span>
                    <span className={styles.duration}>{formatDuration(exercise.durationSeconds)}</span>
                  </div>
                </div>
                <div className={styles.expandIcon}>{isExpanded ? '−' : '+'}</div>
              </div>

              {isExpanded && (
                <div className={styles.exerciseBody}>
                  <div className={styles.description}>{exercise.description}</div>

                  <div className={styles.instructions}>
                    <div className={styles.instructionsTitle}>Instructions</div>
                    <ol className={styles.instructionsList}>
                      {exercise.instructions.map((instruction, index) => (
                        <li key={index}>{instruction}</li>
                      ))}
                    </ol>
                  </div>

                  {exercise.targetNotes.length > 0 && (
                    <div className={styles.targetNotes}>
                      <div className={styles.targetNotesLabel}>Target Notes</div>
                      <div className={styles.notesList}>
                        {exercise.targetNotes.map((note, index) => (
                          <div key={index} className={styles.note}>
                            {note}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className={styles.actions}>
                    <button
                      className={styles.startButton}
                      onClick={() => handleStartExercise(exercise.id)}
                    >
                      Start Exercise
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
