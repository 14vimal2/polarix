# Stage 1: Build the application with Bun and Java
FROM oven/bun:1-alpine AS builder

RUN apk add --no-cache openjdk17-jre
WORKDIR /app
ARG API_URL

# Copy only the files needed for dependency installation
COPY package.json bun.lock ./
COPY frontend/package.json ./frontend/
COPY polarix_ui/package.json ./polarix_ui/

# Now, install dependencies. This layer will be cached as long as the lockfile and workspace package files don't change.
RUN bun install --frozen-lockfile

# Copy the rest of the source code
COPY frontend ./frontend
COPY polarix_ui ./polarix_ui

# --- Build the frontend application ---
WORKDIR /app/frontend

RUN bun run generate:api -- -i ${API_URL}
RUN bun run generate:zod -- ${API_URL} -o ./src/lib/schemas/generated.ts --export-schemas

RUN bun run build

# Stage 2: Create a slim production image
FROM oven/bun:1-alpine
WORKDIR /app

# Copy dependency manifests from the builder, including workspace manifests
COPY --from=builder /app/package.json /app/bun.lock ./
COPY --from=builder /app/frontend/package.json ./frontend/
COPY --from=builder /app/polarix_ui/package.json ./polarix_ui/

# Install only production dependencies
RUN bun install --production

# Copy the source code and the built application from the builder stage
COPY --from=builder /app/frontend ./frontend
COPY --from=builder /app/polarix_ui ./polarix_ui

WORKDIR /app/frontend
EXPOSE 5173
CMD ["bun", "run", "start"]