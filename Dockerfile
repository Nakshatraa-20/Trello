FROM oven/bun:1.3.14

WORKDIR /app

# Copy the monorepo
COPY . .

# Install workspace dependencies
RUN bun install --frozen-lockfile --filter backend

# Generate Prisma Client
WORKDIR /app/packages/db
RUN DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder" bunx prisma generate

# Return to the backend directory
WORKDIR /app/apps/backend

# Start Express
CMD ["bun", "index.ts"]
