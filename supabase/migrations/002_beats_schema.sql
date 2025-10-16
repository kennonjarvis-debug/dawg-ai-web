-- Beat Engine Schema
-- Stores pre-generated and user-generated beats for instant search/audition

-- Beats table
CREATE TABLE IF NOT EXISTS beats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,

  -- Style taxonomy (NO artist names)
  style TEXT NOT NULL, -- e.g. 'toronto-ambient-trap', 'drill-aggressive'
  mood JSONB NOT NULL DEFAULT '[]', -- e.g. ["moody", "dark", "atmospheric"]
  tempo INT NOT NULL CHECK (tempo >= 60 AND tempo <= 200),
  drums TEXT, -- e.g. 'sparse-808-crisp-clap'
  melody TEXT, -- e.g. 'pad-minor-ambient'
  texture TEXT, -- e.g. 'reverb-heavy'

  -- Audio/MIDI assets
  preview_url TEXT NOT NULL, -- Pre-rendered audio preview (WAV/MP3)
  midi_data JSONB, -- Generated MIDI patterns {kick: [], snare: [], hihat: []}
  asset_url TEXT, -- Full stems/project file (optional)

  -- Metadata
  bars INT DEFAULT 4,
  key TEXT DEFAULT 'Amin',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Analytics
  play_count INT DEFAULT 0,
  use_count INT DEFAULT 0 -- How many times added to projects
);

-- Indexes for fast search
CREATE INDEX IF NOT EXISTS idx_beats_style ON beats(style);
CREATE INDEX IF NOT EXISTS idx_beats_tempo ON beats(tempo);
CREATE INDEX IF NOT EXISTS idx_beats_mood ON beats USING GIN (mood);
CREATE INDEX IF NOT EXISTS idx_beats_play_count ON beats(play_count DESC);
CREATE INDEX IF NOT EXISTS idx_beats_created ON beats(created_at DESC);

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_beats_search ON beats USING GIN (
  to_tsvector('english', title || ' ' || style || ' ' || COALESCE(drums, '') || ' ' || COALESCE(melody, ''))
);

-- Seed with initial beats (will be populated by beat generator)
-- These are placeholders - actual beats generated on-demand
INSERT INTO beats (title, style, mood, tempo, drums, melody, texture, preview_url, bars) VALUES
  ('Toronto Vibes 1', 'toronto-ambient-trap', '["moody","dark","atmospheric"]', 140, 'sparse-808-crisp-clap', 'pad-minor-ambient', 'reverb-heavy', '/beats/previews/toronto-1.wav', 4),
  ('Toronto Vibes 2', 'toronto-ambient-trap', '["moody","dark","atmospheric"]', 138, 'sparse-808-crisp-clap', 'pad-minor-ambient', 'reverb-heavy', '/beats/previews/toronto-2.wav', 4),
  ('Toronto Vibes 3', 'toronto-ambient-trap', '["moody","dark","atmospheric"]', 142, 'sparse-808-crisp-clap', 'pad-minor-ambient', 'reverb-heavy', '/beats/previews/toronto-3.wav', 4),

  ('Drill Heat 1', 'drill-aggressive', '["aggressive","dark","menacing"]', 145, 'sliding-808-hard-snare', 'synth-ominous-bass-heavy', 'clean-hard-hitting', '/beats/previews/drill-1.wav', 4),
  ('Drill Heat 2', 'drill-aggressive', '["aggressive","dark","menacing"]', 148, 'sliding-808-hard-snare', 'synth-ominous-bass-heavy', 'clean-hard-hitting', '/beats/previews/drill-2.wav', 4),

  ('Lofi Study 1', 'lofi-chill', '["chill","nostalgic","warm"]', 75, 'dusty-vinyl-soft-kick', 'piano-jazzy-rhodes', 'vinyl-crackle-tape-saturation', '/beats/previews/lofi-1.wav', 4),
  ('Lofi Study 2', 'lofi-chill', '["chill","nostalgic","warm"]', 82, 'dusty-vinyl-soft-kick', 'piano-jazzy-rhodes', 'vinyl-crackle-tape-saturation', '/beats/previews/lofi-2.wav', 4),

  ('Hyperpop Chaos 1', 'hyperpop-glitch', '["chaotic","energetic","futuristic"]', 165, 'digital-glitch-snare', 'synth-distorted-pitched', 'bitcrush-glitch-stereo', '/beats/previews/hyperpop-1.wav', 4),

  ('Deep House Groove 1', 'deep-house-groovy', '["groovy","warm","hypnotic"]', 122, 'four-on-floor-shaker', 'rhodes-pad-bassline', 'warm-analog-subtle-reverb', '/beats/previews/house-1.wav', 4),
  ('Deep House Groove 2', 'deep-house-groovy', '["groovy","warm","hypnotic"]', 124, 'four-on-floor-shaker', 'rhodes-pad-bassline', 'warm-analog-subtle-reverb', '/beats/previews/house-2.wav', 4)
ON CONFLICT DO NOTHING;

-- Helper function: Search beats by style tags
CREATE OR REPLACE FUNCTION search_beats(
  p_style TEXT DEFAULT NULL,
  p_tempo_min INT DEFAULT 60,
  p_tempo_max INT DEFAULT 200,
  p_mood TEXT DEFAULT NULL,
  p_limit INT DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  style TEXT,
  mood JSONB,
  tempo INT,
  preview_url TEXT,
  play_count INT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    b.id,
    b.title,
    b.style,
    b.mood,
    b.tempo,
    b.preview_url,
    b.play_count
  FROM beats b
  WHERE
    (p_style IS NULL OR b.style = p_style)
    AND b.tempo >= p_tempo_min
    AND b.tempo <= p_tempo_max
    AND (p_mood IS NULL OR b.mood @> to_jsonb(ARRAY[p_mood]))
  ORDER BY b.play_count DESC, b.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Helper function: Increment play count
CREATE OR REPLACE FUNCTION increment_beat_play_count(p_beat_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE beats
  SET play_count = play_count + 1
  WHERE id = p_beat_id;
END;
$$ LANGUAGE plpgsql;

-- Helper function: Increment use count
CREATE OR REPLACE FUNCTION increment_beat_use_count(p_beat_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE beats
  SET use_count = use_count + 1
  WHERE id = p_beat_id;
END;
$$ LANGUAGE plpgsql;

-- Comments for documentation
COMMENT ON TABLE beats IS 'Pre-generated and user-generated beats for instant search and audition';
COMMENT ON COLUMN beats.style IS 'Descriptive style taxonomy (NO artist names)';
COMMENT ON COLUMN beats.mood IS 'Array of mood tags for filtering';
COMMENT ON COLUMN beats.preview_url IS 'Pre-rendered audio preview for instant playback';
COMMENT ON COLUMN beats.midi_data IS 'Generated MIDI patterns for editing';
