# DAWG AI - Setup Guide

Complete guide to get DAWG AI up and running with all modules integrated.

## Prerequisites

- Node.js 20+ installed
- npm or yarn package manager
- A Supabase account (free tier is fine)

## Quick Setup (5 minutes)

### Step 1: Set Up Supabase

1. **Create Supabase Account**
   - Go to [supabase.com](https://supabase.com)
   - Sign up for free account

2. **Create New Project**
   - Click "New Project"
   - Name it "dawg-ai" or anything you like
   - Choose a database password (save it!)
   - Select a region close to you
   - Wait for project to finish setting up (~2 minutes)

3. **Get API Credentials**
   - Go to **Settings → API**
   - Copy these values:
     - `Project URL` (looks like `https://xxxxx.supabase.co`)
     - `anon public` key (starts with `eyJ...`)

4. **Set Up Database**
   - Go to **SQL Editor** in left sidebar
   - Click **+ New Query**
   - Copy entire contents of `backend/src/database/schema.sql`
   - Paste into query editor
   - Click **Run** (bottom right)
   - Should see "Success. No rows returned"

5. **Create Storage Bucket**
   - Go to **Storage** in left sidebar
   - Click **Create a new bucket**
   - Name: `audio-files`
   - Make it **Public**
   - Click **Create bucket**
   - Click on the bucket
   - Go to **Policies** tab
   - Add these policies:
     - **INSERT**: Allow authenticated users
     - **SELECT**: Allow public access
     - **DELETE**: Allow authenticated users

### Step 2: Configure Backend

1. **Create Backend Environment File**
   ```bash
   cd backend
   cp .env.example .env
   ```

2. **Edit `backend/.env`**
   ```env
   PORT=3000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173

   # Replace with your Supabase values:
   SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_KEY=eyJhbGc...your-anon-key-here
   ```

3. **Install Backend Dependencies**
   ```bash
   npm install
   ```

### Step 3: Configure Frontend

1. **Create Frontend Environment File**
   ```bash
   cd ..  # Back to root directory
   cp .env.example .env
   ```

2. **Edit `.env` (root directory)**
   ```env
   # Replace with your Supabase values:
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGc...your-anon-key-here
   VITE_API_URL=http://localhost:3000/api
   ```

3. **Install Frontend Dependencies**
   ```bash
   npm install
   ```

### Step 4: Run the Application

You need **two terminal windows**:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

You should see:
```
╔══════════════════════════════════════════╗
║     DAWG AI Backend Server Running       ║
╚══════════════════════════════════════════╝

🚀 Server:      http://localhost:3000
📚 API:         http://localhost:3000/api
💚 Health:      http://localhost:3000/health
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

You should see:
```
VITE v5.0.3  ready in 234 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### Step 5: Open the App

1. Open browser to: **http://localhost:5173**
2. You should see the DAWG AI landing page
3. Click **"Get Started Free"** to create an account
4. Create an account with email/password
5. You'll be redirected to the project manager
6. Click **"New Project"** to start creating!

## Verification Checklist

Make sure everything is working:

- [ ] Backend running on port 3000
- [ ] Frontend running on port 5173
- [ ] Can create an account
- [ ] Can sign in
- [ ] Can create a new project
- [ ] Can save a project
- [ ] Can see saved projects
- [ ] Audio engine initializes (check browser console)

## Troubleshooting

### "Missing Supabase environment variables"

**Problem:** Environment files not loaded

**Fix:**
```bash
# Make sure .env files exist:
ls -la backend/.env
ls -la .env

# Check they contain your Supabase credentials
cat backend/.env
cat .env
```

### "Failed to initialize audio engine"

**Problem:** Browser doesn't support Web Audio API or needs user interaction

**Fix:**
- Use Chrome, Edge, or Firefox (latest versions)
- Click anywhere on the page to enable audio
- Check browser console for specific errors

### Backend shows connection errors

**Problem:** Supabase credentials are wrong

**Fix:**
1. Double-check your `.env` files
2. Make sure you copied the full keys (they're long!)
3. URL should end with `.supabase.co`
4. Key should start with `eyJ`

### "relation 'projects' does not exist"

**Problem:** Database schema not created

**Fix:**
1. Go to Supabase SQL Editor
2. Run the schema from `backend/src/database/schema.sql`
3. Restart backend server

### Can't upload files

**Problem:** Storage bucket not configured

**Fix:**
1. Go to Supabase → Storage
2. Make sure `audio-files` bucket exists
3. Make sure it's set to **Public**
4. Check policies allow authenticated uploads

### CORS errors

**Problem:** Frontend URL not in backend CORS config

**Fix:**
- Make sure `FRONTEND_URL` in `backend/.env` is `http://localhost:5173`
- Restart backend server

## Production Deployment

### Backend (Railway, Heroku, or Vercel)

1. Push code to GitHub
2. Connect to deployment platform
3. Set environment variables:
   ```
   NODE_ENV=production
   PORT=3000
   SUPABASE_URL=your-url
   SUPABASE_KEY=your-key
   FRONTEND_URL=https://your-frontend-domain.com
   ```

### Frontend (Vercel, Netlify, or Cloudflare Pages)

1. Push code to GitHub
2. Connect to deployment platform
3. Set build command: `npm run build`
4. Set output directory: `build`
5. Set environment variables:
   ```
   VITE_SUPABASE_URL=your-url
   VITE_SUPABASE_ANON_KEY=your-key
   VITE_API_URL=https://your-backend-domain.com/api
   ```

## Development Tips

### Hot Reload

Both frontend and backend have hot reload:
- Frontend: Changes auto-reload in browser
- Backend: Changes auto-restart server

### Debug Mode

Enable detailed logging:

**Frontend:** Open browser DevTools (F12) → Console

**Backend:** Logs appear in terminal

### Reset Everything

If things get messed up:

```bash
# Stop both servers (Ctrl+C)

# Clear Supabase data
# Go to Supabase → Table Editor → Delete all projects

# Restart servers
cd backend && npm run dev
# In another terminal:
npm run dev
```

## Module Status

| Module | Status | Integrated |
|--------|--------|-----------|
| Module 1: Design System | ✅ Complete | ✅ Yes |
| Module 2: Audio Engine | ✅ Complete | ✅ Yes |
| Module 3: Track Manager | 🚧 In Progress | ⏳ Partial |
| Module 4: MIDI Editor | 🚧 In Progress | ⏳ Partial |
| Module 5: Effects | 🚧 In Progress | ⏳ Partial |
| Module 10: Cloud Storage | ✅ Complete | ✅ Yes |

## What Works Now

✅ User authentication (sign up, sign in, sign out)
✅ Create, save, load, delete projects
✅ Cloud storage via Supabase
✅ Audio engine initialization
✅ Transport controls (play, stop, pause)
✅ Tempo control
✅ File upload system
✅ Project auto-save (every 30 seconds)
✅ Keyboard shortcuts (Space = play/pause, Cmd+S = save)
✅ Beautiful glassmorphic UI

## What's Coming

⏳ Track creation and management
⏳ Audio clip recording and playback
⏳ MIDI editor
⏳ Effects processing
⏳ Mixing and automation
⏳ AI features (beat generation, vocal coach, auto-mastering)

## Getting Help

1. Check browser console for errors (F12)
2. Check backend terminal for errors
3. Check `backend/README.md` for API documentation
4. Check `API_CONTRACTS.md` for module integration details

## Next Steps

Once you have it running:

1. **Test the workflow:**
   - Create account
   - Create new project
   - Add tracks (when implemented)
   - Save project
   - Load project

2. **Explore the modules:**
   - `/daw` - Main DAW interface
   - `/` - Project manager
   - Design system components in `src/lib/design-system`

3. **Start developing:**
   - Add Module 3 (Track Manager) integration
   - Implement track recording
   - Add MIDI support
   - Build effects chain

Happy music making! 🎵
