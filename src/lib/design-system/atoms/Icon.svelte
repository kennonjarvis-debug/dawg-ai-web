<script lang="ts">
  /**
   * Icon Component - SVG icon system
   * Note: This is a placeholder. In production, integrate with your icon library (e.g., Lucide, Heroicons)
   */
  import type { Size } from '../types/design';

  type IconProps = {
    name: string;
    size?: Size | number;
    color?: string;
    class?: string;
  };

  let {
    name,
    size = 'md',
    color = 'currentColor',
    class: className = ''
  }: IconProps = $props();

  const sizeMap: Record<Size, number> = {
    xs: 12,
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32
  };

  const iconSize = $derived(typeof size === 'number' ? size : sizeMap[size]);

  // Basic icon paths (expand with your icon library)
  const icons: Record<string, string> = {
    play: 'M8 5v14l11-7z',
    stop: 'M6 6h12v12H6z',
    record: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z',
    pause: 'M6 4h4v16H6V4zm8 0h4v16h-4V4z',
    loop: 'M17 2.1l4 4-4 4M7 21.9l-4-4 4-4',
    settings: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
    trash: 'M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z',
    plus: 'M12 5v14m-7-7h14',
    minus: 'M5 12h14',
    check: 'M20 6L9 17l-5-5',
    x: 'M18 6L6 18M6 6l12 12',
    volume: 'M11 5L6 9H2v6h4l5 4V5z',
    mute: 'M11 5L6 9H2v6h4l5 4V5zM23 9l-6 6m0-6l6 6',
    solo: 'M20 12a8 8 0 1 0-16 0 8 8 0 0 0 16 0z',
    folder: 'M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-6l-2-2H5a2 2 0 0 0-2 2z',
    audio: 'M9 18V5l12-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM21 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z',
    midi: 'M9 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4m6-16h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4m-6 0a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H9z',
    waveform: 'M2 10h4l3-6 4 12 3-6h6',
    chevronDown: 'M6 9l6 6 6-6',
    chevronRight: 'M9 6l6 6-6 6',
    sun: 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.4 6.4l-.7-.7M6.3 6.3l-.7-.7m12.8 0l-.7.7M6.3 17.7l-.7.7M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0z',
    moon: 'M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z'
  };

  const iconPath = $derived(icons[name] || icons.settings);
</script>

<svg
  width={iconSize}
  height={iconSize}
  viewBox="0 0 24 24"
  fill="none"
  stroke={color}
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
  class="icon {className}"
  aria-hidden="true"
>
  <path d={iconPath} />
</svg>

<style>
  .icon {
    display: inline-block;
    vertical-align: middle;
    flex-shrink: 0;
  }
</style>
