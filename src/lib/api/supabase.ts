/**
 * Supabase API Client
 *
 * Initializes and exports a singleton Supabase client instance.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// For E2E testing and local development without Supabase
const isDevelopment = import.meta.env.DEV;
const isTest = import.meta.env.MODE === 'test';

let supabaseInstance: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey) {
  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
} else if (!isTest && !isDevelopment) {
  // Only throw in production if credentials are missing
  throw new Error('Missing Supabase environment variables');
} else {
  console.warn('⚠️ Running without Supabase credentials (test/dev mode)');
}

export const supabase: SupabaseClient | null = supabaseInstance;
