# Use minimal Node.js Alpine base image
FROM node:20-alpine

# Set working directory for the application
WORKDIR /usr/src/app

# Copy package manifests first to optimize Docker layer caching
COPY package*.json ./

# Install only production dependencies cleanly and reliably
RUN npm ci --omit=dev

# Copy the rest of the application files
COPY . .

# Set file ownership to non-root node user provided by the alpine base image
RUN chown -R node:node /usr/src/app

# Switch to non-root user for security best practices
USER node

# Expose service port
EXPOSE 3000

# Start the application using Node.js
CMD ["node", "app.js"]
