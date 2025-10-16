# Production Test Checklist - dawg-ai.com

**URL**: https://www.dawg-ai.com/app
**Date**: _____________
**Tester**: _____________

---

## 🔐 GOOGLE AUTH CONFIGURATION (Do This First!)

### Google Cloud Console
- [ ] Open https://console.cloud.google.com
- [ ] Select DAWG AI project
- [ ] Go to APIs & Services → Credentials
- [ ] Edit OAuth 2.0 Client ID
- [ ] Add to Authorized JavaScript origins:
  - [ ] `https://www.dawg-ai.com`
  - [ ] `https://dawg-ai.com`
- [ ] Verify redirect URI exists:
  - [ ] `https://nvyebkzrrvmepbdejspr.supabase.co/auth/v1/callback`
- [ ] Click SAVE

### Supabase Dashboard
- [ ] Open https://app.supabase.com/project/nvyebkzrrvmepbdejspr
- [ ] Go to Authentication → URL Configuration
- [ ] Set Site URL to: `https://www.dawg-ai.com`
- [ ] Add to Redirect URLs:
  - [ ] `https://www.dawg-ai.com/**`
  - [ ] `https://dawg-ai.com/**`
- [ ] Click SAVE
- [ ] Go to Authentication → Providers
- [ ] Find Google provider
- [ ] Verify it's ENABLED
- [ ] Verify Client ID and Secret are set
- [ ] Click SAVE if changed

---

## 🧪 AUTH TESTING

### Email/Password Auth
- [ ] Open https://www.dawg-ai.com/app
- [ ] Click Sign In button
- [ ] Try Sign Up with email/password
- [ ] Check email for confirmation
- [ ] Confirm email
- [ ] Sign in with credentials
- [ ] ✅ Success / ❌ Error: _______________

### Google OAuth
- [ ] Click "Continue with Google"
- [ ] Redirects to Google sign-in page
- [ ] Sign in with Google account
- [ ] Grant permissions
- [ ] Redirects back to dawg-ai.com
- [ ] You are logged in
- [ ] ✅ Success / ❌ Error: _______________

### Session Persistence
- [ ] While logged in, refresh page
- [ ] Still logged in after refresh
- [ ] ✅ Success / ❌ Error: _______________

### Sign Out
- [ ] Click sign out
- [ ] Logged out successfully
- [ ] ✅ Success / ❌ Error: _______________

---

## ⚛️ ATOMS TESTING

### Button
- [ ] Primary button clickable
- [ ] Secondary button clickable
- [ ] Ghost button clickable
- [ ] Danger button clickable
- [ ] Disabled button not clickable
- [ ] Loading state shows spinner
- [ ] Notes: _______________

### Fader
- [ ] Click and drag slider
- [ ] Moves smoothly
- [ ] Value updates
- [ ] Click-to-jump works
- [ ] Notes: _______________

### Knob
- [ ] Drag vertically to rotate
- [ ] Mouse wheel adjusts value
- [ ] Displays correct value
- [ ] Notes: _______________

### Toggle
- [ ] Click to turn on
- [ ] Click to turn off
- [ ] Animation smooth
- [ ] Notes: _______________

### Input
- [ ] Can type text
- [ ] Number input accepts numbers
- [ ] Password masked
- [ ] Focus state visible
- [ ] Notes: _______________

### Icon
- [ ] Icons display correctly
- [ ] Proper size
- [ ] Clear visuals
- [ ] Notes: _______________

### Label
- [ ] Text renders
- [ ] Different sizes work
- [ ] Readable
- [ ] Notes: _______________

### Meter
- [ ] Level indicator visible
- [ ] Animates smoothly
- [ ] Peak hold works
- [ ] Red at clipping
- [ ] Notes: _______________

---

## 🧬 MOLECULES TESTING

### Transport Controls
- [ ] Play button works
- [ ] Stop button works
- [ ] Record button works
- [ ] Tempo adjustable
- [ ] Loop toggle works
- [ ] Notes: _______________

