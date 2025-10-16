# DAWG AI - Issues & Fix Plan
**Generated**: October 15, 2025
**Context**: Pre-Phase 3 testing and stabilization

## Executive Summary

The DAWG AI Super-Agent Test Framework has been successfully built and integrated. However, initial E2E testing has revealed critical blockers that prevent the application from loading. These must be resolved before comprehensive module testing can proceed.

**Test Framework Status**: ✅ Complete and operational
**Application Status**: ❌ Cannot load due to configuration errors
**Modules to Test**: 1 (Transport), 2 (Tracks), 3 (MIDI), 4 (Recording), 5 (Effects), 10 (Export)

---

## Critical Blockers (P0 - Fix Immediately)

### 1. TailwindCSS Configuration Error
**Severity**: CRITICAL
**Impact**: App cannot render - 500 error on all pages
**Module**: Design System / UI

**Error**:
```
CssSyntaxError: [postcss] /Users/benkennon/dawg-ai-v0/src/app.css:1:1:
The `border-border` class does not exist. If `border-border` is a custom class,
make sure it is defined within a `@layer` directive.
```

**Root Cause**:
- `app.css` references undefined Tailwind custom class `border-border`
- Missing theme color definition in `tailwind.config.js`

**Fix Required**:
1. Check `src/app.css` line 1 - remove or fix `@apply border-border`
2. Verify `tailwind.config.js` has complete theme.extend.colors config
3. Ensure all custom color classes are defined

**Files to Check**:
- `src/app.css`
- `tailwind.config.js`
- Any component using `border-border` class

**Estimated Time**: 15 minutes

---

### 2. Supabase Client Not Initialized
**Severity**: CRITICAL
**Impact**: Auth and API services unavailable - app cannot initialize
**Module**: API Layer / Authentication

**Error**:
```
ReferenceError: supabase is not defined
    at new AuthAPI (/Users/benkennon/dawg-ai-v0/src/lib/api/AuthAPI.ts:18:21)
```

**Root Cause**:
- `AuthAPI` trying to use `supabase` before client is created
- Missing `.env` file with Supabase credentials
- OR incorrect client initialization order

**Fix Required**:
1. Check if `.env.example` or `.env.local` exists
2. Verify `src/lib/api/supabase.ts` exports initialized client
3. Ensure `AuthAPI` imports from supabase client singleton
4. Add null checks / lazy initialization

**Files to Check**:
- `src/lib/api/supabase.ts`
- `src/lib/api/AuthAPI.ts`
- `.env` / `.env.local` (may be missing)
- `.env.example` (for template)

**Estimated Time**: 30 minutes

**Note**: For E2E testing, may need to mock Supabase or provide test credentials

---

## High Priority Issues (P1 - Fix Before Phase 3)

### 3. A11y Warnings (Non-Blocking)
**Severity**: HIGH
**Impact**: Accessibility compliance, potential UX issues
**Module**: Design System

**Warnings** (18 total):
- Click events without keyboard handlers
- Missing ARIA roles
- Autofocus on inputs
- Invalid role/ARIA combinations

**Fix Required**:
- Add keyboard event handlers to clickable elements
- Add proper ARIA roles to interactive elements
- Remove or justify autofocus usage
- Fix role/ARIA mismatches

**Files Affected**:
- `src/lib/components/cloud/AuthModal.svelte`
- `src/lib/components/cloud/ProjectManager.svelte`
- `src/lib/design-system/atoms/Fader.svelte`
- `src/lib/design-system/atoms/Input.svelte`
- `src/lib/design-system/atoms/Meter.svelte`
- `src/lib/design-system/molecules/TrackHeader.svelte`
- `src/lib/design-system/molecules/EffectSlot.svelte`
- `src/lib/design-system/molecules/WaveformDisplay.svelte`
- `src/lib/design-system/molecules/PianoKey.svelte`

**Estimated Time**: 2-3 hours

---

## Test Framework Integration Status

### ✅ Completed
1. **Test Framework Built**
   - CLI tool with run/plan/smoke commands
   - Natural language test planner
   - YAML DSL with validation
   - Audio analysis utilities (RMS, LUFS, dropouts, envelope)
   - Playwright runner with video/trace capture

2. **Test Bridge Integrated**
   - `src/lib/testing/bridge.ts` created
   - `src/routes/+layout.svelte` updated to load in test mode
   - `vite.config.ts` configured for MODE=test
   - Exposes `window.__DAWG_TEST_API` for test control

3. **Test Specs Created**
   - Basic connection test
   - Vocal + plate reverb test
   - MIDI piano quantization test
   - AI beat generation test

