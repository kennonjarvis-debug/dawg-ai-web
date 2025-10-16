## ✂️ Instance 6: Comp Engine (Auto-Comp + Crossfades)

```markdown
# Claude Code Prompt: Auto-Comp & Crossfade System

## Mission
Build intelligent auto-comp engine that selects best segments from takes and creates smooth crossfades.

## Context Files
1. `PHASE_3_FREESTYLE_FLOW_ARCHITECTURE.md` (section 5: Comp Engine)

## Deliverables

### 1. Comp Engine (`src/lib/audio/comp/CompEngine.ts`)

```typescript
interface CompOptions {
  region: { startBar: number; endBar: number };
  trackId: string;
  method: 'auto' | 'manual';
}

class CompEngine {
  async createAutoComp(opts: CompOptions): Promise<CompResult> {
    // 1. Get all takes
    // 2. Divide into segments
    // 3. Score each take for each segment
    // 4. Create crossfades at boundaries
    // 5. Render final comp
  }

  private scoreTakeForSegment(take: Take, segment: any): number {
    // Score based on:
    // - Timing accuracy (40%)
    // - Signal quality (40%)
    // - No clipping (20%)
  }

  private applyCrossfade(buffer: AudioBuffer, crossfade: any, position: number) {
    // Equal-power crossfade (20-30ms)
  }
}
```

### 2. Comp Review Component (`src/lib/components/comp/CompReview.svelte`)

Visual timeline showing which take was selected for each segment with score explanations.

## Git Branch
`comp-engine`

## Success Criteria
- ✅ Auto-comp selects best segments accurately
- ✅ Crossfades are smooth and inaudible
- ✅ Comp rendering <5s for 16-bar region
- ✅ Manual overrides apply correctly
- ✅ No audio artifacts (clicks, pops)

**Start with segment scoring, then crossfade algorithm, finally rendering.**
```

---

