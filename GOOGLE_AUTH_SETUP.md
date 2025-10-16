# Google OAuth Setup Guide for DAWG AI

**Status**: 🔧 In Progress
**Date**: 2025-10-15

---

## Overview

This guide walks you through setting up Google OAuth authentication in DAWG AI using Supabase.

**Current Status**:
- ✅ Supabase configured (`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` set)
- ✅ AuthModal UI component ready with Google button
- ✅ AuthAPI has `signInWithOAuth()` method implemented
- ⏳ **Need to configure**: Google OAuth provider in Supabase dashboard

---

## Step 1: Get Google OAuth Credentials

### 1.1 Go to Google Cloud Console
Navigate to: https://console.cloud.google.com

### 1.2 Create or Select a Project
1. Click the project dropdown at the top
2. Click "New Project" or select existing "DAWG AI" project
3. Name it: **DAWG AI**

### 1.3 Enable Google+ API
1. Go to **APIs & Services** > **Library**
2. Search for "Google+ API"
3. Click **Enable**

### 1.4 Create OAuth 2.0 Credentials
1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. If prompted, configure OAuth consent screen first:
   - User Type: **External**
   - App name: **DAWG AI**
   - User support email: **your email**
   - Developer contact: **your email**
   - Scopes: Add `email`, `profile`, `openid`
   - Test users: Add your email
   - Save and continue

4. Create OAuth Client ID:
   - Application type: **Web application**
   - Name: **DAWG AI Web Client**
   - Authorized JavaScript origins:
     - `http://localhost:5173` (dev)
     - `http://localhost:5176` (if using different port)
     - `https://yourdomain.com` (production later)
   - Authorized redirect URIs:
     - `https://nvyebkzrrvmepbdejspr.supabase.co/auth/v1/callback`
   - Click **Create**

5. **Copy the Client ID and Client Secret** - you'll need these next!

---

## Step 2: Configure Supabase

### 2.1 Open Supabase Dashboard
1. Go to: https://app.supabase.com
2. Select your project: `nvyebkzrrvmepbdejspr`

### 2.2 Enable Google Provider
1. Go to **Authentication** > **Providers**
2. Find **Google** in the list
3. Click to expand it
4. Toggle **Enable Sign in with Google** to ON
5. Paste your **Client ID** from Google Cloud Console
6. Paste your **Client Secret** from Google Cloud Console
7. Click **Save**

### 2.3 Configure Redirect URLs
1. Go to **Authentication** > **URL Configuration**
2. Add Site URL: `http://localhost:5176`
3. Add Redirect URLs:
   - `http://localhost:5173/**`
   - `http://localhost:5176/**`
4. Click **Save**

---

## Step 3: Test Google Auth

### 3.1 Start Dev Server
```bash
npm run dev
```

### 3.2 Open DAWG AI
Navigate to: http://localhost:5176

### 3.3 Test Sign In Flow
1. Click **Sign In** or **Get Started** (wherever auth modal triggers)
2. Click **Continue with Google** button
3. You should be redirected to Google sign-in page
4. Sign in with your Google account
5. Grant permissions
6. You should be redirected back to DAWG AI and be logged in

### 3.4 Verify Authentication
Open browser console and run:
```javascript
const { data } = await window.supabase.auth.getSession()
console.log('Current user:', data.session?.user)
```

You should see your user object with Google profile info!

---

## Step 4: Update AuthModal UI (Optional Improvements)

The current AuthModal at `src/lib/components/cloud/AuthModal.svelte` already has Google OAuth button implemented (lines 172-199).

**Optional improvements:**
- Add loading state for OAuth buttons
- Add better error handling for OAuth failures
- Add GitHub OAuth (follow same process with GitHub OAuth app)

---

## Troubleshooting

### Issue: "OAuth provider not configured"
**Solution**: Make sure you've enabled Google provider in Supabase dashboard and saved Client ID/Secret

### Issue: "Redirect URI mismatch"
**Solution**:
1. Check that Supabase callback URL is added to Google Cloud Console authorized redirect URIs
2. Format: `https://<your-project-ref>.supabase.co/auth/v1/callback`
3. For your project: `https://nvyebkzrrvmepbdejspr.supabase.co/auth/v1/callback`

### Issue: "Access blocked: This app's request is invalid"
**Solution**: Make sure you've configured OAuth consent screen in Google Cloud Console

### Issue: Google sign-in popup blocked
**Solution**: Allow popups for localhost in browser settings, or use redirect flow instead

---

## Next Steps

Once Google Auth is working:
1. ✅ Test sign up flow
2. ✅ Test sign in flow
3. ✅ Test sign out
4. ✅ Test session persistence (refresh page, still logged in)
5. ⏳ Add GitHub OAuth (optional)
6. ⏳ Add email verification flow
7. ⏳ Add password reset flow
8. ⏳ Deploy to production and update OAuth URLs

---

## Production Deployment

When deploying to production:

### Update Google Cloud Console:
- Add production domain to Authorized JavaScript origins
- Add production Supabase callback to Authorized redirect URIs

### Update Supabase:
- Add production domain to Site URL
- Add production domain to Redirect URLs

### Update .env:
- Keep same `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- No changes needed for auth!

---

## Files Reference

**Auth Implementation Files:**
- `src/lib/components/cloud/AuthModal.svelte` - Auth UI (lines 92-99, 172-213)
- `src/lib/api/AuthAPI.ts` - Auth API client (lines 181-192)
- `src/lib/stores/authStore.ts` - Auth state management
- `.env` - Supabase configuration (lines 5-7)

**Supabase Project:**
- URL: https://nvyebkzrrvmepbdejspr.supabase.co
- Dashboard: https://app.supabase.com/project/nvyebkzrrvmepbdejspr

---

**Status After Completion**: ✅ Google OAuth fully configured and working
