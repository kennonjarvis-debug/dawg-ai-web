/**
 * DAWG AI Design System - Type Definitions
 */

// === COMPONENT SIZES ===
export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// === COMPONENT VARIANTS ===
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type InputVariant = 'default' | 'filled' | 'outlined';

// === COLORS ===
export type Color = string; // Hex format: #RRGGBB

export type StatusColor = 'success' | 'warning' | 'danger' | 'info';

// === KNOB & FADER ===
export interface KnobProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  label?: string;
  unit?: string;
  size?: Size;
  disabled?: boolean;
  bipolar?: boolean; // For centered knobs (e.g., pan)
  sensitivity?: number; // Pixels per value unit
  onchange?: (value: number) => void;
}

export interface FaderProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  label?: string;
  unit?: string;
  height?: number;
  width?: number;
  disabled?: boolean;
  showValue?: boolean;
  onchange?: (value: number) => void;
}

// === METER ===
export type MeterType = 'peak' | 'rms' | 'vu';

export interface MeterProps {
  value: number; // -∞ to 0 dB
  peak?: number;
  type?: MeterType;
  height?: number;
  width?: number;
  showScale?: boolean;
  showPeak?: boolean;
}

// === BUTTON ===
export interface ButtonProps {
  variant?: ButtonVariant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: string;
  iconPosition?: 'left' | 'right';
  onclick?: () => void;
}

// === INPUT ===
export interface InputProps {
  type?: 'text' | 'number' | 'email' | 'password' | 'search';
  value: string | number;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  variant?: InputVariant;
  size?: Size;
  min?: number;
  max?: number;
  step?: number;
  oninput?: (value: string | number) => void;
  onchange?: (value: string | number) => void;
}

// === TOGGLE ===
export interface ToggleProps {
  checked: boolean;
  label?: string;
  disabled?: boolean;
  size?: Size;
  onchange?: (checked: boolean) => void;
}

// === ICON ===
export interface IconProps {
  name: string;
  size?: Size | number;
  color?: string;
  class?: string;
}

// === WAVEFORM ===
export interface WaveformProps {
  audioBuffer?: AudioBuffer;
  width: number;
  height: number;
  color?: string;
  backgroundColor?: string;
  showGrid?: boolean;
  gridColor?: string;
  zoom?: number;
  offset?: number;
}

// === PIANO KEY ===
export interface PianoKeyProps {
  note: number; // MIDI note number
  pressed?: boolean;
  velocity?: number;
  type: 'white' | 'black';
  onpress?: (note: number, velocity: number) => void;
  onrelease?: (note: number) => void;
}

// === FADER CHANNEL ===
export interface FaderChannelProps {
  id: string;
  label: string;
  volume: number;
  pan?: number;
  mute: boolean;
  solo: boolean;
  peak: number;
  color?: Color;
  onVolumeChange?: (value: number) => void;
  onPanChange?: (value: number) => void;
  onMuteToggle?: () => void;
  onSoloToggle?: () => void;
}

// === TRACK HEADER ===
export interface TrackHeaderProps {
  id: string;
  name: string;
  color: Color;
  icon?: string;
  type: 'audio' | 'midi' | 'aux' | 'folder';
  armed?: boolean;
  mute: boolean;
  solo: boolean;
  selected?: boolean;
  onSelect?: () => void;
  onRename?: (name: string) => void;
  onDelete?: () => void;
  onArmToggle?: () => void;
  onMuteToggle?: () => void;
  onSoloToggle?: () => void;
}

// === TRANSPORT CONTROLS ===
export interface TransportControlsProps {
  playing: boolean;
  recording: boolean;
  looping: boolean;
  tempo: number;
  position: string; // Formatted time (e.g., "00:00:00")
  onPlay?: () => void;
  onStop?: () => void;
  onRecord?: () => void;
  onLoop?: () => void;
  onTempoChange?: (tempo: number) => void;
}

// === EFFECT SLOT ===
export interface EffectSlotProps {
  id: string;
  name: string;
  type: string;
  enabled: boolean;
  preset?: string;
  onToggle?: () => void;
  onRemove?: () => void;
  onClick?: () => void;
}

// === MIXER ===
export interface MixerProps {
  channels: FaderChannelProps[];
  masterVolume: number;
  masterPeak: number;
  onMasterVolumeChange?: (value: number) => void;
}

// === TIMELINE ===
export interface TimelineProps {
  width: number;
  height: number;
  pixelsPerBeat: number;
  bars: number;
  beatsPerBar: number;
  currentTime: number;
  loopStart?: number;
  loopEnd?: number;
  onSeek?: (time: number) => void;
}

// === PIANO ROLL ===
export interface PianoRollProps {
  width: number;
  height: number;
  pixelsPerBeat: number;
  lowestNote: number;
  highestNote: number;
  notes: MIDINote[];
  selectedNotes?: string[];
  tool: 'select' | 'draw' | 'erase';
  gridDivision: GridDivision;
  snapToGrid: boolean;
  onNotesChange?: (notes: MIDINote[]) => void;
  onSelectionChange?: (noteIds: string[]) => void;
}

export interface MIDINote {
  id: string;
  pitch: number; // 0-127
  velocity: number; // 0-127
  time: number; // In beats
  duration: number; // In beats
}

export type GridDivision = '1/4' | '1/8' | '1/16' | '1/32' | '1/64' | '1/4T' | '1/8T' | '1/16T';

// === EFFECTS RACK ===
export interface EffectsRackProps {
  effects: EffectSlotProps[];
  onReorder?: (fromIndex: number, toIndex: number) => void;
  onAddEffect?: () => void;
}

// === BROWSER PANEL ===
export interface BrowserItem {
  id: string;
  name: string;
  type: 'folder' | 'audio' | 'midi' | 'preset' | 'plugin';
  path?: string;
  icon?: string;
  children?: BrowserItem[];
}

export interface BrowserPanelProps {
  items: BrowserItem[];
  selectedId?: string;
  onSelect?: (item: BrowserItem) => void;
  onDoubleClick?: (item: BrowserItem) => void;
}

// === INSPECTOR PANEL ===
export interface InspectorPanelProps {
  title: string;
  properties: Property[];
  onPropertyChange?: (key: string, value: any) => void;
}

export interface Property {
  key: string;
  label: string;
  type: 'number' | 'text' | 'select' | 'toggle' | 'color' | 'knob' | 'fader';
  value: any;
  options?: { label: string; value: any }[];
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

// === ACCESSIBILITY ===
export interface A11yProps {
  ariaLabel?: string;
  ariaDescription?: string;
  ariaPressed?: boolean;
  ariaExpanded?: boolean;
  ariaControls?: string;
  ariaLabelledBy?: string;
  ariaDescribedBy?: string;
  role?: string;
  tabIndex?: number;
}

// === EVENTS ===
export interface DragEvent {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  deltaX: number;
  deltaY: number;
}

export interface WheelEvent {
  deltaX: number;
  deltaY: number;
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
}
