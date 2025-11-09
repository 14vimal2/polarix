# Stage 1: Build the application with Bun and Java
FROM oven/bun:1-alpine AS builder

RUN apk add --no-cache openjdk17-jre
WORKDIR /app
ARG API_URL

COPY package.json bun.lock ./
COPY frontend ./frontend
COPY polarix_ui ./polarix_ui

RUN bun install --frozen-lockfile

# --- Build the frontend application ---
WORKDIR /app/frontend

RUN bun run generate:api -- -i ${API_URL}
RUN bun run generate:zod -- ${API_URL} -o ./src/lib/schemas/generated.ts --export-schemas

RUN bun run build

# Stage 2: Create a slim production image
FROM oven/bun:1-alpine
WORKDIR /app

COPY --from=builder /app/package.json /app/bun.lock ./
COPY --from=builder /app/frontend ./frontend
COPY --from=builder /app/polarix_ui ./polarix_ui

RUN bun install --production

WORKDIR /app/frontend
EXPOSE 5173
CMD ["bun", "run", "start"]