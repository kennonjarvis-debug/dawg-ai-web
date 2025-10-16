# DAWG AI Backend - Module 10: Cloud Storage & Backend

Backend API for DAWG AI web-based DAW with cloud storage, user authentication, and project management.

## Features

- **User Authentication**: Sign up, sign in, OAuth support (Google, GitHub)
- **Project Management**: CRUD operations for DAW projects
- **File Storage**: Audio file uploads with Supabase Storage
- **Rate Limiting**: Prevent abuse with configurable rate limits
- **Secure**: JWT-based authentication, Row Level Security (RLS)
- **Scalable**: Built with PostgreSQL and Supabase

## Tech Stack

- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL (via Supabase)
- **Storage**: Supabase Storage
- **Authentication**: Supabase Auth

## Prerequisites

1. **Node.js** 20+ and npm installed
2. **Supabase Account**: Sign up at [supabase.com](https://supabase.com)
3. **PostgreSQL Database**: Provided by Supabase

## Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Set Up Supabase

1. Create a new project at [app.supabase.com](https://app.supabase.com)
2. Go to **Settings → API** to get your keys:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

### 3. Configure Database

Run the schema SQL in Supabase SQL Editor:

```bash
# Copy contents of src/database/schema.sql
# Paste into Supabase → SQL Editor → New Query → Run
```

### 4. Set Up Storage Bucket

In Supabase Dashboard:

1. Go to **Storage**
2. Create a new bucket named `audio-files`
3. Set it to **Public**
4. Configure policies:
   - Allow authenticated users to upload
   - Allow public read access

### 5. Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your-anon-key-here
```

### 6. Run Development Server

```bash
npm run dev
```

Server will start at `http://localhost:3000`

### 7. Run in Production

```bash
npm run build
npm start
```

## API Documentation

Base URL: `http://localhost:3000/api`

### Authentication

All authenticated endpoints require `Authorization: Bearer <token>` header.

#### **POST** `/api/auth/signup`

Create a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "session": { ... }
  }
}
```

#### **POST** `/api/auth/signin`

Sign in with email and password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "session": {
      "access_token": "eyJ...",
      "refresh_token": "..."
    }
  }
}
```

#### **POST** `/api/auth/signout`

Sign out current user (requires auth).

**Response:**
```json
{
  "success": true,
  "message": "Signed out successfully"
}
```

### Projects

#### **GET** `/api/projects`

List all projects for authenticated user.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "My Project",
      "data": { ... },
      "created_at": "2025-10-15T...",
      "updated_at": "2025-10-15T..."
    }
  ]
}
```

#### **POST** `/api/projects`

Create a new project.

**Request:**
```json
{
  "name": "My New Project",
  "data": {
    "tracks": [],
    "tempo": 120,
    "timeSignature": [4, 4]
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": { ... }
}
```

#### **GET** `/api/projects/:id`

Get a specific project.

#### **PUT** `/api/projects/:id`

Update a project.

**Request:**
```json
{
  "name": "Updated Name",
  "data": { ... }
}
```

#### **DELETE** `/api/projects/:id`

Delete a project.

#### **POST** `/api/projects/:id/share`

Generate a share link for a project.

**Response:**
```json
{
  "success": true,
  "data": {
    "share_token": "abc123...",
    "share_url": "https://..."
  }
}
```

### Files

#### **POST** `/api/files/upload`

Upload an audio file.

**Request:** `multipart/form-data`
- `file`: Audio file (WAV, MP3, etc.)
- `projectId`: (optional) Project UUID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "url": "https://...",
    "filename": "audio.wav",
    "size": 1234567
  }
}
```

#### **GET** `/api/files`

List all files for user.

**Query Parameters:**
- `projectId`: Filter by project

#### **GET** `/api/files/:id`

Get a specific file.

#### **DELETE** `/api/files/:id`

Delete a file.

## Rate Limiting

Different endpoints have different rate limits:

- **General API**: 100 requests / 15 minutes
- **Authentication**: 5 requests / 15 minutes
- **File Upload**: 20 uploads / hour
- **Projects**: 200 requests / 15 minutes

## Error Handling

All errors follow this format:

```json
{
  "error": "Error Type",
  "message": "Detailed error message",
  "timestamp": "2025-10-15T..."
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `413` - File Too Large
- `429` - Too Many Requests
- `500` - Internal Server Error

## Database Schema

See `src/database/schema.sql` for the complete schema.

Main tables:
- `projects` - User projects
- `project_versions` - Version history
- `files` - Uploaded files metadata
- `collaborators` - Project collaborators
- `project_templates` - Project templates

## Security

- **Authentication**: JWT tokens via Supabase Auth
- **Authorization**: Row Level Security (RLS) on all tables
- **Rate Limiting**: Express Rate Limit
- **File Validation**: MIME type and size checks
- **CORS**: Configurable origin whitelist

## Development

### Project Structure

```
backend/
├── src/
│   ├── server.ts           # Main server
│   ├── routes/
│   │   ├── auth.ts         # Auth endpoints
│   │   ├── projects.ts     # Project endpoints
│   │   └── files.ts        # File endpoints
│   ├── middleware/
│   │   ├── authenticate.ts # Auth middleware
│   │   └── rateLimiter.ts  # Rate limiting
│   ├── types/
│   │   └── index.ts        # TypeScript types
│   └── database/
│       └── schema.sql      # Database schema
├── package.json
├── tsconfig.json
└── .env
```

### Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run lint` - Lint code

### Adding New Endpoints

1. Create route file in `src/routes/`
2. Define TypeScript types in `src/types/`
3. Import and mount in `src/server.ts`
4. Add tests in `src/tests/`
5. Update API documentation

## Deployment

### Environment Variables

Production environment variables:

```env
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://your-app.com
SUPABASE_URL=https://...
SUPABASE_KEY=...
```

### Deployment Platforms

#### Vercel

```bash
npm install -g vercel
vercel
```

#### Heroku

```bash
heroku create dawg-ai-backend
git push heroku main
```

#### Railway

```bash
railway init
railway up
```

## Monitoring

### Health Check

```bash
curl http://localhost:3000/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "...",
  "uptime": 12345,
  "version": "1.0.0"
}
```

### Logs

Production logs are written to stdout. Use your platform's logging service:

- **Vercel**: Vercel Dashboard → Functions → Logs
- **Heroku**: `heroku logs --tail`
- **Railway**: Railway Dashboard → Logs

## Troubleshooting

### Connection Issues

```
Error: Missing Supabase environment variables
```

**Solution**: Check `.env` file has `SUPABASE_URL` and `SUPABASE_KEY`

### Database Errors

```
Error: relation "projects" does not exist
```

**Solution**: Run database schema SQL in Supabase

### Upload Fails

```
Error: Upload failed: Bucket not found
```

**Solution**: Create `audio-files` bucket in Supabase Storage

### CORS Errors

```
Access to fetch blocked by CORS policy
```

**Solution**: Set `FRONTEND_URL` in `.env` to match your frontend URL

## Support

- **Issues**: GitHub Issues
- **Docs**: See `API_CONTRACTS.md` for detailed API contracts
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)

## License

MIT
