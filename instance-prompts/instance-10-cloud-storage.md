## ☁️ Instance 10: Cloud Storage + Projects

```markdown
# Claude Code Prompt: Cloud Storage & Project Management

## Mission
Implement Supabase integration for project save/load, cloud storage, and collaboration foundation.

## Context Files
1. Comprehensive spec: Cloud Storage section
2. Architecture doc: Data Layer

## Deliverables

### 1. Supabase Schema (`supabase/migrations/001_init.sql`)

```sql
-- users (managed by Supabase Auth)

-- projects
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  bpm number default 120,
  key text default 'Cmaj',
  time_signature text default '4/4',
  data jsonb not null,  -- Full project state
  thumbnail_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_projects_user on projects(user_id);
create index idx_projects_updated on projects(updated_at desc);

-- audio_files
create table if not exists audio_files (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  file_name text not null,
  file_size bigint,
  storage_path text not null,
  waveform_data jsonb,  -- Pre-computed peaks
  duration_sec float,
  created_at timestamptz default now()
);

-- beats (from Instance 4)
-- takes (from Instance 5)
-- comps (from Instance 6)

-- collaboration (future)
create table if not exists project_shares (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  shared_with_user_id uuid references auth.users(id) on delete cascade,
  permission text check (permission in ('view', 'edit', 'admin')),
  created_at timestamptz default now()
);
```

### 2. Project Manager (`src/lib/cloud/ProjectManager.ts`)

```typescript
interface Project {
  id: string;
  userId: string;
  title: string;
  bpm: number;
  key: string;
  timeSignature: string;
  tracks: Track[];
  effects: Effect[];
  automation: AutomationLane[];
  createdAt: Date;
  updatedAt: Date;
}

class ProjectManager {
  async createProject(title: string): Promise<Project> {
    const project = {
      title,
      bpm: 120,
      key: 'Cmaj',
      timeSignature: '4/4',
      tracks: [],
      data: this.serializeDAWState()
    };

    const { data } = await supabase
      .from('projects')
      .insert(project)
      .select()
      .single();

    return data;
  }

  async saveProject(projectId: string): Promise<void> {
    const data = this.serializeDAWState();

    await supabase
      .from('projects')
      .update({ data, updated_at: new Date() })
      .eq('id', projectId);

    // Auto-save every 30s
    this.scheduleAutoSave();
  }

  async loadProject(projectId: string): Promise<Project> {
    const { data } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    // Deserialize and restore DAW state
    await this.deserializeDAWState(data.data);

    return data;
  }

  async listProjects(): Promise<Project[]> {
    const { data } = await supabase
      .from('projects')
      .select('*')
      .order('updated_at', { ascending: false });

    return data;
  }

  private serializeDAWState(): any {
    return {
      tracks: audioEngine.getAllTracks().map(t => t.toJSON()),
      tempo: Tone.Transport.bpm.value,
      timeSignature: Tone.Transport.timeSignature,
      // ... all DAW state
    };
  }

  private async deserializeDAWState(data: any): Promise<void> {
    // Clear current state
    audioEngine.reset();

    // Restore tracks
    for (const trackData of data.tracks) {
      const track = await audioEngine.addTrack(trackData);
      // Restore effects, clips, etc.
    }

    // Restore transport
    Tone.Transport.bpm.value = data.tempo;
    // ...
  }
}
```

### 3. Storage Manager (`src/lib/cloud/StorageManager.ts`)

```typescript
class StorageManager {
  async uploadAudioFile(
    projectId: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    const path = `${projectId}/${uuid()}_${file.name}`;

    const { data, error } = await supabase.storage
      .from('audio-files')
      .upload(path, file, {
        onUploadProgress: (progress) => {
          const percent = (progress.loaded / progress.total) * 100;
          onProgress?.(percent);
        }
      });

    if (error) throw error;

    // Store metadata
    await supabase.from('audio_files').insert({
      project_id: projectId,
      file_name: file.name,
      file_size: file.size,
      storage_path: path
    });

    return data.path;
  }

  async downloadAudioFile(path: string): Promise<Blob> {
    const { data, error } = await supabase.storage
      .from('audio-files')
      .download(path);

    if (error) throw error;
    return data;
  }

  async generateWaveform(audioBuffer: AudioBuffer): Promise<number[]> {
    // Generate peaks for visualization (1 peak per pixel)
    const peaks = [];
    const samplesPerPeak = Math.floor(audioBuffer.length / 1000);

    const channelData = audioBuffer.getChannelData(0);
    for (let i = 0; i < channelData.length; i += samplesPerPeak) {
      const chunk = channelData.slice(i, i + samplesPerPeak);
      const peak = Math.max(...Array.from(chunk).map(Math.abs));
      peaks.push(peak);
    }

    return peaks;
  }
}
```

### 4. Auto-Save System (`src/lib/cloud/AutoSave.ts`)

```typescript
class AutoSave {
  private saveInterval: number = 30000; // 30s
  private isDirty: boolean = false;
  private timer: NodeJS.Timeout;

  start(projectId: string) {
    this.timer = setInterval(async () => {
      if (this.isDirty) {
        await projectManager.saveProject(projectId);
        this.isDirty = false;

        emit('project:saved', { projectId, timestamp: new Date() });
      }
    }, this.saveInterval);
  }

  markDirty() {
    this.isDirty = true;
  }

  stop() {
    clearInterval(this.timer);
  }
}
```

### 5. Project Browser UI (`src/lib/components/cloud/ProjectBrowser.svelte`)

```typescript
<script lang="ts">
  let projects: Project[] = $state([]);

  async function loadProjects() {
    projects = await projectManager.listProjects();
  }

  onMount(loadProjects);
</script>

<div class="project-browser">
  <h2>Projects</h2>

  <button onclick={() => createNew()}>New Project</button>

  <div class="project-grid">
    {#each projects as project}
      <div class="project-card" onclick={() => load(project.id)}>
        <img src={project.thumbnail_url} alt={project.title} />
        <h3>{project.title}</h3>
        <p>{project.bpm} BPM • {project.key}</p>
        <time>{formatDate(project.updated_at)}</time>
      </div>
    {/each}
  </div>
</div>
```

## Testing

### Unit Tests
- Project serialization/deserialization
- File upload with progress
- Waveform generation accuracy

### Integration Tests
- Save → load → DAW state matches
- Auto-save triggers correctly
- File uploads complete
- Project list updates

## Git Branch
`cloud-storage`

## Success Criteria
- ✅ Projects save/load correctly
- ✅ Auto-save every 30s when dirty
- ✅ Audio files upload with progress
- ✅ Waveforms pre-computed on upload
- ✅ Project browser shows all projects
- ✅ No data loss on save/load cycle

**Start with Supabase schema and authentication, then implement save/load.**
```

---

