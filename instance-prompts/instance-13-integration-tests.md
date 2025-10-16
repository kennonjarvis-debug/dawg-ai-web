## 🧪 Instance 13: Integration + E2E Tests

```markdown
# Claude Code Prompt: Integration Testing & Quality Assurance

## Mission
Create comprehensive E2E test suite validating entire freestyle flow and all module integrations.

## Context Files
1. `PHASE_3_FREESTYLE_FLOW_ARCHITECTURE.md` (all sections)
2. `TESTING_FINAL_STATUS.md` (existing test patterns)
3. All instance implementations

## Deliverables

### 1. E2E Test Suite (`tests/e2e/`)

**Freestyle Flow Test** (`tests/e2e/freestyle-flow.spec.ts`):

```typescript
import { test, expect } from '@playwright/test';

test('complete freestyle flow: drake vibe → record → comp', async ({ page }) => {
  // 1. Navigate to app
  await page.goto('http://localhost:5174');
  await page.waitForSelector('[data-testid="chat-panel"]');

  // 2. Click mic button
  await page.click('[data-testid="mic-button"]');
  await page.waitForSelector('[data-testid="listening-indicator"]');

  // 3. Simulate voice command (mock STT)
  await page.evaluate(() => {
    window.__DAWG_TEST_API.simulateVoiceCommand('load up a drake vibe at 140');
  });

  // 4. Wait for beat candidates
  await page.waitForSelector('[data-testid="beat-candidate"]', { timeout: 5000 });

  const candidates = await page.$$('[data-testid="beat-candidate"]');
  expect(candidates).toHaveLength(3);

  // 5. Select first beat
  await candidates[0].click();
  await page.waitForSelector('[data-testid="beat-playing"]');

  // 6. Accept beat
  await page.click('[data-testid="beat-accept"]');
  await page.waitForSelector('[data-testid="track-1"]');

  // 7. Record 16 bars
  await page.evaluate(() => {
    window.__DAWG_TEST_API.simulateVoiceCommand('record 16 bars');
  });

  // Wait for count-in
  await page.waitForSelector('[data-testid="count-in"]');
  await page.waitForSelector('[data-testid="recording-hud"]');

  // Wait for recording to complete (16 bars @ 140 BPM ≈ 27s × 4 takes)
  await page.waitForSelector('[data-testid="take-1"]', { timeout: 120000 });

  // 8. Stop recording
  await page.evaluate(() => {
    window.__DAWG_TEST_API.simulateVoiceCommand('stop');
  });

  // 9. Create comp
  await page.evaluate(() => {
    window.__DAWG_TEST_API.simulateVoiceCommand('comp the best takes');
  });

  await page.waitForSelector('[data-testid="comp-created"]', { timeout: 10000 });

  // 10. Verify final state
  const tracks = await page.$$('[data-testid^="track-"]');
  expect(tracks.length).toBeGreaterThanOrEqual(2); // Beat + Comp

  // 11. Export
  await page.click('[data-testid="export-button"]');
  await page.waitForSelector('[data-testid="export-dialog"]');

  const downloadPromise = page.waitForEvent('download');
  await page.click('[data-testid="export-start"]');
  const download = await downloadPromise;

  expect(download.suggestedFilename()).toContain('.wav');
});
```

**Beat Generation Test**:

```typescript
test('AI beat generation produces playable patterns', async ({ page }) => {
  await page.goto('http://localhost:5174');

  // Generate trap beat
  await page.evaluate(() => {
    window.__DAWG_TEST_API.simulateVoiceCommand('make a trap beat at 140');
  });

  await page.waitForSelector('[data-testid="beat-candidate"]', { timeout: 5000 });

  // Verify 3 variations
  const candidates = await page.$$('[data-testid="beat-candidate"]');
  expect(candidates).toHaveLength(3);

  // Check each has audio
  for (const candidate of candidates) {
    const hasAudio = await candidate.evaluate(el => {
      return el.querySelector('audio') !== null;
    });
    expect(hasAudio).toBe(true);
  }

  // Play first candidate
  await candidates[0].click();
  await page.waitForTimeout(2000); // Listen for 2s

  // Verify audio is playing
  const isPlaying = await page.evaluate(() => {
    return !Tone.Transport.state === 'started';
  });
  expect(isPlaying).toBe(true);
});
```

**Voice Command Test**:

```typescript
test('voice commands execute correctly', async ({ page }) => {
  await page.goto('http://localhost:5174');

  const commands = [
    { input: 'load a beat', expectation: '[data-testid="beat-candidate"]' },
    { input: 'set tempo to 120', expectation: '[data-testid="bpm-120"]' },
    { input: 'add reverb to track 1', expectation: '[data-testid="effect-reverb"]' },
    { input: 'mute track 2', expectation: '[data-testid="track-2-muted"]' }
  ];

  for (const cmd of commands) {
    await page.evaluate((text) => {
      window.__DAWG_TEST_API.simulateVoiceCommand(text);
    }, cmd.input);

    await page.waitForSelector(cmd.expectation, { timeout: 3000 });
  }
});
```

### 2. Performance Tests (`tests/performance/`)

**Latency Benchmark**:

```typescript
test('voice loop latency <2s', async ({ page }) => {
  await page.goto('http://localhost:5174');

  const measurements = [];

  for (let i = 0; i < 10; i++) {
    const start = Date.now();

    await page.evaluate(() => {
      window.__DAWG_TEST_API.simulateVoiceCommand('play');
    });

    await page.waitForSelector('[data-testid="playing"]');

    const latency = Date.now() - start;
    measurements.push(latency);
  }

  const p95 = percentile(measurements, 95);
  expect(p95).toBeLessThan(2000); // <2s p95
});
```

**Audio Rendering Performance**:

```typescript
test('export renders faster than realtime', async ({ page }) => {
  await page.goto('http://localhost:5174');

  // Load project with 5 tracks × 5 minutes
  await page.evaluate(() => {
    window.__DAWG_TEST_API.loadTestProject('large-project');
  });

  const start = Date.now();

  await page.evaluate(() => {
    return window.__DAWG_TEST_API.exportMix({ format: 'wav' });
  });

  const renderTime = Date.now() - start;
  const trackDuration = 5 * 60 * 1000; // 5 minutes

  expect(renderTime).toBeLessThan(trackDuration * 0.5); // 2x realtime minimum
});
```

### 3. Integration Tests (`tests/integration/`)

Test all module interactions:

```typescript
test('command bus → beat engine → timeline', async () => {
  // Dispatch command
  const result = await commandBus.dispatch({
    type: 'beat.generate',
    style: 'toronto-ambient-trap',
    bpm: 140,
    bars: 4
  });

  expect(result.success).toBe(true);
  expect(result.data.beats).toHaveLength(3);

  // Accept beat
  await commandBus.dispatch({
    type: 'beat.accept',
    candidateId: result.data.beats[0].id
  });

  // Verify track created
  const tracks = audioEngine.getAllTracks();
  expect(tracks.length).toBe(1);
  expect(tracks[0].name).toBe('Beat');
});

