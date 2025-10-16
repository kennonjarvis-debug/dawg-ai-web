/**
 * Proactive Suggestions - Context-aware AI suggestions
 * Instance 2: Jarvis AI Brain + NLU
 */

import type { SessionContext } from '../context/SessionContext';
import { getJarvis } from './Jarvis';

/**
 * DAW State interface (minimal for now)
 * TODO: Expand when Instance 1 (Design System) and other modules are ready
 */
export interface DAWState {
  isPlaying: boolean;
  isRecording: boolean;
  hasActiveTracks: boolean;
  currentBeat?: string;
  recentActivity: 'idle' | 'active' | 'busy';
  timeSinceLastAction: number; // milliseconds
}

/**
 * Suggestion trigger types
 */
export type SuggestionTrigger =
  | 'inactivity'
  | 'section_complete'
  | 'user_stuck'
  | 'beat_loaded'
  | 'recording_complete'
  | 'no_effects';

/**
 * Proactive Suggestions Engine
 */
export class ProactiveSuggestions {
  private triggers = {
    inactivity: 30000,        // 30 seconds
    sectionComplete: true,
    userStuck: true,
  };

  private lastSuggestionTime: number = 0;
  private suggestionCooldown: number = 60000; // 1 minute between suggestions

  /**
   * Generate a proactive suggestion based on context and DAW state
   */
  async generateSuggestion(
    context: SessionContext,
    currentState: DAWState
  ): Promise<string | null> {
    // Check cooldown (don't spam suggestions)
    if (Date.now() - this.lastSuggestionTime < this.suggestionCooldown) {
      return null;
    }

    // Identify trigger
    const trigger = this.identifyTrigger(context, currentState);
    if (!trigger) {
      return null;
    }

    // Generate suggestion based on trigger
    const suggestion = await this.generateSuggestionForTrigger(trigger, context, currentState);

    if (suggestion) {
      this.lastSuggestionTime = Date.now();
    }

    return suggestion;
  }

  /**
   * Identify what triggered the suggestion
   */
  private identifyTrigger(
    context: SessionContext,
    state: DAWState
  ): SuggestionTrigger | null {
    // Inactivity: User hasn't done anything in 30s
    if (state.timeSinceLastAction > this.triggers.inactivity && !state.isPlaying) {
      return 'inactivity';
    }

    // Beat loaded but no recording started
    if (state.currentBeat && !state.hasActiveTracks && state.timeSinceLastAction > 15000) {
      return 'beat_loaded';
    }

    // Recording complete, might want to comp
    if (!state.isRecording && state.hasActiveTracks) {
      const recentRecordings = context.recentActions.filter(a =>
        a.type === 'transport.record'
      );
      if (recentRecordings.length >= 2) {
        return 'recording_complete';
      }
    }

    // Has tracks but no effects
    if (state.hasActiveTracks && !state.isPlaying) {
      const hasEffects = context.recentActions.some(a => a.type.startsWith('effect.'));
      if (!hasEffects) {
        return 'no_effects';
      }
    }

    // User stuck (same action repeated multiple times)
    if (this.detectStuckPattern(context)) {
      return 'user_stuck';
    }

    return null;
  }

  /**
   * Detect if user is stuck (repeating the same action)
   */
  private detectStuckPattern(context: SessionContext): boolean {
    const recentActions = context.recentActions.slice(-5);
    if (recentActions.length < 3) return false;

    // Check if same action type repeated
    const actionTypes = recentActions.map(a => a.type);
    const uniqueTypes = new Set(actionTypes);

    // If only 1-2 unique actions in last 5, user might be stuck
    return uniqueTypes.size <= 2;
  }

  /**
   * Generate suggestion for specific trigger
   */
  private async generateSuggestionForTrigger(
    trigger: SuggestionTrigger,
    context: SessionContext,
    state: DAWState
  ): Promise<string | null> {
    const jarvis = getJarvis();

    switch (trigger) {
      case 'inactivity':
        return this.getSuggestionInactivity(context);

      case 'beat_loaded':
        return this.getSuggestionBeatLoaded(context);

      case 'recording_complete':
        return this.getSuggestionRecordingComplete(context);

      case 'no_effects':
        return this.getSuggestionNoEffects(context);

      case 'user_stuck':
        return jarvis.generateProactiveSuggestion(context); // Use LLM for complex situations

      default:
        return null;
    }
  }

  /**
   * Suggestion: User is inactive
   */
  private getSuggestionInactivity(context: SessionContext): string {
    const suggestions = [
      "Want to load a beat and get started?",
      "Ready to create something? I can help find a vibe.",
      "Feeling stuck? Let's try a new style—maybe something unexpected?",
      "How about we jam on a fresh idea?"
    ];

    // Match user energy
    if (context.userEnergy === 'chill') {
      return "No rush—let me know when you want to vibe.";
    } else if (context.userEnergy === 'hyped') {
      return "Let's GO! Want me to load up a beat?";
    }

    return suggestions[Math.floor(Math.random() * suggestions.length)];
  }

  /**
   * Suggestion: Beat loaded but no recording
   */
  private getSuggestionBeatLoaded(context: SessionContext): string {
    const suggestions = [
      "Beat's ready—want to record 16 bars?",
      "This vibe is solid. Ready to lay down some takes?",
      "Got the beat. Say 'record' when you're ready to go.",
      "Let's record on this. Give me a 'record 16 bars' when you're set."
    ];

    return suggestions[Math.floor(Math.random() * suggestions.length)];
  }

  /**
   * Suggestion: Recording complete, might want to comp
   */
  private getSuggestionRecordingComplete(context: SessionContext): string {
    const suggestions = [
      "Nice takes! Want me to comp the best parts?",
      "Yo, you got some solid moments. Should I create a comp?",
      "Got those takes. Ready to comp or do another pass?",
      "Those takes are in. Want to hear a comp of the best bits?"
    ];

    // Match user energy
    if (context.userEnergy === 'excited') {
      return "Those takes were FIRE! Let me comp the best parts for you.";
    }

    return suggestions[Math.floor(Math.random() * suggestions.length)];
  }

  /**
   * Suggestion: Has tracks but no effects
   */
  private getSuggestionNoEffects(context: SessionContext): string {
    const suggestions = [
      "This could use some reverb. Want me to add it?",
      "How about some subtle delay to give it space?",
      "Might sound nice with a touch of reverb—just a thought.",
      "Want to add some effects to polish this up?"
    ];

    return suggestions[Math.floor(Math.random() * suggestions.length)];
  }

  /**
   * Set cooldown duration
   */
  setCooldown(ms: number): void {
    this.suggestionCooldown = ms;
  }

  /**
   * Reset cooldown (force next suggestion to be immediate)
   */
  resetCooldown(): void {
    this.lastSuggestionTime = 0;
  }

  /**
   * Check if suggestion is ready (cooldown expired)
   */
  isReady(): boolean {
    return Date.now() - this.lastSuggestionTime >= this.suggestionCooldown;
  }
}

/**
 * Global proactive suggestions instance
 */
let globalSuggestions: ProactiveSuggestions | null = null;

export function getProactiveSuggestions(): ProactiveSuggestions {
  if (!globalSuggestions) {
    globalSuggestions = new ProactiveSuggestions();
  }
  return globalSuggestions;
}
