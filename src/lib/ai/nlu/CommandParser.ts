/**
 * NLU Command Parser - Parses natural language into DAW commands
 * Instance 2: Jarvis AI Brain + NLU
 */

import type { Command } from '../commands/types';
import { safeValidateCommand } from '../commands/types';
import { ARTIST_STYLE_MAP } from '../prompts/jarvis-system';
import type { SessionContext } from '../context/SessionContext';

/**
 * Parsed intent result
 */
export interface ParsedIntent {
  commands: Command[];
  confidence: number;
  needsDisambiguation?: {
    question: string;
    options: string[];
  };
}

/**
 * Command Parser - Converts natural language to commands
 */
export class CommandParser {
  /**
   * Parse transcript into commands
   */
  async parse(
    transcript: string,
    context: SessionContext
  ): Promise<ParsedIntent> {
    const normalizedText = transcript.toLowerCase().trim();

    // Try pattern matching first (fast path)
    const patternMatch = this.tryPatternMatching(normalizedText, context);
    if (patternMatch) {
      return patternMatch;
    }

    // Fallback to LLM parsing for complex utterances
    // TODO: Implement LLM-based parsing when Jarvis core is ready
    return {
      commands: [],
      confidence: 0,
      needsDisambiguation: {
        question: "I didn't catch that. Can you rephrase?",
        options: []
      }
    };
  }

  /**
   * Fast pattern matching for common commands
   */
  private tryPatternMatching(text: string, context: SessionContext): ParsedIntent | null {
    // Beat commands
    if (text.includes('load') && (text.includes('beat') || text.includes('vibe'))) {
      return this.parseBeatLoad(text, context);
    }

    if (text.includes('generate') || text.includes('make') || text.includes('create')) {
      if (text.includes('beat')) {
        return this.parseBeatGenerate(text, context);
      }
    }

    // Transport commands
    if (text === 'play' || text.includes('start playing')) {
      return {
        commands: [{ type: 'transport.play' }],
        confidence: 1.0
      };
    }

    if (text === 'pause' || text === 'stop') {
      return {
        commands: [{ type: 'transport.pause' }],
        confidence: 1.0
      };
    }

    if (text.includes('record')) {
      return this.parseRecord(text);
    }

    // Comp commands
    if (text.includes('comp') && (text.includes('create') || text.includes('make') || text.includes('best'))) {
      return {
        commands: [{
          type: 'comp.create',
          trackId: 'current', // TODO: Get from current selection
          method: 'auto'
        }],
        confidence: 0.9
      };
    }

    // Effects commands
    if (text.includes('add') && (text.includes('reverb') || text.includes('delay') || text.includes('effect'))) {
      return this.parseEffectAdd(text);
    }

    // Tempo commands
    if ((text.includes('set') || text.includes('change')) && (text.includes('tempo') || text.includes('bpm'))) {
      return this.parseSetTempo(text);
    }

    // MIDI commands
    if (text.includes('quantize')) {
      return {
        commands: [{
          type: 'midi.quantize',
          trackId: 'current',
          division: '1/16',
          strength: 1.0
        }],
        confidence: 0.9
      };
    }

    // Project commands
    if (text.includes('save')) {
      return {
        commands: [{ type: 'project.save' }],
        confidence: 1.0
      };
    }

    if (text.includes('export') || text.includes('bounce')) {
      return {
        commands: [{
          type: 'project.export',
          format: 'wav',
          quality: 'high'
        }],
        confidence: 0.9
      };
    }

    // Undo/Redo
    if (text === 'undo' || text.includes('go back')) {
      return {
        commands: [{ type: 'undo' }],
        confidence: 1.0
      };
    }

    if (text === 'redo' || text.includes('go forward')) {
      return {
        commands: [{ type: 'redo' }],
        confidence: 1.0
      };
    }

    return null; // No pattern match
  }

  /**
   * Parse beat load command
   */
  private parseBeatLoad(text: string, context: SessionContext): ParsedIntent {
    const styleTags: string[] = [];
    let bpm: number | undefined;
    let mood: string[] | undefined;

    // Extract artist references
    const artistMatch = this.extractArtistReference(text);
    if (artistMatch) {
      styleTags.push(...artistMatch);
    }

    // Extract BPM
    const bpmMatch = text.match(/(\d{2,3})\s*(bpm)?/);
    if (bpmMatch) {
      bpm = parseInt(bpmMatch[1]);
    }

    // Extract mood keywords
    const moodKeywords = ['dark', 'moody', 'uplifting', 'chill', 'energetic', 'hype'];
    mood = moodKeywords.filter(m => text.includes(m));

    // Use context if no specific style mentioned
    if (styleTags.length === 0 && context.recentStyles.length > 0) {
      styleTags.push(context.recentStyles[context.recentStyles.length - 1]);
    }

    const command: Command = {
      type: 'beat.load',
      styleTags: styleTags.length > 0 ? styleTags : undefined,
      bpm,
      mood: mood && mood.length > 0 ? mood : undefined
    };

    // Validate command
    const validation = safeValidateCommand(command);
    if (!validation.success) {
      return {
        commands: [],
        confidence: 0,
        needsDisambiguation: {
          question: "What style of beat are you looking for?",
          options: ['Trap', 'Lo-fi', 'House', 'R&B']
        }
      };
    }

    return {
      commands: [validation.data],
      confidence: styleTags.length > 0 ? 0.95 : 0.7
    };
  }

