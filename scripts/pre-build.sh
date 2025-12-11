#!/bin/bash
# Pre-build script for Vercel
# This ensures Prisma Client is generated before building

set -e

echo "🔧 Running pre-build script..."

# Navigate to backend directory
cd backend

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "⚠️  WARNING: DATABASE_URL is not set!"
  echo "   Prisma generate will still work, but migrations may fail."
else
  echo "✅ DATABASE_URL is set"
fi

# Generate Prisma Client
echo "📦 Generating Prisma Client..."
npm run prisma:generate

# Check if generation was successful
if [ $? -eq 0 ]; then
  echo "✅ Prisma Client generated successfully"
else
  echo "❌ Prisma Client generation failed!"
  exit 1
fi

# Navigate back to root
cd ..

echo "✅ Pre-build script completed successfully"

