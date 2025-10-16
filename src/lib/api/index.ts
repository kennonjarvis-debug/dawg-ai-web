/**
 * API Client
 *
 * Consolidates all API clients into a single object.
 */

import { AuthAPI } from './AuthAPI';
import { FileAPI } from './FileAPI';
import { ProjectAPI } from './ProjectAPI';
import { DAWGAIAPI } from './AIAPI';

export const api = {
  auth: new AuthAPI(),
  files: new FileAPI(),
  projects: new ProjectAPI(),
  ai: new DAWGAIAPI(),
};

// Also export individual APIs for convenience
export { DAWGAIAPI, dawgAI } from './AIAPI';
export type { MIDIGenerationParams, BasslineParams, MelodyParams, AudioAnalysisResult, MixingSuggestions } from './AIAPI';