  /**
   * Parse beat generate command
   */
  private parseBeatGenerate(text: string, context: SessionContext): ParsedIntent {
    const artistMatch = this.extractArtistReference(text);
    const style = artistMatch && artistMatch.length > 0
      ? artistMatch[0]
      : context.recentStyles[context.recentStyles.length - 1] || 'toronto-ambient-trap';

    // Extract BPM
    const bpmMatch = text.match(/(\d{2,3})\s*(bpm)?/);
    const bpm = bpmMatch ? parseInt(bpmMatch[1]) : context.favoriteBpms[context.favoriteBpms.length - 1] || 140;

    // Extract bar count
    const barsMatch = text.match(/(\d+)\s*bars?/);
    const bars = barsMatch ? parseInt(barsMatch[1]) : 8;

    const command: Command = {
      type: 'beat.generate',
      style,
      bpm,
      bars
    };

    const validation = safeValidateCommand(command);
    if (!validation.success) {
      return {
        commands: [],
        confidence: 0
      };
    }

    return {
      commands: [validation.data],
      confidence: 0.9
    };
  }

  /**
   * Parse record command
   */
  private parseRecord(text: string): ParsedIntent {
    // Extract bar count
    const barsMatch = text.match(/(\d+)\s*bars?/);
    const bars = barsMatch ? parseInt(barsMatch[1]) : 16;

    // Extract count-in
    const countInMatch = text.match(/(\d+)\s*(bar)?\s*count/);
    const countIn = countInMatch ? parseInt(countInMatch[1]) : 1;

    const command: Command = {
      type: 'transport.record',
      bars,
      countIn,
      loop: true,
      maxTakes: 4
    };

    const validation = safeValidateCommand(command);
    if (!validation.success) {
      return { commands: [], confidence: 0 };
    }

    return {
      commands: [validation.data],
      confidence: 0.95
    };
  }

  /**
   * Parse effect add command
   */
  private parseEffectAdd(text: string): ParsedIntent {
    const effectTypes = ['reverb', 'delay', 'eq', 'compressor', 'distortion', 'chorus', 'phaser', 'filter'];
    const effectType = effectTypes.find(e => text.includes(e));

    if (!effectType) {
      return {
        commands: [],
        confidence: 0,
        needsDisambiguation: {
          question: "Which effect do you want to add?",
          options: effectTypes
        }
      };
    }

    const command: Command = {
      type: 'effect.add',
      trackId: 'current',
      effectType: effectType as any
    };

    const validation = safeValidateCommand(command);
    if (!validation.success) {
      return { commands: [], confidence: 0 };
    }

    return {
      commands: [validation.data],
      confidence: 0.9
    };
  }

  /**
   * Parse set tempo command
   */
  private parseSetTempo(text: string): ParsedIntent {
    const bpmMatch = text.match(/(\d{2,3})\s*(bpm)?/);
    if (!bpmMatch) {
      return {
        commands: [],
        confidence: 0,
        needsDisambiguation: {
          question: "What BPM do you want?",
          options: []
        }
      };
    }

    const bpm = parseInt(bpmMatch[1]);
    const command: Command = {
      type: 'transport.setTempo',
      bpm
    };

    const validation = safeValidateCommand(command);
    if (!validation.success) {
      return { commands: [], confidence: 0 };
    }

    return {
      commands: [validation.data],
      confidence: 1.0
    };
  }

  /**
   * Extract artist reference from text
   */
  private extractArtistReference(text: string): string[] | null {
    const foundStyles: string[] = [];

    // Check for artist names
    for (const [artist, style] of Object.entries(ARTIST_STYLE_MAP)) {
      if (text.includes(artist)) {
        foundStyles.push(style);
      }
    }

    // Check for style keywords directly
    const styleKeywords = [
      'trap', 'drill', 'house', 'lofi', 'lo-fi', 'rnb', 'r&b',
      'toronto', 'atlanta', 'brooklyn', 'chicago',
      'ambient', 'psychedelic', 'melodic', 'rage'
    ];

    styleKeywords.forEach(keyword => {
      if (text.includes(keyword)) {
        // Map keyword to style
        if (keyword === 'trap' && text.includes('toronto')) foundStyles.push('toronto-ambient-trap');
        else if (keyword === 'trap' && text.includes('melodic')) foundStyles.push('melodic-trap');
        else if (keyword === 'trap' && text.includes('psychedelic')) foundStyles.push('psychedelic-trap');
        else if (keyword === 'trap' && text.includes('rage')) foundStyles.push('rage-trap');
        else if (keyword === 'drill' && text.includes('brooklyn')) foundStyles.push('brooklyn-drill');
        else if (keyword === 'drill' && text.includes('chicago')) foundStyles.push('chicago-drill');
        else if (keyword === 'lofi' || keyword === 'lo-fi') foundStyles.push('lofi-beats');
        else if (keyword === 'house') foundStyles.push('funky-house');
        else if (keyword === 'rnb' || keyword === 'r&b') foundStyles.push('atmospheric-rnb');
      }
    });

    return foundStyles.length > 0 ? foundStyles : null;
  }

  /**
   * Extract parameters from text using pattern matching
   */
  private extractParameters(text: string): Record<string, any> {
    const params: Record<string, any> = {};

    // Extract numbers
    const numberMatches = text.match(/\d+/g);
    if (numberMatches) {
      params.numbers = numberMatches.map(n => parseInt(n));
    }

    // Extract quoted strings
    const quotedMatches = text.match(/"([^"]+)"/g);
    if (quotedMatches) {
      params.quoted = quotedMatches.map(q => q.replace(/"/g, ''));
    }

    return params;
  }

  /**
   * Map artist name to style (alias for ARTIST_STYLE_MAP lookup)
   */
  mapArtistToStyle(artist: string): string | null {
    return ARTIST_STYLE_MAP[artist.toLowerCase()] || null;
  }
}

/**
 * Global parser instance
 */
let globalParser: CommandParser | null = null;

export function getCommandParser(): CommandParser {
  if (!globalParser) {
    globalParser = new CommandParser();
  }
  return globalParser;
}