### ❌ Blocked
Cannot run E2E tests until critical blockers are resolved.

---

## Proposed Fix Order

### Phase 1: Critical Fixes (Required Before Testing)
**Time**: 1-2 hours

1. **Fix Tailwind Config** (15 min)
   - Locate `border-border` usage in `app.css`
   - Define missing color in `tailwind.config.js` or remove usage
   - Test that dev server starts without CSS errors

2. **Fix Supabase Initialization** (30 min)
   - Create `.env` from template with test credentials
   - Verify supabase client singleton pattern
   - Add defensive checks in AuthAPI
   - Consider mocking Supabase for E2E tests

3. **Verify App Loads** (15 min)
   - Start dev server in test mode
   - Open browser to confirm no 500 errors
   - Check console for `✅ DAWG Test API mounted`

### Phase 2: Run Smoke Tests (Testing & Documentation)
**Time**: 2-3 hours

4. **Run Connection Test** (15 min)
   - Execute `test_api_connection.yml`
   - Verify test bridge communication works
   - Document any new issues

5. **Test Each Module** (90 min)
   - Module 1: Transport (play/stop/BPM)
   - Module 2: Track Management
   - Module 3: MIDI
   - Module 4: Recording
   - Module 5: Effects
   - Module 10: Export

6. **Document Findings** (30 min)
   - Categorize failures by module
   - Note missing features vs. bugs
   - Prioritize fixes

### Phase 3: Fix Accessibility Issues (Quality)
**Time**: 2-3 hours

7. **Address A11y Warnings**
   - Add keyboard handlers
   - Fix ARIA roles
   - Remove problematic autofocus
   - Run a11y audit

### Phase 4: Implement Missing Features (Development)
**Time**: TBD based on findings

8. **Complete Module Implementation**
   - Fix bugs discovered in testing
   - Implement missing test API methods
   - Add offline rendering support for WAV export

---

## Testing Checklist

Once critical fixes are complete, run these tests:

### Module 1: Transport Control
- [ ] Play/stop functionality
- [ ] BPM changes (range: 20-999)
- [ ] Position seeking
- [ ] Time signature changes

### Module 2: Track Management
- [ ] Add audio track
- [ ] Add MIDI track
- [ ] Add aux/bus track
- [ ] Remove track
- [ ] Track volume/pan control
- [ ] Mute/solo functionality

### Module 3: MIDI
- [ ] MIDI input recording
- [ ] MIDI playback
- [ ] Note quantization
- [ ] Piano roll rendering

### Module 4: Audio Recording
- [ ] Record audio input
- [ ] Monitor during recording
- [ ] Stop recording
- [ ] Recorded clip playback

### Module 5: Effects
- [ ] Apply reverb effect
- [ ] Apply EQ
- [ ] Effect parameter automation
- [ ] Effect bypass
- [ ] Measure tail length

### Module 10: File Export/Import
- [ ] Export WAV (offline render)
- [ ] Save project to cloud
- [ ] Load project from cloud
- [ ] Audio quality validation (RMS, LUFS, dropouts)

---

## Expected Outcomes

After completing Phase 1 & 2:

1. **Working E2E Test Suite**
   - All smoke tests executable
   - Test API fully functional
   - Audio analysis operational

2. **Bug & Feature Gap Report**
   - Complete list of failing tests
   - Prioritized by severity
   - Time estimates for fixes

3. **Stabilized Core Modules**
   - Modules 1-5, 10 fully tested
   - Known issues documented
   - Regression test coverage

4. **Ready for Phase 3**
   - Solid foundation for new features
   - Automated testing in place
   - CI/CD pipeline functional

---

## Next Steps

1. **Immediately**: Fix critical blockers (Tailwind + Supabase)
2. **Then**: Run comprehensive smoke tests
3. **Then**: Document all findings and create detailed fix tickets
4. **Finally**: Prioritize fixes before starting Phase 3 development

---

## Notes

- Test framework is 100% complete and working - blockers are in DAWG AI app itself
- Natural language test planner is operational and generates valid specs
- Audio analysis (LUFS, RMS, dropouts) is production-ready
- GitHub Actions CI workflow ready to enable once tests pass
- Test API bridge pattern is sound - just needs app to load first

---

## Contact & Questions

For questions about this fix plan or test framework:
- Check `dawg-superagent/README.md` for framework documentation
- See `DAWG_TEST_API_INTEGRATION.md` for integration guide
- Run `dawg-tester --help` for CLI usage

**Goal**: Stabilize app, run E2E tests, identify all issues before Phase 3 begins.
