/**
 * Canvas Utility Functions
 * For waveform display, piano roll, and other canvas-based visualizations
 */

/**
 * Get device pixel ratio for sharp rendering on high-DPI displays
 */
export function getDevicePixelRatio(): number {
  return window.devicePixelRatio || 1;
}

/**
 * Setup canvas for high-DPI displays
 */
export function setupCanvas(
  canvas: HTMLCanvasElement,
  width: number,
  height: number
): CanvasRenderingContext2D {
  const dpr = getDevicePixelRatio();

  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  const ctx = canvas.getContext('2d')!;
  ctx.scale(dpr, dpr);

  return ctx;
}

/**
 * Draw waveform from AudioBuffer
 */
export function drawWaveform(
  ctx: CanvasRenderingContext2D,
  audioBuffer: AudioBuffer,
  width: number,
  height: number,
  color = '#a855f7',
  backgroundColor = 'transparent'
) {
  // Clear canvas
  if (backgroundColor !== 'transparent') {
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);
  } else {
    ctx.clearRect(0, 0, width, height);
  }

  const data = audioBuffer.getChannelData(0); // Use first channel
  const step = Math.ceil(data.length / width);
  const amp = height / 2;

  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.beginPath();

  for (let i = 0; i < width; i++) {
    let min = 1.0;
    let max = -1.0;

    for (let j = 0; j < step; j++) {
      const datum = data[i * step + j];
      if (datum < min) min = datum;
      if (datum > max) max = datum;
    }

    const x = i;
    const yMin = (1 + min) * amp;
    const yMax = (1 + max) * amp;

    if (i === 0) {
      ctx.moveTo(x, yMin);
    } else {
      ctx.lineTo(x, yMin);
    }

    ctx.lineTo(x, yMax);
  }

  ctx.stroke();
}

/**
 * Draw gradient waveform
 */
export function drawGradientWaveform(
  ctx: CanvasRenderingContext2D,
  audioBuffer: AudioBuffer,
  width: number,
  height: number,
  gradient: { start: string; end: string } = { start: '#a855f7', end: '#c084fc' }
) {
  const data = audioBuffer.getChannelData(0);
  const step = Math.ceil(data.length / width);
  const amp = height / 2;

  // Create gradient
  const grad = ctx.createLinearGradient(0, 0, width, 0);
  grad.addColorStop(0, gradient.start);
  grad.addColorStop(1, gradient.end);

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(0, amp);

  // Draw top half
  for (let i = 0; i < width; i++) {
    let max = 0;
    for (let j = 0; j < step; j++) {
      const datum = Math.abs(data[i * step + j]);
      if (datum > max) max = datum;
    }
    ctx.lineTo(i, amp - max * amp);
  }

  // Draw bottom half (reverse)
  for (let i = width - 1; i >= 0; i--) {
    let max = 0;
    for (let j = 0; j < step; j++) {
      const datum = Math.abs(data[i * step + j]);
      if (datum > max) max = datum;
    }
    ctx.lineTo(i, amp + max * amp);
  }

  ctx.closePath();
  ctx.fill();
}

/**
 * Draw grid for timeline/piano roll
 */
export function drawGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  cellWidth: number,
  cellHeight: number,
  color = 'rgba(255, 255, 255, 0.05)'
) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;

  // Vertical lines
  for (let x = 0; x <= width; x += cellWidth) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  // Horizontal lines
  for (let y = 0; y <= height; y += cellHeight) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
}

/**
 * Draw meter (VU/Peak)
 */
export function drawMeter(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  value: number, // 0 to 1
  peak?: number,
  gradient: { green: number; yellow: number; red: number } = { green: 0.7, yellow: 0.9, red: 1.0 }
) {
  // Clear
  ctx.clearRect(0, 0, width, height);

  // Create gradient
  const grad = ctx.createLinearGradient(0, height, 0, 0);
  grad.addColorStop(0, '#00ff88'); // Green
  grad.addColorStop(gradient.green, '#00ff88');
  grad.addColorStop(gradient.yellow, '#ffaa00'); // Yellow
  grad.addColorStop(gradient.red, '#ff3366'); // Red

  // Draw meter fill
  const fillHeight = height * value;
  ctx.fillStyle = grad;
  ctx.fillRect(0, height - fillHeight, width, fillHeight);

  // Draw peak indicator
  if (peak !== undefined) {
    const peakY = height - (height * peak);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, peakY - 1, width, 2);
  }
}

/**
 * Clear canvas
 */
export function clearCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  color?: string
) {
  if (color) {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, width, height);
  } else {
    ctx.clearRect(0, 0, width, height);
  }
}

/**
 * Get mouse position relative to canvas
 */
export function getCanvasMousePosition(
  canvas: HTMLCanvasElement,
  e: MouseEvent
): { x: number; y: number } {
  const rect = canvas.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  };
}
