/**
 * Beat Generator v0 - Rule-Based MIDI Pattern Generation
 * Generates 3 variations of beats based on style taxonomy
 */

import { BEAT_STYLES, type BeatStyle } from './styles';
import type { MIDINote } from '$lib/midi/types';
import { v4 as uuid } from 'uuid';

export interface GeneratedBeat {
	id: string;
	title: string;
	midi: {
		kick: MIDINote[];
		snare: MIDINote[];
		hihat: MIDINote[];
		perc?: MIDINote[];
	};
	tags: {
		style: string;
		mood: string[];
		tempo: number;
		drums: string;
		melody: string;
		texture: string;
	};
	variationIndex: number;
}

export interface GenerateParams {
	style: string;
	bpm: number;
	bars: number;
	key?: string;
}

export class BeatGenerator {
	/**
	 * Generate 3 beat variations for auditioning
	 */
	async generate(params: GenerateParams): Promise<GeneratedBeat[]> {
		const styleTemplate = BEAT_STYLES[params.style];

		if (!styleTemplate) {
			throw new Error(`Unknown style: ${params.style}`);
		}

		const beats: GeneratedBeat[] = [];

		// Generate 3 variations
		for (let i = 0; i < 3; i++) {
			const beat: GeneratedBeat = {
				id: uuid(),
				title: `${styleTemplate.name} ${i + 1}`,
				midi: {
					kick: this.generateKickPattern(styleTemplate, params.bars, params.bpm, i),
					snare: this.generateSnarePattern(styleTemplate, params.bars, params.bpm, i),
					hihat: this.generateHihatPattern(styleTemplate, params.bars, params.bpm, i)
				},
				tags: {
					style: params.style,
					mood: styleTemplate.tags.mood,
					tempo: params.bpm,
					drums: styleTemplate.tags.drums,
					melody: styleTemplate.tags.melody,
					texture: styleTemplate.tags.texture
				},
				variationIndex: i
			};

			beats.push(beat);
		}

		return beats;
	}

	/**
	 * Generate kick drum pattern based on style
	 */
	private generateKickPattern(
		style: BeatStyle,
		bars: number,
		bpm: number,
		variation: number
	): MIDINote[] {
		const notes: MIDINote[] = [];
		const drumsStyle = style.tags.drums;

		if (drumsStyle.includes('four-on-floor')) {
			// House/Techno: kick on every beat
			for (let bar = 0; bar < bars; bar++) {
				for (let beat = 0; beat < 4; beat++) {
					notes.push({
						id: uuid(),
						time: bar * 4 + beat,
						pitch: 36, // C1 (kick)
						velocity: 100 + variation * 5,
						duration: 0.25
					});
				}
			}
		} else if (drumsStyle.includes('sparse-808') || drumsStyle.includes('booming-808')) {
			// Trap: kick on 1 and 3 (with variations)
			for (let bar = 0; bar < bars; bar++) {
				// Main kicks
				notes.push({
					id: uuid(),
					time: bar * 4 + 0,
					pitch: 36,
					velocity: 110,
					duration: 0.5
				});

				notes.push({
					id: uuid(),
					time: bar * 4 + 2,
					pitch: 36,
					velocity: 105,
					duration: 0.5
				});

				// Variation: add offbeat kicks
				if (variation > 0 && bar % 2 === 1) {
					notes.push({
						id: uuid(),
						time: bar * 4 + 3.5,
						pitch: 36,
						velocity: 90,
						duration: 0.25
					});
				}

				// Variation 2: add extra kick
				if (variation === 2 && bar % 4 === 3) {
					notes.push({
						id: uuid(),
						time: bar * 4 + 1.5,
						pitch: 36,
						velocity: 95,
						duration: 0.25
					});
				}
			}
		} else if (drumsStyle.includes('vinyl-kick') || drumsStyle.includes('dusty')) {
			// Boom bap: kicks on 1 and 3, looser timing
			for (let bar = 0; bar < bars; bar++) {
				notes.push({
					id: uuid(),
					time: bar * 4 + 0,
					pitch: 36,
					velocity: 95 + Math.random() * 10,
					duration: 0.35
				});

				notes.push({
					id: uuid(),
					time: bar * 4 + 2 + (Math.random() - 0.5) * 0.05, // Slight swing
					pitch: 36,
					velocity: 90 + Math.random() * 10,
					duration: 0.35
				});

				// Variation: occasional double-kick
				if (variation > 0 && bar % 3 === 0) {
					notes.push({
						id: uuid(),
						time: bar * 4 + 3.75,
						pitch: 36,
						velocity: 85,
						duration: 0.2
					});
				}
			}
		} else if (drumsStyle.includes('pounding-kick')) {
			// Techno: relentless four-on-floor
			for (let bar = 0; bar < bars; bar++) {
				for (let beat = 0; beat < 4; beat++) {
					notes.push({
						id: uuid(),
						time: bar * 4 + beat,
						pitch: 36,
						velocity: 115, // Loud!
						duration: 0.3
					});
				}
			}
		} else {
			// Default: basic pattern
			for (let bar = 0; bar < bars; bar++) {
				notes.push({
					id: uuid(),
					time: bar * 4 + 0,
					pitch: 36,
					velocity: 100,
					duration: 0.25
				});

				notes.push({
					id: uuid(),
					time: bar * 4 + 2,
					pitch: 36,
					velocity: 95,
					duration: 0.25
				});
			}
		}

		// Apply humanization
		return this.humanize(notes);
	}

