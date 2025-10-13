#!/bin/bash

# DAWG AI - Database Setup Script
# Sets up PostgreSQL database and runs Prisma migrations

set -e  # Exit on error

echo "🗄️  DAWG AI - Database Setup"
echo "================================"
echo ""

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL not found. Please install PostgreSQL first:"
    echo "   brew install postgresql@15  # macOS"
    echo "   sudo apt install postgresql  # Ubuntu/Debian"
    exit 1
fi

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "⚠️  DATABASE_URL not set. Using default local database..."
    export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/dawg_ai"
fi

echo "📍 Database URL: $DATABASE_URL"
echo ""

# Start PostgreSQL service if not running
echo "🔧 Checking PostgreSQL service..."
if command -v brew &> /dev/null; then
    # macOS with Homebrew
    if ! brew services list | grep -q "postgresql.*started"; then
        echo "   Starting PostgreSQL service..."
        brew services start postgresql@15
    else
        echo "   ✅ PostgreSQL is running"
    fi
elif command -v systemctl &> /dev/null; then
    # Linux with systemd
    if ! systemctl is-active --quiet postgresql; then
        echo "   Starting PostgreSQL service..."
        sudo systemctl start postgresql
    else
        echo "   ✅ PostgreSQL is running"
    fi
fi

echo ""

# Create database if it doesn't exist
echo "🏗️  Creating database (if not exists)..."
DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')
psql -U postgres -tc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep -q 1 || \
    psql -U postgres -c "CREATE DATABASE $DB_NAME"

echo "   ✅ Database ready: $DB_NAME"
echo ""

# Generate Prisma Client
echo "📦 Generating Prisma Client..."
pnpm prisma generate

echo ""

# Run migrations
echo "🔄 Running database migrations..."
pnpm prisma migrate dev --name init

echo ""

# Seed database (optional)
if [ -f "prisma/seed.ts" ]; then
    echo "🌱 Seeding database..."
    pnpm prisma db seed
    echo ""
fi

# Display database info
echo "================================"
echo "✅ Database setup complete!"
echo ""
echo "📊 Database Information:"
pnpm prisma db pull --print || true
echo ""

echo "🔗 Prisma Studio (Database GUI):"
echo "   pnpm prisma studio"
echo ""

echo "📝 Useful commands:"
echo "   pnpm prisma migrate dev      # Create new migration"
echo "   pnpm prisma studio           # Open database GUI"
echo "   pnpm prisma db push          # Push schema without migration"
echo "   pnpm prisma db seed          # Seed database"
echo ""
