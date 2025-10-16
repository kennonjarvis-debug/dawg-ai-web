# Development & Production Sync Guide

## Overview

Your Jarvis project has **automated deployment pipelines** that sync code from development to production. Here's how it works:

---

## Current Server Architecture

### **Development Environment** (Local)
- **Location**: Your local machine
- **Web App**: `http://localhost:5176` (Vite dev server)
- **Observatory**: `http://localhost:5173` (SvelteKit dev server)
- **API Server**: `http://localhost:3000` (Express)
- **Database**: Supabase (shared with production)
- **Purpose**: Active development, testing, debugging

### **Production Environment** (Railway)
- **Location**: Railway cloud hosting
- **Web App**: Deployed via Railway (static build)
- **Observatory**: Deployed via Railway
- **API Server**: Deployed via Railway (containers)
- **Database**: Supabase (same as dev)
- **Purpose**: Live application for end users

---

## Git Branch Strategy

Your CI/CD pipeline uses a **two-branch strategy**:

### **Branch Structure**
```
main (production) ──────► Deploy to Production (Railway)
  │
  └─ develop (staging) ──► Deploy to Staging
```

### **Current Status**
⚠️ **ISSUE**: You only have a `main` branch. The CI/CD pipeline expects both `main` and `develop`.

**Recommendation**: Create a `develop` branch for staging/testing:
```bash
git checkout -b develop
git push -u origin develop
```

---

## Automated Deployment Workflow

### **How Code Syncs Automatically**

1. **Make changes locally** → Edit code on your machine
2. **Commit to git** → `git add . && git commit -m "your message"`
3. **Push to GitHub** → `git push origin develop` or `git push origin main`
4. **GitHub Actions triggers** → Automatic CI/CD pipeline runs:
   - ✅ Runs linting
   - ✅ Runs type checks
   - ✅ Runs tests
   - ✅ Builds Docker images
   - ✅ Security scan
   - 🚀 **Deploys to Railway** (if all checks pass)

### **Deployment Triggers**

| Branch | Environment | Trigger | URL |
|--------|-------------|---------|-----|
| `develop` | Staging | Push to develop | staging.jarvis.example.com |
| `main` | Production | Push to main | jarvis.example.com |

---

## Key Files for Deployment

### **1. GitHub Actions Workflows**
- `.github/workflows/ci-cd.yml` - Main CI/CD pipeline
- `.github/workflows/railway-deploy.yml` - Railway deployment

### **2. Docker Configuration**
- `Dockerfile` - API server container
- `Dockerfile.orchestrator` - Orchestrator container
- `docker-compose.yml` - Local multi-service setup

### **3. Railway Configuration**
- `web/railway.json` - Web app deployment config
- `observatory/nixpacks.toml` - Observatory build config

---

## Environment Variables Sync

### **Critical Difference Between Dev & Prod**

| Variable | Development | Production |
|----------|-------------|------------|
| `VITE_SUPABASE_URL` | `http://localhost:5176` | `https://your-app.railway.app` |
| `VITE_OBSERVATORY_URL` | `http://localhost:5173` | `https://observatory.railway.app` |
| API URLs | `http://localhost:3000` | `https://api.railway.app` |

### **Where to Set Production Environment Variables**

1. **Railway Dashboard**: https://railway.app
2. Navigate to your project
3. Go to **Variables** tab
4. Add/update environment variables for each service

### **Required Production Secrets** (Already in GitHub Secrets)
- `RAILWAY_TOKEN` - For auto-deployment
- `ANTHROPIC_API_KEY` - Claude API
- `SUPABASE_URL` - Database URL (same for dev/prod)
- `SUPABASE_SERVICE_KEY` - Database admin key
- `SUPABASE_ANON_KEY` - Database public key
- `DISCORD_WEBHOOK_URL` - Notifications

---

## Database Sync (Supabase)

### **Good News**: You're using the **same Supabase instance** for dev and prod!

**Pros:**
- ✅ No database sync needed
- ✅ Changes immediately available everywhere
- ✅ Simpler setup

**Cons:**
- ⚠️ Dev changes affect production data
- ⚠️ Testing can corrupt live data

### **Recommendation**: Create Separate Supabase Projects

Create two Supabase projects:

1. **jarvis-dev** (Development)
   - For local testing
   - Use in `.env` files locally

2. **jarvis-prod** (Production)
   - For live users
   - Use in Railway environment variables

**Migration Strategy**:
```bash
# 1. Export current schema
pg_dump $SUPABASE_URL > schema.sql

# 2. Create new dev project in Supabase dashboard

# 3. Import schema to dev project
psql $DEV_SUPABASE_URL < schema.sql

# 4. Update local .env to use dev URL
SUPABASE_URL=<new-dev-project-url>
SUPABASE_ANON_KEY=<new-dev-anon-key>
SUPABASE_SERVICE_KEY=<new-dev-service-key>

# 5. Keep production Railway vars unchanged
```

