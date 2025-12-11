#!/bin/sh
set -e

echo "Waiting for database to be ready..."
# Wait for PostgreSQL to be ready
until pg_isready -h db -U ${POSTGRES_USER:-postgres} > /dev/null 2>&1; do
  echo "Database is unavailable - sleeping"
  sleep 1
done

echo "Running database migrations..."
# Try migrate deploy first, if it fails, use db push as fallback
if npx prisma migrate deploy 2>&1; then
  echo "Migrations applied successfully."
  MIGRATION_OK=1
else
  echo "Migration deploy failed, trying db push..."
  if npx prisma db push --accept-data-loss 2>&1; then
    echo "Database schema pushed successfully."
    MIGRATION_OK=1
  else
    echo "Database setup failed, but continuing..."
    MIGRATION_OK=0
  fi
fi

echo "Seeding database (if needed)..."
# Only seed if migrations were successful
if [ "$MIGRATION_OK" = "1" ]; then
  # Try using local ts-node first, fallback to npx
  if [ -f "./node_modules/.bin/ts-node" ]; then
    ./node_modules/.bin/ts-node --project tsconfig.seed.json prisma/seed.ts || echo "Seed completed or skipped"
  else
    npx ts-node --project tsconfig.seed.json prisma/seed.ts || echo "Seed completed or skipped"
  fi
else
  echo "Skipping seed due to migration failure"
fi

echo "Testing Cloudinary connection (if configured)..."
# Test Cloudinary if credentials are provided
if [ -n "$CLOUDINARY_CLOUD_NAME" ] && [ -n "$CLOUDINARY_API_KEY" ] && [ -n "$CLOUDINARY_API_SECRET" ]; then
  if [ -f "./node_modules/.bin/ts-node" ]; then
    ./node_modules/.bin/ts-node -e "
      import { testCloudinaryConnection } from './src/utils/cloudinaryTest';
      testCloudinaryConnection().then(success => {
        process.exit(success ? 0 : 1);
      }).catch(err => {
        console.error('Cloudinary test error:', err);
        process.exit(1);
      });
    " || echo "⚠️  Cloudinary test failed, but continuing..."
  else
    npx ts-node -e "
      import { testCloudinaryConnection } from './src/utils/cloudinaryTest';
      testCloudinaryConnection().then(success => {
        process.exit(success ? 0 : 1);
      }).catch(err => {
        console.error('Cloudinary test error:', err);
        process.exit(1);
      });
    " || echo "⚠️  Cloudinary test failed, but continuing..."
  fi
else
  echo "Cloudinary not configured (using local storage)"
fi

echo "Starting server..."
exec "$@"

