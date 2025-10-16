/**
 * Beat Style Taxonomy
 * NO artist names - only descriptive musical styles
 * Maps user references to tags for beat generation
 */

export interface BeatStyle {
	name: string;
	tags: {
		mood: string[];
		tempo: [number, number]; // BPM range
		drums: string;
		melody: string;
		texture: string;
	};
	description: string;
}

export const BEAT_STYLES: Record<string, BeatStyle> = {
	'toronto-ambient-trap': {
		name: 'Toronto Ambient Trap',
		tags: {
			mood: ['moody', 'dark', 'atmospheric'],
			tempo: [135, 145],
			drums: 'sparse-808-crisp-clap',
			melody: 'pad-minor-ambient',
			texture: 'reverb-heavy'
		},
		description: 'Moody atmospheric trap with sparse drums and lush pads'
	},

	'lofi-chill': {
		name: 'Lo-Fi Chill',
		tags: {
			mood: ['chill', 'nostalgic', 'warm'],
			tempo: [70, 90],
			drums: 'dusty-vinyl-soft-kick',
			melody: 'piano-jazzy-rhodes',
			texture: 'vinyl-crackle-tape-saturation'
		},
		description: 'Nostalgic lo-fi beats with vinyl warmth and jazzy chords'
	},

	'drill-aggressive': {
		name: 'Drill (Aggressive)',
		tags: {
			mood: ['aggressive', 'dark', 'menacing'],
			tempo: [140, 150],
			drums: 'sliding-808-hard-snare',
			melody: 'synth-ominous-bass-heavy',
			texture: 'clean-hard-hitting'
		},
		description: 'Hard-hitting drill with sliding 808s and ominous synths'
	},

	'psychedelic-trap': {
		name: 'Psychedelic Trap',
		tags: {
			mood: ['trippy', 'spacey', 'surreal'],
			tempo: [130, 150],
			drums: 'bouncy-808-crisp-hi-hats',
			melody: 'synth-warped-pitched',
			texture: 'delay-phaser-reverb'
		},
		description: 'Trippy trap with warped synths and spacey effects'
	},

	'dark-cinematic-trap': {
		name: 'Dark Cinematic Trap',
		tags: {
			mood: ['cinematic', 'epic', 'dark'],
			tempo: [135, 145],
			drums: 'booming-808-orchestral-snare',
			melody: 'strings-brass-dramatic',
			texture: 'wide-stereo-reverb'
		},
		description: 'Epic cinematic trap with orchestral elements'
	},

	'boom-bap-classic': {
		name: 'Boom Bap (Classic)',
		tags: {
			mood: ['raw', 'gritty', 'nostalgic'],
			tempo: [85, 95],
			drums: 'vinyl-kick-dusty-snare',
			melody: 'sample-chop-jazz',
			texture: 'tape-crunch-warmth'
		},
		description: 'Classic 90s boom bap with dusty drums and jazz samples'
	},

	'hyperpop-glitch': {
		name: 'Hyperpop Glitch',
		tags: {
			mood: ['chaotic', 'energetic', 'futuristic'],
			tempo: [150, 180],
			drums: 'digital-glitch-snare',
			melody: 'synth-distorted-pitched',
			texture: 'bitcrush-glitch-stereo'
		},
		description: 'Chaotic hyperpop with glitchy production and distorted synths'
	},

	'deep-house-groovy': {
		name: 'Deep House (Groovy)',
		tags: {
			mood: ['groovy', 'warm', 'hypnotic'],
			tempo: [120, 125],
			drums: 'four-on-floor-shaker',
			melody: 'rhodes-pad-bassline',
			texture: 'warm-analog-subtle-reverb'
		},
		description: 'Groovy deep house with warm Rhodes and hypnotic basslines'
	},

	'techno-industrial': {
		name: 'Techno (Industrial)',
		tags: {
			mood: ['dark', 'driving', 'mechanical'],
			tempo: [128, 135],
			drums: 'pounding-kick-metallic',
			melody: 'synth-harsh-acid',
			texture: 'distortion-reverb-industrial'
		},
		description: 'Industrial techno with pounding kicks and harsh synths'
	},

	'afrobeat-modern': {
		name: 'Afrobeat (Modern)',
		tags: {
			mood: ['energetic', 'vibrant', 'rhythmic'],
			tempo: [105, 120],
			drums: 'log-drum-shaker-clap',
			melody: 'synth-bright-percussive',
			texture: 'clean-spatial-reverb'
		},
		description: 'Modern afrobeat with log drums and vibrant percussion'
	},

	'uk-garage-shuffled': {
		name: 'UK Garage (Shuffled)',
		tags: {
			mood: ['energetic', 'skippy', 'swung'],
			tempo: [130, 140],
			drums: 'shuffled-snare-rimshot',
			melody: 'bass-wobbly-synth-stabs',
			texture: 'clean-reverb-spatial'
		},
		description: 'Skippy UK garage with shuffled drums and wobbly bass'
	},

	'ambient-downtempo': {
		name: 'Ambient Downtempo',
		tags: {
			mood: ['ethereal', 'calm', 'spacious'],
			tempo: [60, 80],
			drums: 'minimal-soft-percussion',
			melody: 'pad-ambient-drone',
			texture: 'reverb-delay-space'
		},
		description: 'Ethereal ambient downtempo with spacious pads'
	},

	'jersey-club-bounce': {
		name: 'Jersey Club Bounce',
		tags: {
			mood: ['bouncy', 'energetic', 'playful'],
			tempo: [135, 145],
			drums: 'bed-squeak-snare-rapid',
			melody: 'synth-vocal-chop',
			texture: 'clean-stereo-punch'
		},
		description: 'Bouncy Jersey club with bed squeaks and vocal chops'
	},

	'phonk-memphis': {
		name: 'Phonk (Memphis)',
		tags: {
			mood: ['gritty', 'dark', 'nostalgic'],
			tempo: [130, 145],
			drums: 'cowbell-808-punchy-kick',
			melody: 'vocal-sample-dark-synth',
			texture: 'lo-fi-tape-distortion'
		},
		description: 'Memphis phonk with cowbells and dark vocal samples'
	},

	'garage-rock-modern': {
		name: 'Garage Rock (Modern)',
		tags: {
			mood: ['raw', 'energetic', 'rebellious'],
			tempo: [140, 160],
			drums: 'live-drums-punchy',
			melody: 'guitar-distorted-bass',
			texture: 'analog-room-reverb'
		},
		description: 'Raw modern garage rock with distorted guitars'
	}
};

