# Production Google Auth Setup - dawg-ai.com

**App URL**: https://www.dawg-ai.com/app
**Platform**: Railway
**Status**: 🔧 Configuration Required

---

## Current Deployment Info

**Domain**: www.dawg-ai.com
**Supabase Project**: nvyebkzrrvmepbdejspr.supabase.co
**Deployment**: Railway (auto-deploy from Git)

---

## Step 1: Update Google Cloud Console for Production

### 1.1 Open Existing OAuth Client
1. Go to: https://console.cloud.google.com
2. Select **DAWG AI** project
3. Go to **APIs & Services** > **Credentials**
4. Click your existing OAuth 2.0 Client ID

### 1.2 Add Production URLs
**Authorized JavaScript origins** - Add these:
- `https://www.dawg-ai.com`
- `https://dawg-ai.com` (without www)

**Authorized redirect URIs** - Add these:
- `https://nvyebkzrrvmepbdejspr.supabase.co/auth/v1/callback` (same for all environments)

**Keep existing localhost URLs** for development:
- `http://localhost:5173`
- `http://localhost:5174`
- `http://localhost:5176`

### 1.3 Save Changes
Click **Save** at the bottom

---

## Step 2: Update Supabase for Production

### 2.1 Open Supabase Dashboard
1. Go to: https://app.supabase.com
2. Select project: `nvyebkzrrvmepbdejspr`

### 2.2 Update Site URL
1. Go to **Authentication** > **URL Configuration**
2. Set **Site URL** to: `https://www.dawg-ai.com`

### 2.3 Update Redirect URLs
Add these to **Redirect URLs**:
- `https://www.dawg-ai.com/**`
- `https://dawg-ai.com/**`
- Keep localhost URLs for dev

### 2.4 Verify Google Provider is Enabled
1. Go to **Authentication** > **Providers**
2. Find **Google**
3. Ensure it's **Enabled** with your Client ID/Secret
4. If not configured yet:
   - Toggle **Enable Sign in with Google** ON
   - Paste **Client ID** from Google Cloud Console
   - Paste **Client Secret** from Google Cloud Console
   - Click **Save**

---

## Step 3: Verify Railway Environment Variables

Your Railway deployment should have these environment variables set:

```bash
# Supabase (Required for Auth)
VITE_SUPABASE_URL=https://nvyebkzrrvmepbdejspr.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52eWVia3pycnZtZXBiZGVqc3ByIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NTY0ODEsImV4cCI6MjA3NjEzMjQ4MX0.WHx6u5mgm-cKTLEYHo1nXp8DvYItZNE132hfrr1HPqI

# App Config
VITE_APP_NAME=DAWG AI
VITE_APP_VERSION=1.0.0

# Optional API Keys (for voice features, etc.)
VITE_DEEPGRAM_API_KEY=your_key_here
VITE_ANTHROPIC_API_KEY=your_key_here
VITE_ELEVENLABS_API_KEY=your_key_here
```

**To check/update Railway env vars**:
1. Go to Railway dashboard
2. Select your DAWG AI project
3. Go to **Variables** tab
4. Verify all `VITE_*` variables are set
5. If missing, add them and redeploy

---

## Step 4: Test Production Auth

### 4.1 Open Production App
Navigate to: https://www.dawg-ai.com/app

### 4.2 Test Email/Password Auth
1. Click **Sign In** or wherever auth modal triggers
2. Try creating an account with email/password
3. Check email for confirmation
4. Sign in after confirming

### 4.3 Test Google OAuth
1. Click **Continue with Google** button
2. Should redirect to Google sign-in
3. Authorize the app
4. Should redirect back to dawg-ai.com
5. You should be logged in
6. Check browser console for any errors

### 4.4 Verify Session Persistence
1. While logged in, refresh the page
2. You should stay logged in
3. Open DevTools > Application > Local Storage
4. Check for `supabase.auth.token`

### 4.5 Test Sign Out
1. Sign out
2. Verify session cleared
3. Try signing back in

---

## Step 5: Test Component Functionality

Once logged in, test all the components:

### Navigate to Test Page
**URL**: https://www.dawg-ai.com/app/test/components

If that page doesn't exist in production, you'll need to:
1. Deploy the test page we just created
2. Or test components on the main app interface

### What to Test
- [ ] All buttons clickable (atoms)
- [ ] Faders drag smoothly (atoms)
- [ ] Knobs rotate (atoms)
- [ ] Track controls work (molecules)
- [ ] Transport controls function (molecules)
- [ ] Mixer displays properly (organisms)
- [ ] Effects rack works (organisms)

---

## Troubleshooting

### Issue: "OAuth provider not configured"
**Check**:
1. Supabase dashboard → Google provider enabled
2. Client ID and Secret saved
3. Railway env vars include Supabase credentials

### Issue: "Redirect URI mismatch"
**Fix**:
1. Verify Google Cloud Console has exact redirect URI:
   `https://nvyebkzrrvmepbdejspr.supabase.co/auth/v1/callback`
2. Check for typos (https vs http, trailing slashes)
3. Make sure www.dawg-ai.com is in Authorized JavaScript origins

### Issue: "Access blocked: This app's request is invalid"
**Check**:
1. OAuth consent screen configured in Google Cloud Console
2. App not in "Testing" mode with restricted users
3. If in testing mode, add your Google account to test users

### Issue: Auth works locally but not in production
**Check**:
1. Railway environment variables match `.env` file
2. All `VITE_*` variables are set in Railway
3. Supabase redirect URLs include production domain
4. Browser console for CORS errors

### Issue: Components not rendering
**Check**:
1. Browser console for JavaScript errors
2. Network tab - are static assets loading?
3. Check build completed successfully on Railway
4. Verify production build includes all components

---

## Quick Railway Commands

```bash
# Check if Railway CLI is installed
railway --version

# Link to your project (one time)
railway link

# Check environment variables
railway variables

# View logs
railway logs

# Trigger manual deploy
railway up

# Check service status
railway status
```

---

## Production Deployment Checklist

- [ ] Google OAuth credentials include production domain
- [ ] Supabase Google provider enabled with credentials
- [ ] Supabase Site URL set to www.dawg-ai.com
- [ ] Supabase redirect URLs include production domain
- [ ] Railway environment variables all set
- [ ] Production build successful
- [ ] Auth modal opens on production
- [ ] Email/password signup works
- [ ] Google OAuth flow works
- [ ] Session persists on refresh
- [ ] All components render properly
- [ ] No console errors
- [ ] Mobile responsive

---

## Files to Update (if needed)

If you make changes locally and need to redeploy:

1. **Make changes** in local codebase
2. **Commit to Git**: `git add . && git commit -m "Update auth config"`
3. **Push to main**: `git push origin main`
4. **Railway auto-deploys** from Git (usually takes 2-3 minutes)
5. **Check deployment** in Railway dashboard

---

## Current Status

**What's Working**:
- ✅ App deployed at www.dawg-ai.com/app
- ✅ Supabase configured
- ✅ Design system components built

**Needs Configuration**:
- ⏳ Google OAuth for production domain
- ⏳ Test all component interactions on live site
- ⏳ Verify auth flow end-to-end

---

## Next Steps

1. **Configure Google OAuth** (Steps 1-2 above) - 5 minutes
2. **Test production auth** (Step 4) - 5 minutes
3. **Test all components** on live site - 10 minutes
4. **Report any issues** you find
5. **Iterate and fix** any bugs

---

**Once complete**: Production app fully functional with Google auth and all components tested! 🚀
