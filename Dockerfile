# Use lightweight Node.js 20 Alpine Linux base image
FROM node:20-alpine

# Set working directory inside the container
WORKDIR /usr/src/app

# Copy dependency manifests first to leverage Docker layer caching
COPY package*.json ./

# Install production dependencies only using npm ci for deterministic, clean builds
RUN npm ci --omit=dev

# Copy the rest of the application source code
COPY . .

# Run as non-root 'node' user for security hardening
USER node

# Document port 3000 exposure
EXPOSE 3000

# Specify container start command
CMD ["node", "app.js"]
