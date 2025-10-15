/**
 * Fader Drag Utility
 * Handles vertical drag interaction for fader/slider controls
 */

export interface FaderDragOptions {
  min: number;
  max: number;
  value: number;
  step?: number;
  height: number; // Fader track height in pixels
  onChange: (value: number) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

export interface FaderDragState {
  isDragging: boolean;
  startY: number;
  startValue: number;
}

export function createFaderDrag(options: FaderDragOptions) {
  const {
    min,
    max,
    value,
    step = 0.01,
    height,
    onChange,
    onDragStart,
    onDragEnd
  } = options;

  const state: FaderDragState = {
    isDragging: false,
    startY: 0,
    startValue: value
  };

  function handleMouseDown(e: MouseEvent) {
    e.preventDefault();
    state.isDragging = true;
    state.startY = e.clientY;
    state.startValue = value;

    document.body.style.cursor = 'ns-resize';
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    onDragStart?.();
  }

  function handleMouseMove(e: MouseEvent) {
    if (!state.isDragging) return;

    const deltaY = state.startY - e.clientY; // Invert: drag up = increase
    const range = max - min;
    const valueChange = (deltaY / height) * range;

    let newValue = state.startValue + valueChange;

    // Apply step
    if (step) {
      newValue = Math.round(newValue / step) * step;
    }

    // Clamp to min/max
    newValue = Math.max(min, Math.min(max, newValue));

    onChange(newValue);
  }

  function handleMouseUp() {
    if (!state.isDragging) return;

    state.isDragging = false;
    document.body.style.cursor = '';
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);

    onDragEnd?.();
  }

  function handleTrackClick(e: MouseEvent, trackElement: HTMLElement) {
    const rect = trackElement.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    const normalized = 1 - (clickY / rect.height); // Invert: top = max

    let newValue = min + normalized * (max - min);

    // Apply step
    if (step) {
      newValue = Math.round(newValue / step) * step;
    }

    // Clamp to min/max
    newValue = Math.max(min, Math.min(max, newValue));

    onChange(newValue);
  }

  function handleWheel(e: WheelEvent) {
    e.preventDefault();

    const delta = -e.deltaY;
    const range = max - min;
    const valueChange = (delta / height) * range * 0.5; // Slower for wheel

    let newValue = value + valueChange;

    // Apply step
    if (step) {
      newValue = Math.round(newValue / step) * step;
    }

    // Clamp to min/max
    newValue = Math.max(min, Math.min(max, newValue));

    onChange(newValue);
  }

  function cleanup() {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = '';
  }

  return {
    handleMouseDown,
    handleTrackClick,
    handleWheel,
    cleanup,
    state
  };
}

/**
 * Map a value to a position (0-1) for fader thumb
 */
export function mapValueToPosition(value: number, min: number, max: number): number {
  return (value - min) / (max - min);
}

/**
 * Format fader value for display (optimized for dB)
 */
export function formatFaderValue(value: number, unit?: string): string {
  if (unit === 'dB') {
    if (value <= -90) return '-∞ dB';
    return `${value.toFixed(1)} dB`;
  }

  if (unit === '%') {
    return `${Math.round(value)}%`;
  }

  return value.toFixed(1) + (unit || '');
}
