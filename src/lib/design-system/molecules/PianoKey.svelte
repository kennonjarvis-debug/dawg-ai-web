<script lang="ts">
  /**
   * PianoKey - Individual piano key for piano roll/keyboard
   */
  type PianoKeyProps = {
    note: number;
    pressed?: boolean;
    velocity?: number;
    type: 'white' | 'black';
    onpress?: (note: number, velocity: number) => void;
    onrelease?: (note: number) => void;
  };

  let {
    note,
    pressed = false,
    velocity = 100,
    type,
    onpress,
    onrelease
  }: PianoKeyProps = $props();

  function handleMouseDown(e: MouseEvent) {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const y = e.clientY - rect.top;
    const velocityValue = Math.max(20, Math.min(127, Math.round((1 - y / rect.height) * 127)));
    onpress?.(note, velocityValue);
  }

  function handleMouseUp() {
    onrelease?.(note);
  }

  const isBlack = type === 'black';
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const noteName = noteNames[note % 12];
</script>

<button
  class="
    piano-key
    {isBlack ? 'piano-key-black' : 'piano-key-white'}
    {pressed ? 'pressed' : ''}
  "
  onmousedown={handleMouseDown}
  onmouseup={handleMouseUp}
  onmouseleave={handleMouseUp}
  role="button"
  aria-label="Piano key {noteName}{Math.floor(note / 12) - 1}"
  aria-pressed={pressed}
  data-note={note}
>
  {#if !isBlack}
    <span class="piano-key-label">{noteName}</span>
  {/if}
</button>

<style>
  .piano-key {
    position: relative;
    border: 1px solid var(--color-border);
    transition: all 0.1s;
    cursor: pointer;
    user-select: none;
  }

  .piano-key:active {
    transform: translateY(1px);
  }

  .piano-key-white {
    background: linear-gradient(to bottom, #ffffff, #f0f0f0);
    height: 80px;
    width: 40px;
  }

  .piano-key-white.pressed {
    background: linear-gradient(to bottom, #a855f7, #c084fc);
  }

  .piano-key-black {
    background: linear-gradient(to bottom, #1a1a1a, #0a0a0a);
    height: 50px;
    width: 24px;
    z-index: 1;
    margin: 0 -12px;
  }

  .piano-key-black.pressed {
    background: linear-gradient(to bottom, #7e22ce, #9333ea);
  }

  .piano-key-label {
    position: absolute;
    bottom: 4px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 10px;
    font-weight: 500;
    color: rgba(0, 0, 0, 0.5);
    pointer-events: none;
  }

  .piano-key-white.pressed .piano-key-label {
    color: rgba(255, 255, 255, 0.9);
  }
</style>
