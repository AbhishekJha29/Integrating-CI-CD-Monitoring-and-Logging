# Use lightweight Node.js 20 Alpine Linux base image
FROM node:22-alpine

# Link published package in GitHub Container Registry (GHCR) to this repository
LABEL org.opencontainers.image.source="https://github.com/AbhishekJha29/Integrating-CI-CD-Monitoring-and-Logging"

# Set working directory inside the container
WORKDIR /usr/src/app

# Copy dependency manifests first to leverage Docker layer caching
COPY package*.json ./

# Install production dependencies only using npm ci for deterministic, clean builds
RUN npm ci --omit=dev

# Copy the rest of the application source code
COPY . .

# npm/npx are only needed to install dependencies, not to run the app.
# Removing them shrinks the image and removes npm's bundled packages
# (including the vulnerable tar) from what we ship.
RUN rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx

# Run as non-root 'node' user for security hardening
USER node

# Document port 3000 exposure
EXPOSE 3000

# Specify container start command
CMD ["node", "app.js"]
