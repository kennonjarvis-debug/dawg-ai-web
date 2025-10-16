## 💾 Instance 12: Export + Bounce System

```markdown
# Claude Code Prompt: Export & Bounce System

## Mission
Implement professional audio export with format options, stem export, and mastering integration.

## Context Files
1. Comprehensive spec: Export section
2. `TESTING_FINAL_STATUS.md` for offline rendering patterns

## Deliverables

### 1. Export Manager (`src/lib/audio/export/ExportManager.ts`)

```typescript
interface ExportOptions {
  format: 'wav' | 'mp3' | 'flac';
  sampleRate: 44100 | 48000 | 96000;
  bitDepth: 16 | 24 | 32;
  channels: 'stereo' | 'mono';
  normalize: boolean;
  applyMastering: boolean;
  includeStems: boolean;
  startBar?: number;
  endBar?: number;
}

class ExportManager {
  async exportMix(opts: ExportOptions): Promise<Blob> {
    // 1. Render offline
    const buffer = await this.renderMix(opts);

    // 2. Apply mastering if requested
    const masteredBuffer = opts.applyMastering
      ? await this.applyMastering(buffer)
      : buffer;

    // 3. Normalize if requested
    const finalBuffer = opts.normalize
      ? this.normalize(masteredBuffer, -0.1)  // -0.1dB headroom
      : masteredBuffer;

    // 4. Convert to format
    const blob = await this.convertToFormat(finalBuffer, opts.format);

    return blob;
  }

  async exportStems(opts: ExportOptions): Promise<Map<string, Blob>> {
    const stems = new Map<string, Blob>();

    for (const track of audioEngine.getAllTracks()) {
      // Render each track solo
      const buffer = await this.renderTrack(track, opts);
      const blob = await this.convertToFormat(buffer, opts.format);

      stems.set(track.name, blob);
    }

    return stems;
  }

  private async renderMix(opts: ExportOptions): Promise<AudioBuffer> {
    const duration = this.calculateDuration(opts);
    const tailSec = 2; // 2s tail for reverb

    // Use AudioEngine's offline rendering (already tested)
    return audioEngine.renderOffline(duration, tailSec);
  }

  private normalize(buffer: AudioBuffer, targetDb: number): AudioBuffer {
    // Find peak
    let peak = 0;
    for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
      const data = buffer.getChannelData(ch);
      peak = Math.max(peak, Math.max(...Array.from(data).map(Math.abs)));
    }

    // Calculate gain
    const targetLinear = Math.pow(10, targetDb / 20);
    const gain = targetLinear / peak;

    // Apply gain
    const ctx = new OfflineAudioContext(
      buffer.numberOfChannels,
      buffer.length,
      buffer.sampleRate
    );

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const gainNode = ctx.createGain();
    gainNode.gain.value = gain;

    source.connect(gainNode);
    gainNode.connect(ctx.destination);
    source.start(0);

