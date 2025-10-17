# Security Quick Start - DAWG AI

**Status**: ✅ Hardcoded secrets removed (2025-10-17)

---

## What Changed

### Before (❌ Insecure)
```toml
# netlify.toml
[build.environment]
  VITE_SUPABASE_URL = "https://nvyebkzrrvmepbdejspr.supabase.co"
  VITE_SUPABASE_ANON_KEY = "sb_publishable_DNVyXu..."
```

### After (✅ Secure)
```toml
# netlify.toml
[build.environment]
  NODE_VERSION = "22"
  # Secrets configured in Netlify dashboard
```

All secrets now live in:
- **Netlify**: Environment Variables (dashboard)
- **Vercel**: Environment Variables (dashboard)
- **Local Dev**: `.env.local` (not tracked in git)

---

## Required Environment Variables

### Supabase (Database & Auth)
```bash
VITE_SUPABASE_URL=https://nvyebkzrrvmepbdejspr.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_DNVyXuddwtKQFr2G1qEa-A_FClW-DtG
```

**Where to configure**:
- **Netlify**: Site Settings → Environment Variables → Add each
- **Vercel**: Project Settings → Environment Variables → Add each
- **Local**: Copy `.env.example` → `.env.local` and fill in values

### AI Services
```bash
ANTHROPIC_API_KEY=sk-ant-api03-...
DEEPGRAM_API_KEY=...
```

---

## Pre-Commit Secret Scan

A pre-commit hook now scans for secrets before allowing commits.

### Install (if not auto-installed)
```bash
npm install husky --save-dev
npx husky install
```

### Test
```bash
# This should fail (detecting a secret)
echo "ANTHROPIC_API_KEY=sk-ant-api03-test123" > test.txt
git add test.txt
git commit -m "test"  # ❌ Will be blocked

# Clean up
rm test.txt
```

### Bypass (ONLY for emergencies)
```bash
git commit --no-verify -m "emergency commit"
```
⚠️ **Use sparingly** - bypasses all security checks!

---

## Secrets Policy

### ✅ DO
- Store secrets in platform environment variables (Netlify, Vercel)
- Use `.env.local` for local development (never commit)
- Use `.env.example` to document required variables (without values)
- Rotate API keys every 90 days

### ❌ DON'T
- Never commit secrets to git (even private repos)
- Never put secrets in tracked config files (`.toml`, `.json`, `.yaml`)
- Never share secrets in Slack, email, or docs
- Never use production keys in development

---

## What If I Accidentally Committed a Secret?

### Immediate Steps
1. **Rotate the compromised key** immediately (Supabase/Anthropic/Deepgram dashboard)
2. **Remove from git history**:
   ```bash
   # Use BFG Repo-Cleaner or git-filter-repo
   git filter-repo --invert-paths --path path/to/secret/file
   git push --force
   ```
3. **Update environment variables** with new key
4. **Notify team** if applicable

### Prevention
- This is why we added the pre-commit hook!
- Always run `git diff` before committing

---

## Testing Deployments

### Netlify
1. Go to: https://app.netlify.com/sites/dawg-ai-web/settings/deploys#environment
2. Verify all 4 environment variables are set
3. Trigger redeploy: Deploys → Trigger deploy → Clear cache and deploy

### Vercel
1. Go to: https://vercel.com/your-org/dawg-ai-web/settings/environment-variables
2. Verify all 4 environment variables are set
3. Trigger redeploy: Deployments → Latest → Redeploy

### Local
```bash
# Create .env.local from example
cp .env.example .env.local

# Fill in actual values (get from Netlify/Vercel dashboard)
nano .env.local

# Test
npm run dev
# Visit http://localhost:5173 and verify Supabase connection
```

---

## Quick Reference

| Secret | Where to Get It | Scope |
|--------|-----------------|-------|
| `VITE_SUPABASE_URL` | Supabase Dashboard → Settings → API | Public (safe in client) |
| `VITE_SUPABASE_ANON_KEY` | Supabase Dashboard → Settings → API | Public (safe in client) |
| `ANTHROPIC_API_KEY` | Anthropic Console → API Keys | **Private** (server only) |
| `DEEPGRAM_API_KEY` | Deepgram Console → API Keys | **Private** (server only) |

**Note**: `VITE_*` prefix means these are exposed to the client. Supabase anon keys are designed to be public with Row Level Security (RLS) protecting data.

---

## Questions?

**Security Issue**: Email security@dawg-ai.com (if configured) or report in team Slack

**Created**: 2025-10-17
**Last Updated**: 2025-10-17
