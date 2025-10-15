<script lang="ts">
  /**
   * ThemeProvider - Manages light/dark theme with persistence
   * Inspired by BeatStars and Suno's theme toggle
   */
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';
  import './variables.css';
  import './theme.css';

  type Theme = 'dark' | 'light';

  export let defaultTheme: Theme = 'dark';

  // Create a writable store for theme
  const theme = writable<Theme>(defaultTheme);

  // Export the store so other components can access it
  export { theme };

  let mounted = false;

  onMount(() => {
    // Check for saved theme preference or system preference
    const savedTheme = localStorage.getItem('dawg-theme') as Theme | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    theme.set(initialTheme);
    applyTheme(initialTheme);

    mounted = true;

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('dawg-theme')) {
        const newTheme = e.matches ? 'dark' : 'light';
        theme.set(newTheme);
        applyTheme(newTheme);
      }
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  });

  function applyTheme(newTheme: Theme) {
    const root = document.documentElement;

    if (newTheme === 'light') {
      root.classList.add('light');
    } else {
      root.classList.remove('light');
    }

    // Save to localStorage
    localStorage.setItem('dawg-theme', newTheme);
  }

  // Subscribe to theme changes
  $: if (mounted && $theme) {
    applyTheme($theme);
  }

  export function toggleTheme() {
    theme.update(current => current === 'dark' ? 'light' : 'dark');
  }

  export function setTheme(newTheme: Theme) {
    theme.set(newTheme);
  }
</script>

<slot />