test('recording → takes → comp', async () => {
  // Start recording
  const { trackId } = await recordingManager.startLoopRecording({
    bars: 8,
    countInBars: 1
  });

  // Simulate 3 loop passes
  for (let i = 0; i < 3; i++) {
    await waitForLoopEnd();
  }

  // Stop
  const takes = await recordingManager.stopRecording();
  expect(takes).toHaveLength(3);

  // Create comp
  const comp = await compEngine.createAutoComp({
    region: { startBar: 0, endBar: 8 },
    trackId,
    method: 'auto'
  });

  expect(comp.segments.length).toBeGreaterThan(0);
  expect(comp.crossfades.length).toBeGreaterThan(0);
});
```

### 4. Test Utilities (`tests/utils/`)

**Mock STT** (`tests/utils/mockSTT.ts`):

```typescript
export function mockSTT(page: Page) {
  return page.evaluate(() => {
    window.__DAWG_TEST_API = {
      ...window.__DAWG_TEST_API,
      simulateVoiceCommand: (text: string) => {
        // Trigger same flow as real STT
        const event = new CustomEvent('stt:final', { detail: { text } });
        window.dispatchEvent(event);
      }
    };
  });
}
```

**Test Audio Generator** (`tests/utils/audioGenerator.ts`):

```typescript
export function generateTestAudio(durationSec: number, frequency: number): AudioBuffer {
  const sampleRate = 48000;
  const length = durationSec * sampleRate;
  const buffer = new AudioContext().createBuffer(2, length, sampleRate);

  for (let ch = 0; ch < 2; ch++) {
    const data = buffer.getChannelData(ch);
    for (let i = 0; i < length; i++) {
      data[i] = Math.sin(2 * Math.PI * frequency * i / sampleRate) * 0.5;
    }
  }

  return buffer;
}
```

### 5. CI/CD Pipeline (`.github/workflows/test.yml`)

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: npm run test:e2e
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
          DEEPGRAM_API_KEY: ${{ secrets.DEEPGRAM_API_KEY }}

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

## Testing Checklist

### Functional Tests
```
[ ] Voice commands parse correctly (20 test utterances)
[ ] Beat generation produces 3 variations
[ ] Beat preview plays instantly (<100ms)
[ ] Recording captures audio
[ ] Loop recording creates multiple takes
[ ] Auto-comp selects best segments
[ ] Crossfades are smooth
[ ] Export produces valid WAV
[ ] Project save/load preserves state
[ ] Undo/redo works
```

### Performance Tests
```
[ ] Voice loop <2s (p95)
[ ] Beat generation <5s
[ ] Export faster than realtime
[ ] No memory leaks (10min session)
[ ] CPU <50% during playback
[ ] Smooth UI (60fps) with 20+ tracks
```

### Integration Tests
```
[ ] All modules communicate via command bus
[ ] Events propagate correctly
[ ] State synchronizes across components
[ ] No race conditions in async operations
```

### Quality Tests
```
[ ] Audio exports sound professional
[ ] No artifacts (clicks, pops, aliasing)
[ ] Jarvis responses feel natural
[ ] UI is intuitive (user testing)
```

## Git Branch
`integration-tests`

## Success Criteria
- ✅ 90%+ E2E test pass rate
- ✅ All performance benchmarks met
- ✅ Zero critical bugs in freestyle flow
- ✅ Comprehensive test coverage (>80%)
- ✅ CI/CD pipeline running automatically
- ✅ User acceptance testing positive

**Start with freestyle flow E2E test as it validates the entire system.**
```

---