### Track Header
- [ ] Track name editable
- [ ] Mute button toggles
- [ ] Solo button toggles
- [ ] Arm button toggles
- [ ] Visual feedback clear
- [ ] Notes: _______________

### Fader Channel
- [ ] Fader controls volume
- [ ] Pan knob works
- [ ] Meter shows level
- [ ] Mute/solo buttons work
- [ ] All parts integrated
- [ ] Notes: _______________

### Waveform Display
- [ ] Waveform renders
- [ ] Visually clear
- [ ] Responds to data
- [ ] Notes: _______________

### Piano Key
- [ ] White keys render
- [ ] Black keys render
- [ ] Click interaction works
- [ ] Active state visible
- [ ] Notes: _______________

### Effect Slot
- [ ] Effect name shows
- [ ] Enable/disable toggle works
- [ ] Visual state changes
- [ ] Notes: _______________

---

## 🏛️ ORGANISMS TESTING

### Mixer
- [ ] Multiple channels display
- [ ] All faders work
- [ ] Meters update
- [ ] Pan controls work
- [ ] Master fader works
- [ ] Notes: _______________

### Effects Rack
- [ ] Effects list displays
- [ ] Add effect works
- [ ] Remove effect works
- [ ] Reorder effects works
- [ ] Enable/disable works
- [ ] Notes: _______________

### Browser Panel
- [ ] File tree renders
- [ ] Navigation works
- [ ] Search functional
- [ ] File preview works
- [ ] Notes: _______________

### Inspector Panel
- [ ] Track properties show
- [ ] Parameter editing works
- [ ] Updates in real-time
- [ ] Notes: _______________

---

## 📱 MOBILE TESTING

### iOS Safari
- [ ] App loads
- [ ] Auth works
- [ ] Components interactive
- [ ] Touch gestures work
- [ ] Layout responsive
- [ ] No horizontal scroll
- [ ] Notes: _______________

### Android Chrome
- [ ] App loads
- [ ] Auth works
- [ ] Components interactive
- [ ] Touch gestures work
- [ ] Layout responsive
- [ ] Notes: _______________

---

## 🚨 BROWSER CONSOLE ERRORS

**Check F12 → Console**

### Errors Found:
```
(List any errors here)




```

### Warnings:
```
(List any warnings here)




```

---

## 🎨 VISUAL/UX ISSUES

### Design Issues:
- [ ] Colors correct
- [ ] Fonts loading
- [ ] Spacing consistent
- [ ] Theme working
- [ ] Glassmorphic effects
- [ ] Notes: _______________

### Layout Issues:
- [ ] No broken layouts
- [ ] Responsive design works
- [ ] No overlapping elements
- [ ] Scrolling smooth
- [ ] Notes: _______________

---

## ⚡ PERFORMANCE

### Page Load
- [ ] Loads in < 3 seconds
- [ ] Progressive loading
- [ ] No long pauses
- [ ] Notes: _______________

### Interactions
- [ ] Clicks responsive (< 100ms)
- [ ] Animations smooth (60fps)
- [ ] No lag or freezing
- [ ] Notes: _______________

---

## 🐛 ISSUES FOUND

### Critical (Blocks usage)
1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

### High (Major problem)
1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

### Medium (Noticeable issue)
1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

### Low (Minor polish)
1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

---

## ✅ FINAL VERDICT

**Overall Status**:
- [ ] ✅ PASS - Production Ready
- [ ] ⚠️ CONDITIONAL PASS - Minor issues
- [ ] ❌ FAIL - Major issues need fixing

**Can users use the app?**
- [ ] Yes, fully functional
- [ ] Yes, with minor issues
- [ ] No, too many problems

**Confidence Level**: ___/10

**Next Steps**:
_______________________________________________
_______________________________________________
_______________________________________________

---

**Tester Signature**: _________________ **Date**: _____________
