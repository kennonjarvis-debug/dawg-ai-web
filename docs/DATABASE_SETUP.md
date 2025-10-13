# DAWG AI - Database Setup Guide

Complete guide for setting up PostgreSQL with Prisma ORM.

## Prerequisites

### 1. Install PostgreSQL

**macOS (Homebrew)**:
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Ubuntu/Debian**:
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Windows**:
Download from [https://www.postgresql.org/download/windows/](https://www.postgresql.org/download/windows/)

### 2. Verify Installation

```bash
psql --version
# Should output: psql (PostgreSQL) 15.x
```

## Quick Setup

### Automated Setup (Recommended)

```bash
chmod +x scripts/setup-database.sh
./scripts/setup-database.sh
```

This script will:
1. ✅ Check PostgreSQL installation
2. ✅ Start PostgreSQL service
3. ✅ Create database
4. ✅ Generate Prisma Client
5. ✅ Run migrations
6. ✅ Seed database (optional)

## Manual Setup

### Step 1: Configure Environment Variables

Create `.env.local` in project root:

```bash
# Development (Local PostgreSQL)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/dawg_ai"

# Production (Example with connection pooling)
DATABASE_URL="postgresql://user:password@host:5432/dawg_ai?pgbouncer=true&connection_limit=1"
```

### Step 2: Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE dawg_ai;

# Exit
\q
```

### Step 3: Generate Prisma Client

```bash
pnpm prisma generate
```

This creates the TypeScript client in `node_modules/@prisma/client`.

### Step 4: Run Migrations

```bash
# Create and apply migration
pnpm prisma migrate dev --name init

# Or push schema without migration (development only)
pnpm prisma db push
```

### Step 5: Seed Database (Optional)

```bash
pnpm prisma db seed
```

## Database Schema

See `prisma/schema.prisma` for complete schema definition.

### Key Models

#### User Management
- **User** - User accounts
- **Session** - Authentication sessions
- **Account** - OAuth providers (NextAuth.js)

#### Project Management
- **Project** - DAW projects
- **Track** - Audio/MIDI tracks
- **Recording** - Audio recordings
- **TrackEffect** - Effects on tracks
- **SendBus** - Auxiliary effect buses

#### Vocal Profile
- **VocalProfile** - User vocal characteristics
- **VocalMetric** - Vocal analysis over time
- **PracticeSession** - Practice tracking

#### AI Journey System
- **Journey** - Adaptive learning journeys
- **JourneyStep** - Individual journey steps
- **UserAchievement** - Unlocked achievements

## Prisma Commands

### Development

```bash
# Generate Prisma Client (after schema changes)
pnpm prisma generate

# Create migration
pnpm prisma migrate dev --name <migration-name>

# Push schema without migration (dev only)
pnpm prisma db push

# Reset database (WARNING: deletes all data)
pnpm prisma migrate reset

# Seed database
pnpm prisma db seed
```

### Database Studio (GUI)

```bash
# Open Prisma Studio
pnpm prisma studio

# Access at: http://localhost:5555
```

### Production

```bash
# Apply migrations
pnpm prisma migrate deploy

# Generate client
pnpm prisma generate
```

## Using Prisma in Code

### Initialize Client

```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query', 'error', 'warn'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

### Example Queries

#### Create Project

```typescript
const project = await prisma.project.create({
  data: {
    name: 'My Song',
    userId: user.id,
    bpm: 120,
    tracks: {
      create: [
        {
          type: 'audio',
          name: 'Lead Vocals',
          color: '#FF6B6B',
        },
      ],
    },
  },
  include: {
    tracks: true,
  },
});
```

#### Get User with Projects

```typescript
const user = await prisma.user.findUnique({
  where: { id: userId },
  include: {
    projects: {
      include: {
        tracks: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    },
  },
});
```

#### Update Track

```typescript
await prisma.track.update({
  where: { id: trackId },
  data: {
    volume: -6,
    pan: 0.5,
    updatedAt: new Date(),
  },
});
```

#### Create Recording with S3 URL

```typescript
const recording = await prisma.recording.create({
  data: {
    projectId,
    trackId,
    name: 'Take 1',
    duration: 180.5,
    storageUrl: 's3://dawg-ai/recordings/abc123.wav',
    format: 'wav',
    size: 5242880, // bytes
  },
});
```

## Migration from In-Memory Store

### Current Backend (In-Memory)

The current backend API (`apps/backend/src/services/track-manager.ts`) uses an in-memory Map:

```typescript
private tracks = new Map<string, Track>();
```

### Migrating to Prisma

#### 1. Update Track Manager Service

```typescript
// apps/backend/src/services/track-manager.ts
import { prisma } from '@/lib/prisma';

export class TrackManager {
  async createTrack(projectId: string, data: CreateTrackInput) {
    return prisma.track.create({
      data: {
        projectId,
        ...data,
      },
    });
  }

  async getAllTracks(projectId: string) {
    return prisma.track.findMany({
      where: { projectId },
      orderBy: { order: 'asc' },
    });
  }

  async updateTrack(id: string, updates: Partial<Track>) {
    return prisma.track.update({
      where: { id },
      data: {
        ...updates,
        updatedAt: new Date(),
      },
    });
  }

  async deleteTrack(id: string) {
    return prisma.track.delete({
      where: { id },
    });
  }
}
```

#### 2. Update API Routes

```typescript
// apps/backend/src/routes/tracks.ts
import { prisma } from '@/lib/prisma';

router.get('/tracks', async (req, res) => {
  const projectId = req.query.projectId as string;

  const tracks = await prisma.track.findMany({
    where: { projectId },
    orderBy: { order: 'asc' },
  });

  res.json({
    success: true,
    data: tracks,
    count: tracks.length,
  });
});
```

#### 3. Add Project Context Middleware

```typescript
// apps/backend/src/middleware/project.ts
export async function requireProject(req, res, next) {
  const projectId = req.query.projectId || req.body.projectId;

  if (!projectId) {
    return res.status(400).json({
      success: false,
      error: 'Project ID required',
    });
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    return res.status(404).json({
      success: false,
      error: 'Project not found',
    });
  }

  req.project = project;
  next();
}
```

## Connection Pooling

For production, use connection pooling with PgBouncer or Prisma Accelerate.

### PgBouncer Example

```bash
DATABASE_URL="postgresql://user:password@host:6432/dawg_ai?pgbouncer=true"
```

### Prisma Connection Pool

```typescript
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: ['error', 'warn'],
  // Connection pool settings
  connectionLimit: 10,
});
```

## Troubleshooting

### Issue: "Can't reach database server"

**Solution**:
```bash
# Check if PostgreSQL is running
brew services list | grep postgresql  # macOS
sudo systemctl status postgresql      # Linux

# Start if not running
brew services start postgresql@15     # macOS
sudo systemctl start postgresql       # Linux
```

### Issue: "Authentication failed"

**Solution**:
```bash
# Reset password
psql -U postgres
ALTER USER postgres WITH PASSWORD 'newpassword';
\q

# Update .env.local with new password
```

### Issue: "Database does not exist"

**Solution**:
```bash
psql -U postgres -c "CREATE DATABASE dawg_ai"
```

### Issue: "Migration failed"

**Solution**:
```bash
# Reset and try again
pnpm prisma migrate reset
pnpm prisma migrate dev --name init
```

## Production Checklist

- [ ] Environment variables configured
- [ ] Connection pooling enabled
- [ ] SSL enabled for production database
- [ ] Backups configured
- [ ] Migrations applied
- [ ] Database monitoring setup
- [ ] Connection limits configured
- [ ] Query performance optimized

## Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)

---

**Last Updated**: 2025-10-13
