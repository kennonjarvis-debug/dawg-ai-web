# DAWG AI Testing Guide

**Date**: 2025-10-15
**Status**: 🧪 Ready for Testing

---

## Quick Access

### Component Testing Page
**URL**: http://localhost:5174/test/components

This page lets you visually test all design system components:
- **Atoms (8)**: Button, Fader, Icon, Input, Knob, Label, Meter, Toggle
- **Molecules (6)**: EffectSlot, FaderChannel, PianoKey, TrackHeader, TransportControls, WaveformDisplay
- **Organisms (4)**: BrowserPanel, EffectsRack, InspectorPanel, Mixer

### Main App
**URL**: http://localhost:5174

---

## Setup Tasks

### ✅ Complete
1. **Design System Built**: All atoms, molecules, organisms implemented
2. **Component Test Page Created**: Visual testing interface at `/test/components`
3. **Google Auth Setup Guide**: Full instructions in `GOOGLE_AUTH_SETUP.md`
4. **Supabase Configured**: URL and anon key set in `.env`

### 🔧 To Do

#### 1. Configure Google OAuth (5 minutes)
Follow the step-by-step guide in `GOOGLE_AUTH_SETUP.md`:
1. Get Google OAuth credentials from Google Cloud Console
2. Enable Google provider in Supabase dashboard
3. Test sign-in flow

**Why**: Enables "Continue with Google" button in auth modal

---

## Testing Checklist

### Atoms ⚛️

#### Button
- [ ] Click all 4 variants (primary, secondary, ghost, danger)
- [ ] Test all 5 sizes (xs, sm, md, lg, xl)
- [ ] Verify disabled state
- [ ] Check loading state animation
- [ ] Keyboard navigation (Tab, Enter)

#### Fader
- [ ] Drag slider up/down
- [ ] Click to jump to position
- [ ] Verify value updates
- [ ] Test disabled state
- [ ] Mouse wheel support

#### Knob
- [ ] Vertical drag to rotate
- [ ] Mouse wheel to adjust
- [ ] Test bipolar mode (-1 to +1)
- [ ] Different sizes (sm, md, lg)
- [ ] Value precision

#### Toggle
- [ ] Click to toggle on/off
- [ ] Smooth animation
- [ ] Disabled state
- [ ] Keyboard support (Space)

#### Input
- [ ] Type in text input
- [ ] Number input validation
- [ ] Password masking
- [ ] Placeholder text
- [ ] Disabled state
- [ ] Focus states

#### Label
- [ ] All sizes (xs, sm, md, lg, xl)
- [ ] All weights (normal, medium, semibold, bold)
- [ ] Text rendering

#### Icon
- [ ] All transport icons render
- [ ] All tool icons render
- [ ] Size variants
- [ ] Color/theme consistency

#### Meter
- [ ] Level indicator moves
- [ ] Peak hold works
- [ ] Clipping indicator (red at 100%)
- [ ] Smooth animation

### Molecules 🧬

#### FaderChannel
- [ ] Fader controls volume
- [ ] Knobs adjust parameters
- [ ] Mute button toggles
- [ ] Solo button works
- [ ] Meter shows level
- [ ] All components integrated

#### TrackHeader
- [ ] Track name editable
- [ ] Mute/Solo/Arm buttons toggle
- [ ] Visual feedback
- [ ] Icon states

#### TransportControls
- [ ] Play button toggles playback
- [ ] Stop button works
- [ ] Record button arms recording
- [ ] Tempo adjustable
- [ ] Loop button toggles

#### WaveformDisplay
- [ ] Waveform renders
- [ ] Canvas drawing works
- [ ] Responsive to container
- [ ] Zoom/scroll (if implemented)

#### PianoKey
- [ ] White keys render correctly
- [ ] Black keys positioned properly
- [ ] Active state highlights
- [ ] Click/touch interaction

#### EffectSlot
- [ ] Effect name displays
- [ ] Enable/disable toggle
- [ ] Visual state changes
- [ ] Delete/edit actions

### Organisms 🏛️

#### Mixer
- [ ] Multiple channels render
- [ ] All fader channels work
- [ ] Master fader controls
- [ ] Meters update
- [ ] Pan controls work

#### EffectsRack
- [ ] Effects list displays
- [ ] Add effect button works
- [ ] Reorder effects
- [ ] Remove effects
- [ ] Enable/disable effects

#### BrowserPanel
- [ ] File tree renders
- [ ] Navigation works
- [ ] Search functionality
- [ ] File preview
- [ ] Drag and drop

#### InspectorPanel
- [ ] Shows track properties
- [ ] Parameter editing
- [ ] Real-time updates
- [ ] Different track types
- [ ] Automation controls

---

## Auth Testing

### Email/Password Auth
- [ ] Sign up with email/password
- [ ] Receive confirmation email
- [ ] Confirm email address
- [ ] Sign in with credentials
- [ ] Sign out
- [ ] Session persistence (refresh page)
- [ ] Password reset flow

### Google OAuth
- [ ] Click "Continue with Google"
- [ ] Redirected to Google sign-in
- [ ] Authorize app
- [ ] Redirected back to DAWG AI
- [ ] User logged in
- [ ] Profile info populated
- [ ] Sign out
- [ ] Sign in again (should be faster)

---

## Common Issues & Solutions

### Component not rendering
**Check**: Browser console for errors
**Fix**: Ensure all imports are correct, props are valid

### Styles not applied
**Check**: Theme provider wrapping the app
**Fix**: Verify `ThemeProvider.svelte` is in `+layout.svelte`

### Events not firing
**Check**: Event handlers properly bound
**Fix**: Use `on:click` not `onclick`, bind values with `bind:`

### Google Auth not working
**Check**: `GOOGLE_AUTH_SETUP.md` for configuration steps
**Common issues**:
- OAuth credentials not set in Supabase
- Redirect URI mismatch
- Popup blocked by browser

---

## Performance Testing

### Metrics to Check
- [ ] Page load time < 2s
- [ ] Component interactions responsive (< 16ms)
- [ ] Smooth animations (60fps)
- [ ] No memory leaks (check DevTools)
- [ ] Waveform rendering smooth

### Tools
- Chrome DevTools > Performance tab
- Lighthouse audit
- Network tab for bundle size

---

## Browser Compatibility

Test in:
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

---

## Accessibility Testing

- [ ] Keyboard navigation works for all components
- [ ] Screen reader announces elements correctly
- [ ] Focus indicators visible
- [ ] Color contrast meets WCAG AA
- [ ] ARIA labels present

---

## Next Steps After Testing

1. **Document Issues**: Create list of bugs/improvements
2. **Fix Critical Bugs**: Blocking issues first
3. **Optimize Performance**: If needed
4. **Polish UI**: Fine-tune spacing, colors, animations
5. **Deploy to Staging**: Once local testing passes
6. **User Testing**: Get feedback from real users

---

## Quick Commands

```bash
# Start dev server
npm run dev

# Run tests
npm run test

# Build for production
npm run build

# Preview production build
npm run preview

# Type check
npm run check
```

---

## Support Files

- `GOOGLE_AUTH_SETUP.md` - Google OAuth configuration
- `DESIGN_SYSTEM_COMPLETE.md` - Design system documentation
- `API_CONTRACTS.md` - API specifications
- `README.md` - Project overview

---

**Happy Testing!** 🧪

Report issues or improvements and we'll iterate!