---

## Sync Checklist

### **Before Every Deployment**

#### Development (Local)
```bash
# 1. Ensure all changes are committed
git status

# 2. Run tests locally
npm run test

# 3. Check TypeScript types
npm run typecheck

# 4. Build to verify no errors
npm run build

# 5. Push to develop branch first
git push origin develop
```

#### Staging Review
```bash
# 1. Wait for CI/CD to complete (check GitHub Actions)
# 2. Test on staging URL
# 3. Verify all features work
# 4. Check logs for errors
```

#### Production Deploy
```bash
# 1. Merge develop → main (via Pull Request)
git checkout main
git merge develop
git push origin main

# 2. GitHub Actions will auto-deploy to production
# 3. Monitor deployment in GitHub Actions tab
# 4. Test production URL
# 5. Check Railway logs
```

---

## Manual Sync (Emergency Override)

If you need to deploy without CI/CD:

### **Railway CLI Method**
```bash
# 1. Install Railway CLI
npm i -g @railway/cli

# 2. Login
railway login

# 3. Link to your project
railway link

# 4. Deploy manually
railway up
```

### **Direct Git Push to Railway**
```bash
# Add Railway remote
railway environment
git push railway main
```

---

## Current Issues & Fixes

### **Issue 1: Missing `develop` Branch**
```bash
git checkout -b develop
git push -u origin develop
```

### **Issue 2: Uncommitted Changes**
You have **many uncommitted changes**. Before syncing to production:
```bash
# Review changes
git status

# Add the OAuth fixes we just made
git add web/src/App.tsx
git add web/src/pages/LoginPage.tsx
git add web/.env.example

# Commit
git commit -m "fix: add OAuth callback route and configurable Observatory URL"

# Push to develop first
git push origin develop

# After testing, merge to main
git checkout main
git merge develop
git push origin main
```

### **Issue 3: OAuth Redirect URLs**
Update Supabase for both environments:

**Development**:
- `http://localhost:5176/auth/callback`

**Production**:
- `https://your-production-domain.railway.app/auth/callback`

---

## Monitoring Deployments

### **GitHub Actions Dashboard**
- URL: https://github.com/kennonjarvis-debug/dawg-ai-web/actions
- Check build status, logs, and errors

### **Railway Dashboard**
- URL: https://railway.app/dashboard
- View deployments, logs, and metrics

### **Supabase Logs**
- URL: https://supabase.com/dashboard
- Monitor database queries and auth events

---

## Quick Commands

### **Local Development**
```bash
# Start all services
npm run dev              # Main app
cd web && npm run dev    # Web frontend
cd observatory && npm run dev  # Observatory

# Run tests
npm run test
npm run typecheck

# Build
npm run build
```

### **Deployment**
```bash
# Deploy to staging
git push origin develop

# Deploy to production
git push origin main

# Check deployment status
gh run list
```

### **Emergency Rollback**
```bash
# In Railway dashboard:
# 1. Go to Deployments
# 2. Click on previous successful deployment
# 3. Click "Redeploy"
```

---

## Best Practices

1. **Never push directly to main** - Always test on develop first
2. **Use Pull Requests** - Review code before merging to main
3. **Test locally first** - Run tests and builds before pushing
4. **Separate databases** - Use different Supabase projects for dev/prod
5. **Monitor deployments** - Watch GitHub Actions and Railway logs
6. **Keep secrets secret** - Never commit `.env` files to git
7. **Document changes** - Write clear commit messages
8. **Version control** - Tag releases (`v1.0.0`, `v1.1.0`, etc.)

---

## Troubleshooting

### **Deployment Failed on GitHub Actions**
1. Check GitHub Actions logs
2. Look for failed step (lint, test, build, deploy)
3. Fix the error locally
4. Push again

### **Railway Deployment Stuck**
1. Check Railway dashboard logs
2. Verify environment variables are set
3. Check if build command succeeded
4. Try manual redeploy

### **Database Out of Sync**
1. Export schema: `pg_dump > schema.sql`
2. Review migrations in `/migrations`
3. Apply manually if needed
4. Consider using Supabase migrations CLI

### **Environment Variables Missing**
1. Check Railway dashboard → Variables
2. Verify all required vars are set
3. Update from `.env.example`
4. Restart services after updating

---

## Summary

**Your deployment is mostly automated!**

✅ **Push to GitHub** → GitHub Actions runs tests → Railway deploys automatically

**To keep dev and prod in sync:**
1. Work locally on `develop` branch
2. Push changes: `git push origin develop`
3. Test on staging
4. Merge to `main` when ready
5. Production auto-deploys

**The only manual sync needed:**
- Environment variables (set once in Railway)
- Supabase OAuth URLs (update in Supabase dashboard)

**Next steps:**
1. Create `develop` branch
2. Commit your current changes
3. Set up separate dev/prod Supabase projects (recommended)
4. Update Supabase OAuth redirect URLs
5. Test the deployment pipeline
