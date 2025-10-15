/**
 * Knob Drag Utility
 * Handles vertical drag interaction for knob controls
 */

export interface KnobDragOptions {
  min: number;
  max: number;
  value: number;
  step?: number;
  sensitivity?: number; // Pixels per value unit (default: 100)
  onChange: (value: number) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

export interface KnobDragState {
  isDragging: boolean;
  startY: number;
  startValue: number;
}

export function createKnobDrag(options: KnobDragOptions) {
  const {
    min,
    max,
    value,
    step = 0.01,
    sensitivity = 100,
    onChange,
    onDragStart,
    onDragEnd
  } = options;

  const state: KnobDragState = {
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
    const valueChange = (deltaY / sensitivity) * range;

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

  function handleWheel(e: WheelEvent) {
    e.preventDefault();

    const delta = -e.deltaY;
    const range = max - min;
    const valueChange = (delta / sensitivity) * range * 0.5; // Slower for wheel

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
    handleWheel,
    cleanup,
    state
  };
}

/**
 * Map a value to a rotation angle for knob indicator
 * @param value Current value
 * @param min Minimum value
 * @param max Maximum value
 * @param minAngle Minimum angle in degrees (default: -135)
 * @param maxAngle Maximum angle in degrees (default: 135)
 * @returns Rotation angle in degrees
 */
export function mapValueToRotation(
  value: number,
  min: number,
  max: number,
  minAngle = -135,
  maxAngle = 135
): number {
  const normalized = (value - min) / (max - min);
  return minAngle + normalized * (maxAngle - minAngle);
}

/**
 * Format knob value for display
 */
export function formatKnobValue(value: number, unit?: string, decimals = 1): string {
  const formatted = value.toFixed(decimals);
  return unit ? `${formatted}${unit}` : formatted;
}