	/**
	 * Generate snare pattern
	 */
	private generateSnarePattern(
		style: BeatStyle,
		bars: number,
		bpm: number,
		variation: number
	): MIDINote[] {
		const notes: MIDINote[] = [];
		const drumsStyle = style.tags.drums;

		if (drumsStyle.includes('hard-snare') || drumsStyle.includes('orchestral-snare')) {
			// Drill/Trap: snare on 2 and 4
			for (let bar = 0; bar < bars; bar++) {
				notes.push({
					id: uuid(),
					time: bar * 4 + 1,
					pitch: 38, // D1 (snare)
					velocity: 110,
					duration: 0.15
				});

				notes.push({
					id: uuid(),
					time: bar * 4 + 3,
					pitch: 38,
					velocity: 105,
					duration: 0.15
				});

				// Variation: add rolls
				if (variation === 2 && bar % 4 === 3) {
					for (let i = 0; i < 3; i++) {
						notes.push({
							id: uuid(),
							time: bar * 4 + 3.5 + i * 0.125,
							pitch: 38,
							velocity: 90 - i * 10,
							duration: 0.1
						});
					}
				}
			}
		} else if (drumsStyle.includes('dusty-snare')) {
			// Boom bap: loose snare with swing
			for (let bar = 0; bar < bars; bar++) {
				notes.push({
					id: uuid(),
					time: bar * 4 + 1 + (Math.random() - 0.5) * 0.03,
					pitch: 38,
					velocity: 90 + Math.random() * 15,
					duration: 0.2
				});

				notes.push({
					id: uuid(),
					time: bar * 4 + 3 + (Math.random() - 0.5) * 0.03,
					pitch: 38,
					velocity: 85 + Math.random() * 15,
					duration: 0.2
				});
			}
		} else if (drumsStyle.includes('shuffled-snare')) {
			// UK Garage: shuffled snare pattern
			for (let bar = 0; bar < bars; bar++) {
				notes.push({
					id: uuid(),
					time: bar * 4 + 1,
					pitch: 38,
					velocity: 105,
					duration: 0.12
				});

				notes.push({
					id: uuid(),
					time: bar * 4 + 2.66, // Shuffled
					pitch: 38,
					velocity: 100,
					duration: 0.12
				});

				if (bar % 2 === 1) {
					notes.push({
						id: uuid(),
						time: bar * 4 + 3.33,
						pitch: 38,
						velocity: 95,
						duration: 0.12
					});
				}
			}
		} else {
			// Default: snare on 2 and 4
			for (let bar = 0; bar < bars; bar++) {
				notes.push({
					id: uuid(),
					time: bar * 4 + 1,
					pitch: 38,
					velocity: 100,
					duration: 0.15
				});

				notes.push({
					id: uuid(),
					time: bar * 4 + 3,
					pitch: 38,
					velocity: 95,
					duration: 0.15
				});
			}
		}

		return this.humanize(notes);
	}

	/**
	 * Generate hi-hat pattern
	 */
	private generateHihatPattern(
		style: BeatStyle,
		bars: number,
		bpm: number,
		variation: number
	): MIDINote[] {
		const notes: MIDINote[] = [];
		const drumsStyle = style.tags.drums;

		if (drumsStyle.includes('crisp-hi-hats') || drumsStyle.includes('crisp-clap')) {
			// Trap: fast hi-hats with rolls
			for (let bar = 0; bar < bars; bar++) {
				// Basic 16ths
				for (let i = 0; i < 16; i++) {
					const isOpen = i % 4 === 2; // Open every 4th note
					notes.push({
						id: uuid(),
						time: bar * 4 + i * 0.25,
						pitch: isOpen ? 46 : 42, // Open vs closed
						velocity: isOpen ? 95 : 85,
						duration: 0.1
					});
				}

				// Variation: add triplet rolls
				if (variation > 0 && bar % 2 === 1) {
					for (let i = 0; i < 3; i++) {
						notes.push({
							id: uuid(),
							time: bar * 4 + 3.66 + i * 0.11,
							pitch: 42,
							velocity: 80 - i * 5,
							duration: 0.08
						});
					}
				}
			}
		} else if (drumsStyle.includes('minimal')) {
			// Ambient: sparse percussion
			for (let bar = 0; bar < bars; bar++) {
				if (bar % 2 === 0) {
					notes.push({
						id: uuid(),
						time: bar * 4 + 0,
						pitch: 42,
						velocity: 70,
						duration: 0.15
					});
				}
			}
		} else {
			// Default: 8th note hi-hats
			for (let bar = 0; bar < bars; bar++) {
				for (let i = 0; i < 8; i++) {
					const isAccent = i % 2 === 0;
					notes.push({
						id: uuid(),
						time: bar * 4 + i * 0.5,
						pitch: 42,
						velocity: isAccent ? 90 : 75,
						duration: 0.12
					});
				}
			}
		}

		return this.humanize(notes);
	}

	/**
	 * Apply humanization to MIDI notes
	 * Adds subtle timing and velocity variation
	 */
	private humanize(notes: MIDINote[]): MIDINote[] {
		return notes.map((note) => ({
			...note,
			// ±10ms timing jitter
			time: note.time + (Math.random() - 0.5) * 0.01,
			// ±5 velocity variation
			velocity: Math.max(1, Math.min(127, note.velocity + (Math.random() - 0.5) * 10))
		}));
	}
}
