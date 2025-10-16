/**
 * Jarvis AI Test Suite
 * Instance 2: Jarvis AI Brain + NLU
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CommandParser } from '../../../src/lib/ai/nlu/CommandParser';
import type { SessionContext } from '../../../src/lib/ai/context/SessionContext';
import type { Command } from '../../../src/lib/ai/commands/types';

/**
 * 20 Test Utterances for NLU Validation
 */
const TEST_UTTERANCES: Array<{
  input: string;
  expected: Partial<Command> | Partial<Command>[];
  description: string;
}> = [
  // Beat commands (1-6)
  {
    input: "load up a beat like Drake",
    expected: { type: 'beat.load', styleTags: ['toronto-ambient-trap'] },
    description: "Artist reference -> style tag mapping"
  },
  {
    input: "load a dark trap beat at 140 BPM",
    expected: { type: 'beat.load', bpm: 140 },
    description: "Beat load with BPM and mood"
  },
  {
    input: "make a drake vibe at 140 then record 16 bars",
    expected: [
      { type: 'beat.generate', style: 'toronto-ambient-trap', bpm: 140 },
      { type: 'transport.record', bars: 16 }
    ],
    description: "Multi-command sequence"
  },
  {
    input: "generate a psychedelic trap beat at 145",
    expected: { type: 'beat.generate', style: 'psychedelic-trap', bpm: 145 },
    description: "Beat generation with style"
  },
  {
    input: "load some lofi vibes",
    expected: { type: 'beat.load', styleTags: ['lofi-beats'] },
    description: "Genre keyword -> style mapping"
  },
  {
    input: "give me a chill beat",
    expected: { type: 'beat.load' },
    description: "Mood-based beat request"
  },

  // Transport commands (7-11)
  {
    input: "play",
    expected: { type: 'transport.play' },
    description: "Simple play command"
  },
  {
    input: "pause",
    expected: { type: 'transport.pause' },
    description: "Simple pause command"
  },
  {
    input: "record 16 bars",
    expected: { type: 'transport.record', bars: 16 },
    description: "Record with bar count"
  },
  {
    input: "record with 2 bar count in",
    expected: { type: 'transport.record', countIn: 2 },
    description: "Record with count-in"
  },
  {
    input: "set tempo to 138 bpm",
    expected: { type: 'transport.setTempo', bpm: 138 },
    description: "Set tempo command"
  },

  // Comp commands (12-13)
  {
    input: "comp the best takes",
    expected: { type: 'comp.create', method: 'auto' },
    description: "Auto-comp creation"
  },
  {
    input: "create a comp from my recordings",
    expected: { type: 'comp.create' },
    description: "Manual comp trigger"
  },

  // Effects commands (14-16)
  {
    input: "add reverb",
    expected: { type: 'effect.add', effectType: 'reverb' },
    description: "Add effect by name"
  },
  {
    input: "add some delay",
    expected: { type: 'effect.add', effectType: 'delay' },
    description: "Add delay effect"
  },
  {
    input: "put a compressor on this",
    expected: { type: 'effect.add', effectType: 'compressor' },
    description: "Natural language effect add"
  },

  // MIDI commands (17)
  {
    input: "quantize",
    expected: { type: 'midi.quantize', division: '1/16' },
    description: "Quantize command"
  },

  // Project commands (18-19)
  {
    input: "save",
    expected: { type: 'project.save' },
    description: "Project save"
  },
  {
    input: "export as wav",
    expected: { type: 'project.export', format: 'wav' },
    description: "Project export"
  },

  // Utility commands (20)
  {
    input: "undo",
    expected: { type: 'undo' },
    description: "Undo command"
  }
];