// Artist → Style mapping (for user convenience)
// These are NEVER exposed to users, only for internal mapping
export const ARTIST_STYLE_MAP: Record<string, string> = {
	'drake': 'toronto-ambient-trap',
	'travis scott': 'psychedelic-trap',
	'travis': 'psychedelic-trap',
	'metro boomin': 'dark-cinematic-trap',
	'metro': 'dark-cinematic-trap',
	'pierre bourne': 'psychedelic-trap',
	'pierre': 'psychedelic-trap',
	'kanye': 'dark-cinematic-trap',
	'kanye west': 'dark-cinematic-trap',
	'playboi carti': 'psychedelic-trap',
	'carti': 'psychedelic-trap',
	'pop smoke': 'drill-aggressive',
	'fivio foreign': 'drill-aggressive',
	'kendrick': 'boom-bap-classic',
	'kendrick lamar': 'boom-bap-classic',
	'j dilla': 'boom-bap-classic',
	'madlib': 'boom-bap-classic',
	'nujabes': 'lofi-chill',
	'joji': 'lofi-chill',
	'100 gecs': 'hyperpop-glitch',
	'sophie': 'hyperpop-glitch',
	'disclosure': 'deep-house-groovy',
	'kaytranada': 'deep-house-groovy',
	'four tet': 'ambient-downtempo',
	'burial': 'uk-garage-shuffled',
	'sega bodega': 'hyperpop-glitch',
	'three 6 mafia': 'phonk-memphis',
	'$uicideboy$': 'phonk-memphis',
	'wizkid': 'afrobeat-modern',
	'burna boy': 'afrobeat-modern',
	'bryson tiller': 'toronto-ambient-trap'
};

/**
 * Map user input to beat style
 * Handles artist references by converting to descriptive styles
 */
export function mapInputToStyle(input: string): string {
	const normalized = input.toLowerCase().trim();

	// Check if it's an artist reference
	for (const [artist, style] of Object.entries(ARTIST_STYLE_MAP)) {
		if (normalized.includes(artist)) {
			return style;
		}
	}

	// Check if it's a direct style match
	for (const styleKey of Object.keys(BEAT_STYLES)) {
		const styleName = BEAT_STYLES[styleKey].name.toLowerCase();
		if (normalized.includes(styleName) || normalized.includes(styleKey)) {
			return styleKey;
		}
	}

	// Default fallback
	return 'toronto-ambient-trap';
}

/**
 * Get mood-based style suggestions
 */
export function getStylesByMood(mood: string): string[] {
	const normalized = mood.toLowerCase();
	return Object.entries(BEAT_STYLES)
		.filter(([_, style]) => style.tags.mood.some((m) => m.includes(normalized)))
		.map(([key, _]) => key);
}

/**
 * Get tempo-based style suggestions
 */
export function getStylesByTempo(bpm: number): string[] {
	return Object.entries(BEAT_STYLES)
		.filter(([_, style]) => bpm >= style.tags.tempo[0] && bpm <= style.tags.tempo[1])
		.map(([key, _]) => key);
}
