FROM node:20-slim

# Install postgresql-client for pg_isready and OpenSSL for Prisma
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    postgresql-client \
    openssl \
    ca-certificates && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

# Install all dependencies (needed for build)
COPY package.json package-lock.json* ./
RUN npm ci

# Copy Prisma schema
COPY prisma ./prisma

# Clean any existing Prisma Client and regenerate for Debian
RUN rm -rf node_modules/.prisma 2>/dev/null || true
RUN npx prisma generate --schema=./prisma/schema.prisma

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Keep essential dev dependencies for seeding (ts-node and types)
# Don't prune ts-node, @types/node, and @types/bcrypt as they're needed for seeding
RUN npm prune --production --ignore-scripts || true && \
    npm install --save-dev ts-node@^10.9.2 @types/node@^20.10.6 @types/bcrypt@^5.0.2 typescript@^5.3.3 || true

# Expose port
EXPOSE 4000

# Entrypoint script to run migrations and start server
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["npm", "start"]

