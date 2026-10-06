# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --silent

COPY . .
RUN npm run build

# ── Stage 2: Serve with Caddy ─────────────────────────────────────────────────
FROM caddy:2-alpine

# Copy built React assets
COPY --from=build /app/dist /srv

# Caddy config to serve static files with SPA fallback
COPY Caddyfile.frontend /etc/caddy/Caddyfile

EXPOSE 80
