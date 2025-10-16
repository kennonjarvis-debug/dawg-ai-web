/**
 * Session Context Manager - Tracks user preferences and history
 * Instance 2: Jarvis AI Brain + NLU
 */

import type { Command } from '../commands/types';

/**
 * Message in chat history
 */
export interface Message {
  id: string;
  from: 'user' | 'jarvis';
  text: string;
  mood?: 'supportive' | 'excited' | 'challenging' | 'chill';
  timestamp: Date;
  commands?: Command[];
}

/**
 * Suggestion outcome tracking
 */
export interface SuggestionOutcome {
  suggestion: string;
  outcome: 'loved' | 'liked' | 'neutral' | 'rejected';
  timestamp: Date;
}

/**
 * User action for energy inference
 */
export interface UserAction {
  type: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

/**
 * Session context for personalizing Jarvis
 */
export interface SessionContext {
  // Style preferences
  recentStyles: string[];           // ['toronto-ambient-trap', 'lofi']
  favoriteBpms: number[];            // [138, 140, 142]
  commonKeys: string[];              // ['Amin', 'Dmin']

  // Suggestion tracking
  successfulSuggestions: SuggestionOutcome[];

  // User energy (inferred from actions)
  userEnergy: 'chill' | 'focused' | 'hyped';

  // Chat history (last 20 messages)
  chatHistory: Message[];

  // Recent actions for context
  recentActions: UserAction[];

  // Session metadata
  sessionStart: Date;
  projectName?: string;
}

/**
 * User profile for long-term preferences
 */
export interface UserProfile {
  userId: string;
  username?: string;
  skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'pro';
  favoriteGenres: string[];
  totalSessions: number;
  totalProjects: number;
  preferences: {
    proactiveSuggestions: boolean;
    challengingMode: boolean;      // Whether user likes "challenging" personality
    verbosity: 'minimal' | 'normal' | 'detailed';
  };
}

/**
 * Session Context Manager
 */
export class SessionContextManager {
  private context: SessionContext;
  private profile: UserProfile;

  constructor(userId: string) {
    this.context = this.createEmptyContext();
    this.profile = this.createDefaultProfile(userId);
  }

  /**
   * Load context from storage (Supabase)
   */
  async loadContext(userId: string): Promise<SessionContext> {
    // TODO: Load from Supabase when cloud storage is implemented (Instance 10)
    // For now, return in-memory context
    return this.context;
  }

  /**
   * Update context with new data
   */
  async updateContext(userId: string, updates: Partial<SessionContext>): Promise<void> {
    this.context = {
      ...this.context,
      ...updates
    };

    // TODO: Persist to Supabase (Instance 10)
  }

  /**
   * Record a suggestion outcome
   */
  recordSuccess(suggestion: string, outcome: 'loved' | 'liked' | 'neutral' | 'rejected'): void {
    this.context.successfulSuggestions.push({
      suggestion,
      outcome,
      timestamp: new Date()
    });

    // Keep only last 50 suggestions
    if (this.context.successfulSuggestions.length > 50) {
      this.context.successfulSuggestions = this.context.successfulSuggestions.slice(-50);
    }
  }

  /**
   * Add message to chat history
   */
  addMessage(message: Omit<Message, 'id' | 'timestamp'>): void {
    const fullMessage: Message = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      ...message
    };

    this.context.chatHistory.push(fullMessage);

    // Keep only last 20 messages
    if (this.context.chatHistory.length > 20) {
      this.context.chatHistory = this.context.chatHistory.slice(-20);
    }
  }

  /**
   * Record user action
   */
  recordAction(action: Omit<UserAction, 'timestamp'>): void {
    this.context.recentActions.push({
      timestamp: new Date(),
      ...action
    });

    // Keep only last 50 actions
    if (this.context.recentActions.length > 50) {
      this.context.recentActions = this.context.recentActions.slice(-50);
    }

    // Update user energy based on actions
    this.context.userEnergy = this.inferUserEnergy(this.context.recentActions);
  }

