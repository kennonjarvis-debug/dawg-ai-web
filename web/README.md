# Jarvis AI - Web Application

Marketing website and dashboard for Jarvis AI automation platform.

## Features

- 🎨 Iron Man-inspired design (hot rod red, gold, arc reactor blue)
- ✨ Glassmorphic UI effects
- 🔐 Supabase authentication
- 📱 Responsive design
- ⚡ Built with Vite + React + TypeScript + Tailwind CSS

## Quick Start

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Add your Supabase credentials to .env

# Start development server
npm run dev
```

## Setup Supabase

1. Go to [supabase.com](https://supabase.com) and create a free project
2. In your project settings, find:
   - Project URL (VITE_SUPABASE_URL)
   - Anon/Public Key (VITE_SUPABASE_ANON_KEY)
3. Add these to your `.env` file

## Pages

- `/` - Landing page with pricing, features, demo
- `/login` - User login
- `/signup` - User registration
- `/dashboard` - Main application dashboard

## Deployment

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

Deploy to:
- Vercel
- Netlify
- GitHub Pages
- Or any static hosting

## Color Scheme

Inspired by Iron Man's suit:
- **Hot Rod Red**: Primary branding
- **Gold**: Accent colors
- **Arc Reactor Blue**: Interactive elements

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Supabase** - Auth & database
- **React Router** - Routing
- **Lucide Icons** - Icons

## License

MIT © Ben Kennon