    return ctx.startRendering();
  }

  private async applyMastering(buffer: AudioBuffer): Promise<AudioBuffer> {
    // Option 1: Local mastering chain
    const ctx = new OfflineAudioContext(
      buffer.numberOfChannels,
      buffer.length,
      buffer.sampleRate
    );

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    // Simple mastering chain
    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.value = -20;
    compressor.ratio.value = 4;
    compressor.attack.value = 0.003;
    compressor.release.value = 0.25;

    const limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = -0.5;
    limiter.ratio.value = 20;
    limiter.attack.value = 0.001;
    limiter.release.value = 0.01;

    source.connect(compressor);
    compressor.connect(limiter);
    limiter.connect(ctx.destination);

    source.start(0);
    return ctx.startRendering();

    // Option 2: LANDR API (future)
    // return this.masterWithLANDR(buffer);
  }

  private async convertToFormat(buffer: AudioBuffer, format: string): Promise<Blob> {
    if (format === 'wav') {
      return this.audioBufferToWav(buffer);
    } else if (format === 'mp3') {
      return this.audioBufferToMp3(buffer);
    } else if (format === 'flac') {
      return this.audioBufferToFlac(buffer);
    }
  }

  private audioBufferToWav(buffer: AudioBuffer): Blob {
    // PCM WAV encoding (same as test runner)
    const length = buffer.length * buffer.numberOfChannels * 2;
    const wav = new ArrayBuffer(44 + length);
    const view = new DataView(wav);

    // Write WAV header
    this.writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + length, true);
    this.writeString(view, 8, 'WAVE');
    this.writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);  // PCM
    view.setUint16(22, buffer.numberOfChannels, true);
    view.setUint32(24, buffer.sampleRate, true);
    view.setUint32(28, buffer.sampleRate * buffer.numberOfChannels * 2, true);
    view.setUint16(32, buffer.numberOfChannels * 2, true);
    view.setUint16(34, 16, true);  // 16-bit
    this.writeString(view, 36, 'data');
    view.setUint32(40, length, true);

    // Write audio data
    let offset = 44;
    for (let i = 0; i < buffer.length; i++) {
      for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
        const sample = buffer.getChannelData(ch)[i];
        view.setInt16(offset, sample * 0x7FFF, true);
        offset += 2;
      }
    }

    return new Blob([wav], { type: 'audio/wav' });
  }
}
```

### 2. Export UI (`src/lib/components/export/ExportDialog.svelte`)

```typescript
<script lang="ts">
  let format = $state('wav');
  let sampleRate = $state(48000);
  let normalize = $state(true);
  let applyMastering = $state(false);
  let includeStems = $state(false);
  let isExporting = $state(false);
  let progress = $state(0);

  async function startExport() {
    isExporting = true;

    const blob = await exportManager.exportMix({
      format,
      sampleRate,
      bitDepth: 24,
      channels: 'stereo',
      normalize,
      applyMastering,
      includeStems
    });

    // Download
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectTitle}.${format}`;
    a.click();

    isExporting = false;
  }
</script>

<dialog>
  <h2>Export Mix</h2>

  <div class="options">
    <label>
      Format
      <select bind:value={format}>
        <option value="wav">WAV (Lossless)</option>
        <option value="mp3">MP3 (320kbps)</option>
        <option value="flac">FLAC (Lossless, smaller)</option>
      </select>
    </label>

    <label>
      Sample Rate
      <select bind:value={sampleRate}>
        <option value={44100}>44.1 kHz (CD quality)</option>
        <option value={48000}>48 kHz (Standard)</option>
        <option value={96000}>96 kHz (Hi-Res)</option>
      </select>
    </label>

    <label>
      <input type="checkbox" bind:checked={normalize} />
      Normalize to -0.1 dB
    </label>

    <label>
      <input type="checkbox" bind:checked={applyMastering} />
      Apply mastering (compression + limiter)
    </label>

    <label>
      <input type="checkbox" bind:checked={includeStems} />
      Export stems (individual tracks)
    </label>
  </div>

  <button onclick={startExport} disabled={isExporting}>
    {isExporting ? 'Exporting...' : 'Export'}
  </button>

  {#if isExporting}
    <progress value={progress} max={100}></progress>
  {/if}
</dialog>
```

## Testing

### Unit Tests
- WAV encoding correctness
- Normalization gain calculation
- Stem export includes all tracks

### Integration Tests
- Export → import → audio matches
- Mastering chain applies
- Format conversion works

### Quality Tests
```
[ ] Exported WAV plays in DAW (Logic, Ableton)
[ ] MP3 sounds identical (ABX test)
[ ] Stems sum to mix (null test)
[ ] Normalization doesn't clip
[ ] Mastering improves loudness
```

## Git Branch
`export-bounce`

## Success Criteria
- ✅ WAV export working (all sample rates)
- ✅ MP3 export functional
- ✅ Normalization accurate
- ✅ Stem export creates individual files
- ✅ Mastering chain improves loudness
- ✅ Export <30s for 5min track
- ✅ No audio artifacts in export

**Use existing offline rendering from AudioEngine.ts as foundation.**
```

---

