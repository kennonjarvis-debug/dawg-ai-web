/**
 * Beat Engine - AI Beat Generation & Discovery System
 * Instance 4: Complete Implementation
 *
 * Features:
 * - 15 descriptive beat styles (NO artist names)
 * - Rule-based MIDI pattern generation with 3 variations
 * - Instant preview system (<100ms playback)
 * - Supabase-powered beat search and discovery
 */

export { BEAT_STYLES, ARTIST_STYLE_MAP, mapInputToStyle, getStylesByMood, getStylesByTempo } from './styles';
export type { BeatStyle } from './styles';

export { BeatGenerator } from './BeatGenerator';
export type { GeneratedBeat, GenerateParams } from './BeatGenerator';

export { BeatPreview, BeatMIDIRenderer } from './BeatPreview';
export type { BeatMetadata } from './BeatPreview';

export { BeatSearch, beatSearch } from './BeatSearch';
export type { BeatSearchParams, BeatSearchResult } from './BeatSearch';