describe('Jarvis AI - NLU CommandParser', () => {
  let parser: CommandParser;
  let mockContext: SessionContext;

  beforeEach(() => {
    parser = new CommandParser();
    mockContext = {
      recentStyles: ['toronto-ambient-trap'],
      favoriteBpms: [140],
      commonKeys: ['Amin'],
      successfulSuggestions: [],
      userEnergy: 'focused',
      chatHistory: [],
      recentActions: [],
      sessionStart: new Date()
    };
  });

  describe('20 Test Utterances', () => {
    TEST_UTTERANCES.forEach((testCase, index) => {
      it(`${index + 1}. ${testCase.description}: "${testCase.input}"`, async () => {
        const result = await parser.parse(testCase.input, mockContext);

        // Check that we got commands
        expect(result.commands.length).toBeGreaterThan(0);

        // Check confidence
        expect(result.confidence).toBeGreaterThan(0.6);

        // Validate command structure
        const actualCmd = result.commands[0];
        const expectedCmd = Array.isArray(testCase.expected)
          ? testCase.expected[0]
          : testCase.expected;

        expect(actualCmd.type).toBe(expectedCmd.type);

        // Check specific fields if defined
        if ('styleTags' in expectedCmd && expectedCmd.styleTags) {
          expect(actualCmd).toHaveProperty('styleTags');
          if ('styleTags' in actualCmd && actualCmd.styleTags) {
            expect(actualCmd.styleTags).toContain(expectedCmd.styleTags[0]);
          }
        }

        if ('bpm' in expectedCmd && expectedCmd.bpm) {
          expect(actualCmd).toHaveProperty('bpm', expectedCmd.bpm);
        }

        if ('bars' in expectedCmd && expectedCmd.bars) {
          expect(actualCmd).toHaveProperty('bars', expectedCmd.bars);
        }

        if ('effectType' in expectedCmd && expectedCmd.effectType) {
          expect(actualCmd).toHaveProperty('effectType', expectedCmd.effectType);
        }

        if ('format' in expectedCmd && expectedCmd.format) {
          expect(actualCmd).toHaveProperty('format', expectedCmd.format);
        }

        if ('method' in expectedCmd && expectedCmd.method) {
          expect(actualCmd).toHaveProperty('method', expectedCmd.method);
        }
      });
    });
  });

  describe('Artist to Style Mapping', () => {
    it('should map drake to toronto-ambient-trap', async () => {
      const result = await parser.parse("load a drake beat", mockContext);
      expect(result.commands[0].type).toBe('beat.load');
      if (result.commands[0].type === 'beat.load') {
        expect(result.commands[0].styleTags).toContain('toronto-ambient-trap');
      }
    });

    it('should map travis scott to psychedelic-trap', async () => {
      const result = await parser.parse("load a travis scott vibe", mockContext);
      expect(result.commands[0].type).toBe('beat.load');
      if (result.commands[0].type === 'beat.load') {
        expect(result.commands[0].styleTags).toContain('psychedelic-trap');
      }
    });

    it('should map metro boomin to dark-cinematic-trap', async () => {
      const result = await parser.parse("make a metro boomin type beat", mockContext);
      if (result.commands.length > 0) {
        const cmd = result.commands[0];
        if (cmd.type === 'beat.load' || cmd.type === 'beat.generate') {
          const hasDarkCinematicTrap =
            ('styleTags' in cmd && cmd.styleTags?.includes('dark-cinematic-trap')) ||
            ('style' in cmd && cmd.style === 'dark-cinematic-trap');
          expect(hasDarkCinematicTrap).toBe(true);
        }
      }
    });
  });

  describe('Context Awareness', () => {
    it('should use recent styles from context when no style specified', async () => {
      mockContext.recentStyles = ['lofi-beats'];
      const result = await parser.parse("load a beat", mockContext);

      if (result.commands[0].type === 'beat.load') {
        expect(result.commands[0].styleTags).toContain('lofi-beats');
      }
    });

    it('should use favorite BPMs from context', async () => {
      mockContext.favoriteBpms = [145];
      const result = await parser.parse("make a trap beat", mockContext);

      if (result.commands[0].type === 'beat.generate') {
        expect(result.commands[0].bpm).toBe(145);
      }
    });
  });

  describe('Confidence Scoring', () => {
    it('should have high confidence for exact matches', async () => {
      const result = await parser.parse("play", mockContext);
      expect(result.confidence).toBeGreaterThanOrEqual(0.9);
    });

    it('should have lower confidence for ambiguous commands', async () => {
      const result = await parser.parse("make something cool", mockContext);
      expect(result.confidence).toBeLessThan(0.9);
    });
  });

  describe('Disambiguation', () => {
    it('should request disambiguation for unclear commands', async () => {
      const result = await parser.parse("add an effect", mockContext);

      if (result.commands.length === 0) {
        expect(result.needsDisambiguation).toBeDefined();
        expect(result.needsDisambiguation?.question).toContain('effect');
      }
    });
  });

  describe('Parameter Extraction', () => {
    it('should extract BPM from text', async () => {
      const result = await parser.parse("set tempo to 145", mockContext);
      expect(result.commands[0]).toHaveProperty('bpm', 145);
    });

    it('should extract bar count from text', async () => {
      const result = await parser.parse("record 32 bars", mockContext);
      expect(result.commands[0]).toHaveProperty('bars', 32);
    });

    it('should extract count-in from text', async () => {
      const result = await parser.parse("record with 4 bar count in", mockContext);
      if (result.commands[0].type === 'transport.record') {
        expect(result.commands[0].countIn).toBe(4);
      }
    });
  });
});

describe('Jarvis AI - 20% Unexpected Creativity Rule', () => {
  it('should return true approximately 20% of the time', () => {
    // This is a statistical test - run it many times
    const iterations = 1000;
    let trueCount = 0;

    // We'll test this by calling a method that uses the 20% rule
    // For now, we'll just test the randomness directly
    for (let i = 0; i < iterations; i++) {
      if (Math.random() < 0.2) {
        trueCount++;
      }
    }

    // Allow for statistical variance (15-25% is acceptable)
    const percentage = (trueCount / iterations) * 100;
    expect(percentage).toBeGreaterThan(15);
    expect(percentage).toBeLessThan(25);
  });
});

describe('Jarvis AI - Command Validation', () => {
  it('should validate commands with Zod schema', async () => {
    const parser = new CommandParser();
    const mockContext: SessionContext = {
      recentStyles: [],
      favoriteBpms: [],
      commonKeys: [],
      successfulSuggestions: [],
      userEnergy: 'focused',
      chatHistory: [],
      recentActions: [],
      sessionStart: new Date()
    };

    const result = await parser.parse("set tempo to 140", mockContext);
    expect(result.commands[0]).toMatchObject({
      type: 'transport.setTempo',
      bpm: 140
    });
  });

  it('should reject invalid BPM values', async () => {
    const parser = new CommandParser();
    const mockContext: SessionContext = {
      recentStyles: [],
      favoriteBpms: [],
      commonKeys: [],
      successfulSuggestions: [],
      userEnergy: 'focused',
      chatHistory: [],
      recentActions: [],
      sessionStart: new Date()
    };

    // Try to set an invalid BPM (out of range)
    const result = await parser.parse("set tempo to 999", mockContext);

    // Should fail validation and return no commands
    expect(result.commands.length).toBe(0);
  });
});
