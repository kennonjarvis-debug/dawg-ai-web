/**
 * Theme Store - Global theme state management
 */
import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export type Theme = 'dark' | 'light';

function createThemeStore() {
  const { subscribe, set, update } = writable<Theme>('dark');

  return {
    subscribe,
    set,
    update,
    toggle: () => {
      update(current => {
        const newTheme = current === 'dark' ? 'light' : 'dark';
        if (browser) {
          localStorage.setItem('dawg-theme', newTheme);
          if (newTheme === 'light') {
            document.documentElement.classList.add('light');
          } else {
            document.documentElement.classList.remove('light');
          }
        }
        return newTheme;
      });
    },
    initialize: () => {
      if (browser) {
        const savedTheme = localStorage.getItem('dawg-theme') as Theme | null;
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');

        set(initialTheme);

        if (initialTheme === 'light') {
          document.documentElement.classList.add('light');
        } else {
          document.documentElement.classList.remove('light');
        }
      }
    }
  };
}

export const theme = createThemeStore();
