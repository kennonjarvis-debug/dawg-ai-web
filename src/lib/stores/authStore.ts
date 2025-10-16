/**
 * Auth Store
 * Manages user authentication state across the application
 */

import { writable, derived, type Readable } from 'svelte/store';
import { authAPI } from '$lib/api/AuthAPI';
import type { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  session: null,
  isAuthenticated: false,
  isLoading: true,
  error: null
};

function createAuthStore() {
  const { subscribe, set, update } = writable<AuthState>(initialState);

  // Initialize auth state
  let unsubscribeAuth: (() => void) | null = null;

  async function initialize() {
    try {
      // Get initial session
      const session = await authAPI.getSession();
      const user = await authAPI.getCurrentUser();

      update(state => ({
        ...state,
        user,
        session,
        isAuthenticated: !!user,
        isLoading: false
      }));

      // Listen for auth changes
      unsubscribeAuth = authAPI.onAuthStateChange((user, session) => {
        update(state => ({
          ...state,
          user,
          session,
          isAuthenticated: !!user,
          error: null
        }));
      });
    } catch (error) {
      console.error('Auth initialization error:', error);
      update(state => ({
        ...state,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Auth initialization failed'
      }));
    }
  }

  async function signIn(email: string, password: string) {
    update(state => ({ ...state, isLoading: true, error: null }));

    try {
      const session = await authAPI.signIn(email, password);
      const user = await authAPI.getCurrentUser();

      update(state => ({
        ...state,
        user,
        session,
        isAuthenticated: true,
        isLoading: false
      }));

      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sign in failed';
      update(state => ({
        ...state,
        isLoading: false,
        error: message
      }));
      return { success: false, error: message };
    }
  }

  async function signUp(email: string, password: string, name?: string) {
    update(state => ({ ...state, isLoading: true, error: null }));

    try {
      await authAPI.signUp(email, password, name);

      update(state => ({
        ...state,
        isLoading: false
      }));

      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sign up failed';
      update(state => ({
        ...state,
        isLoading: false,
        error: message
      }));
      return { success: false, error: message };
    }
  }

  async function signOut() {
    update(state => ({ ...state, isLoading: true, error: null }));

    try {
      await authAPI.signOut();

      update(state => ({
        ...initialState,
        isLoading: false
      }));

      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sign out failed';
      update(state => ({
        ...state,
        isLoading: false,
        error: message
      }));
      return { success: false, error: message };
    }
  }

  function clearError() {
    update(state => ({ ...state, error: null }));
  }

  function cleanup() {
    if (unsubscribeAuth) {
      unsubscribeAuth();
      unsubscribeAuth = null;
    }
  }

  return {
    subscribe,
    initialize,
    signIn,
    signUp,
    signOut,
    clearError,
    cleanup
  };
}

export const authStore = createAuthStore();

// Derived stores for convenient access
export const user: Readable<User | null> = derived(
  authStore,
  $auth => $auth.user
);

export const isAuthenticated: Readable<boolean> = derived(
  authStore,
  $auth => $auth.isAuthenticated
);

export const isAuthLoading: Readable<boolean> = derived(
  authStore,
  $auth => $auth.isLoading
);
