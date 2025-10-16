-- Takes table for recording system
-- Stores metadata about recorded takes

create table if not exists takes (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  track_id text not null,
  pass_index int not null,
  start_bar int not null,
  end_bar int not null,

  -- Audio storage
  storage_path text,
  duration_sec float,

  -- Metrics
  peak_db float,
  rms_db float,
  snr float,
  timing_err_ms float,

  -- Metadata
  created_at timestamptz default now(),

  -- Indexes
  constraint takes_project_track_pass unique (project_id, track_id, pass_index)
);

-- Index for querying takes by project and track
create index idx_takes_project_track on takes(project_id, track_id);

-- Index for querying by metrics (for finding best takes)
create index idx_takes_metrics on takes(peak_db, rms_db, snr);

-- Function to get best take for a segment
create or replace function get_best_take_for_segment(
  p_project_id uuid,
  p_track_id text,
  p_start_bar int,
  p_end_bar int
) returns uuid as $$
declare
  best_take_id uuid;
begin
  -- Score takes based on metrics
  -- Higher SNR, lower timing error, no clipping
  select id into best_take_id
  from takes
  where project_id = p_project_id
    and track_id = p_track_id
    and start_bar <= p_start_bar
    and end_bar >= p_end_bar
  order by (
    case when peak_db > -1 then -30 else 0 end +  -- Penalize clipping
    case when snr < 20 then -20 else 0 end +        -- Penalize low SNR
    case when snr > 40 then 10 else 0 end +          -- Reward high SNR
    case when timing_err_ms > 10 then -15 else 0 end + -- Penalize timing errors
    case when timing_err_ms < 5 then 10 else 0 end +   -- Reward good timing
    case when peak_db < -20 then -20 else 0 end      -- Penalize low signal
  ) desc
  limit 1;

  return best_take_id;
end;
$$ language plpgsql;

-- Row level security
alter table takes enable row level security;

-- Policy: Users can only see their own takes
create policy "Users can view own takes"
  on takes for select
  using (
    project_id in (
      select id from projects where user_id = auth.uid()
    )
  );

-- Policy: Users can insert takes for their projects
create policy "Users can insert takes"
  on takes for insert
  with check (
    project_id in (
      select id from projects where user_id = auth.uid()
    )
  );

-- Policy: Users can delete their own takes
create policy "Users can delete own takes"
  on takes for delete
  using (
    project_id in (
      select id from projects where user_id = auth.uid()
    )
  );

-- Policy: Users can update their own takes
create policy "Users can update own takes"
  on takes for update
  using (
    project_id in (
      select id from projects where user_id = auth.uid()
    )
  );
