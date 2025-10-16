<script lang="ts">
/**
 * Authentication Modal Component
 * Module 10: Cloud Storage & Backend
 *
 * Handles user login and signup
 */

import { createEventDispatcher } from 'svelte';
import { authAPI } from '$lib/api/AuthAPI';

const dispatch = createEventDispatcher();

export let mode: 'signin' | 'signup' = 'signin';
export let isOpen = false;

let email = '';
let password = '';
let confirmPassword = '';
let name = '';
let isLoading = false;
let error: string | null = null;

$: isSignup = mode === 'signup';
$: title = isSignup ? 'Create Account' : 'Sign In';
$: submitText = isSignup ? 'Sign Up' : 'Sign In';

function switchMode() {
  mode = isSignup ? 'signin' : 'signup';
  error = null;
}

function close() {
  isOpen = false;
  resetForm();
  dispatch('close');
}

function resetForm() {
  email = '';
  password = '';
  confirmPassword = '';
  name = '';
  error = null;
}

async function handleSubmit() {
  error = null;

  // Validation
  if (!email || !password) {
    error = 'Email and password are required';
    return;
  }

  if (!email.includes('@')) {
    error = 'Please enter a valid email address';
    return;
  }

  if (password.length < 8) {
    error = 'Password must be at least 8 characters long';
    return;
  }

  if (isSignup && password !== confirmPassword) {
    error = 'Passwords do not match';
    return;
  }

  isLoading = true;

  try {
    if (isSignup) {
      await authAPI.signUp(email, password, name);
      dispatch('signup', { email });
      close();
      alert('Account created! Please check your email to confirm your account.');
    } else {
      const session = await authAPI.signIn(email, password);
      dispatch('signin', { session });
      close();
    }
  } catch (err) {
    error = err instanceof Error ? err.message : 'Authentication failed';
    console.error('Authentication error:', err);
  } finally {
    isLoading = false;
  }
}

async function handleOAuthSignIn(provider: 'google' | 'github') {
  try {
    await authAPI.signInWithOAuth(provider);
  } catch (err) {
    error = err instanceof Error ? err.message : 'OAuth sign in failed';
    console.error('OAuth error:', err);
  }
}
</script>

{#if isOpen}
  <div class="modal-overlay" on:click={close}>
    <div class="modal" on:click|stopPropagation>
      <div class="modal-header">
        <h2>{title}</h2>
        <button class="close-btn" on:click={close}>✕</button>
      </div>

      <form class="modal-body" on:submit|preventDefault={handleSubmit}>
        {#if isSignup}
          <label>
            <span>Name (optional)</span>
            <input
              type="text"
              bind:value={name}
              placeholder="John Doe"
              disabled={isLoading}
            />
          </label>
        {/if}

        <label>
          <span>Email</span>
          <input
            type="email"
            bind:value={email}
            placeholder="you@example.com"
            required
            disabled={isLoading}
            autofocus
          />
        </label>

        <label>
          <span>Password</span>
          <input
            type="password"
            bind:value={password}
            placeholder="••••••••"
            required
            disabled={isLoading}
          />
        </label>

        {#if isSignup}
          <label>
            <span>Confirm Password</span>
            <input
              type="password"
              bind:value={confirmPassword}
              placeholder="••••••••"
              required
              disabled={isLoading}
            />
          </label>
        {/if}

        {#if error}
          <div class="error-message">{error}</div>
        {/if}

        <button type="submit" class="btn-primary" disabled={isLoading}>
          {isLoading ? 'Loading...' : submitText}
        </button>

        <div class="divider">
          <span>or</span>
        </div>

        <div class="oauth-buttons">
          <button
            type="button"
            class="btn-oauth"
            on:click={() => handleOAuthSignIn('google')}
            disabled={isLoading}
          >
            <span class="oauth-icon">
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            </span>
            Continue with Google
          </button>

          <button
            type="button"
            class="btn-oauth"
            on:click={() => handleOAuthSignIn('github')}
            disabled={isLoading}
          >
            <span class="oauth-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
            </span>
            Continue with GitHub
          </button>
        </div>

        <div class="switch-mode">
          {#if isSignup}
            Already have an account?
            <button type="button" on:click={switchMode}>Sign in</button>
          {:else}
            Don't have an account?
            <button type="button" on:click={switchMode}>Sign up</button>
          {/if}
        </div>
      </form>
    </div>
  </div>
{/if}

<style>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 0.75rem;
  max-width: 450px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e5e5;
}

.modal-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  width: 2rem;
  height: 2rem;
}

.modal-body {
  padding: 1.5rem;
}

.modal-body label {
  display: block;
  margin-bottom: 1rem;
}

.modal-body label span {
  display: block;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.modal-body input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 0.5rem;
  font-size: 1rem;
}

.modal-body input:focus {
  outline: none;
  border-color: #2563eb;
}

.modal-body input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.error-message {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 0.75rem;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  font-size: 0.875rem;
}

.btn-primary {
  width: 100%;
  padding: 0.75rem;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-primary:hover:not(:disabled) {
  background: #1d4ed8;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.divider {
  position: relative;
  text-align: center;
  margin: 1.5rem 0;
}

.divider::before {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  height: 1px;
  background: #e5e5e5;
}

.divider span {
  position: relative;
  background: white;
  padding: 0 1rem;
  color: #666;
  font-size: 0.875rem;
}

.oauth-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.btn-oauth {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem;
  background: white;
  border: 1px solid #e5e5e5;
  border-radius: 0.5rem;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-oauth:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #d1d5db;
}

.btn-oauth:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.oauth-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  font-weight: 600;
}

.switch-mode {
  text-align: center;
  color: #666;
  font-size: 0.875rem;
}

.switch-mode button {
  background: none;
  border: none;
  color: #2563eb;
  cursor: pointer;
  font-weight: 500;
  padding: 0;
  margin-left: 0.25rem;
}

.switch-mode button:hover {
  text-decoration: underline;
}
</style>