  /**
   * Infer user energy from recent actions
   */
  inferUserEnergy(recentActions: UserAction[]): 'chill' | 'focused' | 'hyped' {
    if (recentActions.length === 0) return 'focused';

    // Get actions from last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const recentActionWindow = recentActions.filter(a => a.timestamp > fiveMinutesAgo);

    if (recentActionWindow.length === 0) return 'chill'; // Inactive = chill

    // Calculate action rate (actions per minute)
    const actionRate = recentActionWindow.length / 5;

    // Hype indicators: rapid actions, multiple recordings, quick iterations
    const hypeIndicators = recentActionWindow.filter(a =>
      a.type === 'transport.record' ||
      a.type === 'beat.generate' ||
      a.type === 'comp.create'
    ).length;

    // Focused indicators: editing, mixing, effects
    const focusIndicators = recentActionWindow.filter(a =>
      a.type.startsWith('effect.') ||
      a.type.startsWith('midi.') ||
      a.type.startsWith('mix.')
    ).length;

    // Decision logic
    if (actionRate > 3 && hypeIndicators > 2) return 'hyped';
    if (focusIndicators > 3) return 'focused';
    if (actionRate < 1) return 'chill';

    return 'focused'; // Default
  }

  /**
   * Update style preferences from commands
   */
  updateStylePreferences(commands: Command[]): void {
    commands.forEach(cmd => {
      if (cmd.type === 'beat.load' && cmd.styleTags) {
        cmd.styleTags.forEach(tag => {
          if (!this.context.recentStyles.includes(tag)) {
            this.context.recentStyles.push(tag);
          }
        });
      }

      if (cmd.type === 'beat.generate') {
        if (!this.context.recentStyles.includes(cmd.style)) {
          this.context.recentStyles.push(cmd.style);
        }
        if (!this.context.favoriteBpms.includes(cmd.bpm)) {
          this.context.favoriteBpms.push(cmd.bpm);
        }
      }

      if (cmd.type === 'transport.setTempo') {
        if (!this.context.favoriteBpms.includes(cmd.bpm)) {
          this.context.favoriteBpms.push(cmd.bpm);
        }
      }
    });

    // Keep only last 10 styles and BPMs
    this.context.recentStyles = this.context.recentStyles.slice(-10);
    this.context.favoriteBpms = this.context.favoriteBpms.slice(-10);
  }

  /**
   * Get current context
   */
  getContext(): SessionContext {
    return this.context;
  }

  /**
   * Get user profile
   */
  getProfile(): UserProfile {
    return this.profile;
  }

  /**
   * Update user profile
   */
  updateProfile(updates: Partial<UserProfile>): void {
    this.profile = {
      ...this.profile,
      ...updates
    };
  }

  /**
   * Create empty context
   */
  private createEmptyContext(): SessionContext {
    return {
      recentStyles: [],
      favoriteBpms: [],
      commonKeys: [],
      successfulSuggestions: [],
      userEnergy: 'focused',
      chatHistory: [],
      recentActions: [],
      sessionStart: new Date()
    };
  }

  /**
   * Create default user profile
   */
  private createDefaultProfile(userId: string): UserProfile {
    return {
      userId,
      skillLevel: 'intermediate',
      favoriteGenres: [],
      totalSessions: 0,
      totalProjects: 0,
      preferences: {
        proactiveSuggestions: true,
        challengingMode: false,
        verbosity: 'normal'
      }
    };
  }

  /**
   * Get summary for Jarvis context injection
   */
  getContextSummary(): string {
    const recentStylesStr = this.context.recentStyles.length > 0
      ? `Recent styles: ${this.context.recentStyles.slice(-3).join(', ')}`
      : 'No recent style preferences';

    const favoriteBpmsStr = this.context.favoriteBpms.length > 0
      ? `Favorite BPMs: ${this.context.favoriteBpms.slice(-3).join(', ')}`
      : '';

    const energyStr = `User energy: ${this.context.userEnergy}`;

    const successfulSuggestionsStr = this.context.successfulSuggestions
      .filter(s => s.outcome === 'loved' || s.outcome === 'liked')
      .slice(-3)
      .map(s => s.suggestion)
      .join(', ');

    const summary = [
      recentStylesStr,
      favoriteBpmsStr,
      energyStr,
      successfulSuggestionsStr ? `User loved: ${successfulSuggestionsStr}` : ''
    ]
      .filter(Boolean)
      .join('\n');

    return summary;
  }
}

/**
 * Global session context instance (singleton pattern)
 * TODO: Replace with proper state management when Instance 1 (Design System) is ready
 */
let globalSessionContext: SessionContextManager | null = null;

export function getSessionContextManager(userId?: string): SessionContextManager {
  if (!globalSessionContext) {
    globalSessionContext = new SessionContextManager(userId || 'default-user');
  }
  return globalSessionContext;
}
