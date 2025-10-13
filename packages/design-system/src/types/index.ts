/**
 * DAWG AI Design System - TypeScript Type Definitions
 */

// ============================================
// Common Component Props
// ============================================

export type Size = 'sm' | 'md' | 'lg';
export type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';
export type Color = 'accent-primary' | 'accent-secondary' | 'accent-tertiary' | 'success' | 'warning' | 'error';

// ============================================
// Atom Component Props
// ============================================

export interface ButtonProps {
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onclick?: (event: MouseEvent) => void;
  class?: string;
}

export interface KnobProps {
  value: number;
  label?: string;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  onchange?: (value: number) => void;
  class?: string;
}

export interface FaderProps {
  value: number;
  label?: string;
  height?: number;
  disabled?: boolean;
  onchange?: (value: number) => void;
  class?: string;
}

export interface ToggleProps {
  checked: boolean;
  label?: string;
  disabled?: boolean;
  onchange?: (checked: boolean) => void;
  class?: string;
}

export interface InputProps {
  value: string | number;
  type?: 'text' | 'number' | 'email' | 'password';
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  min?: number;
  max?: number;
  step?: number;
  oninput?: (value: string | number) => void;
  class?: string;
}

export interface LabelProps {
  text: string;
  tooltip?: string;
  required?: boolean;
  for?: string;
  class?: string;
}

export interface IconProps {
  name: string;
  size?: Size;
  color?: Color;
  class?: string;
}

export interface MeterProps {
  level: number; // 0-1 (dB converted to linear)
  peaks?: number[]; // Array of recent peak values
  orientation?: 'vertical' | 'horizontal';
  height?: number;
  width?: number;
  class?: string;
}

// ============================================
// Molecule Component Props
// ============================================

export interface FaderChannelProps {
  value: number;
  label: string;
  meterLevel?: number;
  color?: string;
  onchange?: (value: number) => void;
  class?: string;
}

export interface TrackHeaderProps {
  name: string;
  color?: string;
  muted?: boolean;
  solo?: boolean;
  armed?: boolean;
  onNameChange?: (name: string) => void;
  onMuteToggle?: () => void;
  onSoloToggle?: () => void;
  onArmToggle?: () => void;
  onColorChange?: (color: string) => void;
  class?: string;
}

export interface TransportControlsProps {
  playing: boolean;
  recording: boolean;
  bpm?: number;
  onPlayPause?: () => void;
  onStop?: () => void;
  onRecord?: () => void;
  onBpmChange?: (bpm: number) => void;
  class?: string;
}

export interface ParameterControlProps {
  label: string;
  value: number;
  type?: 'knob' | 'fader';
  min?: number;
  max?: number;
  step?: number;
  onchange?: (value: number) => void;
  class?: string;
}

export interface EffectSlotProps {
  effectName?: string;
  bypassed?: boolean;
  availableEffects?: string[];
  onEffectSelect?: (effect: string) => void;
  onBypassToggle?: () => void;
  onRemove?: () => void;
  class?: string;
}

export interface VolumeControlProps {
  value: number;
  showFader?: boolean;
  showNumeric?: boolean;
  onchange?: (value: number) => void;
  class?: string;
}

// ============================================
// Organism Component Props
// ============================================

export interface Track {
  id: string;
  name: string;
  color?: string;
  volume: number;
  pan: number;
  muted: boolean;
  solo: boolean;
  armed: boolean;
  meterLevel?: number;
}

export interface MixerProps {
  tracks: Track[];
  onTrackUpdate?: (trackId: string, updates: Partial<Track>) => void;
  class?: string;
}

export interface TimelineProps {
  duration: number;
  currentTime: number;
  waveformData?: Float32Array;
  regions?: TimelineRegion[];
  zoom?: number;
  onSeek?: (time: number) => void;
  onZoomChange?: (zoom: number) => void;
  class?: string;
}

export interface TimelineRegion {
  id: string;
  start: number;
  end: number;
  color?: string;
  label?: string;
}

export interface PianoRollProps {
  notes: MidiNote[];
  duration: number;
  selectedNotes?: string[];
  onNoteAdd?: (note: MidiNote) => void;
  onNoteUpdate?: (noteId: string, updates: Partial<MidiNote>) => void;
  onNoteDelete?: (noteId: string) => void;
  onSelectionChange?: (noteIds: string[]) => void;
  class?: string;
}

export interface MidiNote {
  id: string;
  pitch: number; // 0-127
  start: number; // Time in beats or seconds
  duration: number;
  velocity: number; // 0-127
}

export interface Effect {
  id: string;
  name: string;
  type: string;
  bypassed: boolean;
  parameters?: Record<string, number>;
}

export interface EffectsRackProps {
  effects: Effect[];
  availableEffects?: string[];
  onEffectAdd?: (effectType: string) => void;
  onEffectUpdate?: (effectId: string, updates: Partial<Effect>) => void;
  onEffectRemove?: (effectId: string) => void;
  onEffectReorder?: (fromIndex: number, toIndex: number) => void;
  class?: string;
}

export interface TrackListProps {
  tracks: Track[];
  selectedTrackId?: string;
  onTrackSelect?: (trackId: string) => void;
  onTrackAdd?: () => void;
  onTrackDelete?: (trackId: string) => void;
  onTrackReorder?: (fromIndex: number, toIndex: number) => void;
  class?: string;
}

export interface InspectorPanelProps {
  selectedItem?: Track | Effect | MidiNote;
  itemType?: 'track' | 'effect' | 'note';
  onUpdate?: (updates: any) => void;
  class?: string;
}

// ============================================
// Utility Types
// ============================================

export type ComponentSize = Size;
export type ComponentVariant = Variant;
export type ComponentColor = Color;

export interface StyleProps {
  class?: string;
  style?: string;
}
