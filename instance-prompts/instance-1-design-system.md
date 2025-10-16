## 🎨 Instance 1: Design System + Chat UI

```markdown
# Claude Code Prompt: Design System & Chat Interface

## Mission
Create DAWG AI's design system and chat-based UI components for the Jarvis AI companion.

## Context Files to Read
1. `/Users/benkennon/dawg-ai-v0/PHASE_3_FREESTYLE_FLOW_ARCHITECTURE.md` (section 7: UI Components)
2. Design System module from comprehensive spec

## Deliverables

### 1. Design System Foundation
Create `src/lib/design-system/`:
- **Theme**: `theme.ts` with CSS variables (dark mode primary, Jarvis personality colors)
- **Colors**:
  - Background: #0a0a0a (deep black)
  - Jarvis Blue: #00d9ff (supportive)
  - Jarvis Orange: #ff6b35 (excited)
  - Jarvis Red: #ff006e (challenging)
  - Jarvis Green: #00ff88 (chill)
- **Typography**: Inter for UI, JetBrains Mono for code

### 2. Atomic Components (`src/lib/design-system/atoms/`)
Create Svelte 5 components:
- `Button.svelte` (primary, secondary, danger, ghost variants)
- `Input.svelte` (text, number, with validation states)
- `Fader.svelte` (vertical volume slider with dB scale)
- `Knob.svelte` (rotary control for effects parameters)
- `Toggle.svelte` (on/off switch)
- `Meter.svelte` (VU meter with peak hold)
- `Icon.svelte` (using Lucide icons)

### 3. Chat Components (`src/lib/components/chat/`)
**ChatPanel.svelte**:
```typescript
<script lang="ts">
  interface Message {
    id: string;
    from: 'user' | 'jarvis';
    text: string;
    mood?: 'supportive' | 'excited' | 'challenging' | 'chill';
    timestamp: Date;
    actionCard?: ActionCard; // BeatCandidates, RecordHUD, etc.
  }

  let messages: Message[] = $state([]);
  let inputText = $state('');
</script>

<!--
  Requirements:
  - Auto-scroll to latest message
  - Mood-based styling (background gradient by mood)
  - Inline action cards (slots for components)
  - Markdown rendering for Jarvis responses
  - Voice indicator when listening
  - Quick action buttons below input
-->
```

**MicButton.svelte**:
```typescript
<script lang="ts">
  let isListening = $state(false);
  let isProcessing = $state(false);

  function toggleMic() {
    if (!isListening) {
      emit('startListening');
    } else {
      emit('stopListening');
    }
    isListening = !isListening;
  }
</script>

<!--
  Visual states:
  - Idle: blue circle with mic icon
  - Listening: pulsing ring animation
  - Processing: spinner overlay
  - Keyboard shortcut: M
-->
```

**TranscriptDisplay.svelte**: Live transcript with partial updates

**BeatCandidates.svelte**: 3-card preview (play button, tags, "Use this")

**RecordHUD.svelte**: Big transport controls during recording (count-in timer, take counter, loop range display)

**CompReview.svelte**: Segment breakdown with "keep take X bars Y-Z" buttons

### 4. Storybook Setup
Create `.storybook/` config and stories for all components.

### 5. Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation for all controls
- Screen reader labels
- Focus indicators

## Technical Requirements
- **Svelte 5** with TypeScript
- **Tailwind CSS** for utilities
- **CSS variables** for theme
- **Framer Motion** for animations (optional)
- Responsive (desktop 1920x1080, tablet 1024x768)

## Testing
- Visual regression tests (Playwright + Percy)
- Interaction tests for all controls
- Accessibility audit (axe-core)

## Git Branch
`design-system-chat-ui`

## Success Criteria
- ✅ Storybook running with all components
- ✅ Chat panel with mock messages renders correctly
- ✅ All mood colors display distinctly
- ✅ Mic button responds to click and keyboard
- ✅ 90+ Lighthouse accessibility score
- ✅ Dark mode looks professional (producer-grade aesthetic)

**Start by reading the architecture doc, then scaffold components one by one. Prioritize Chat Panel and Mic Button as they're critical path.**
```

---

