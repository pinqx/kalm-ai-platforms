# Use Node.js 18 Alpine for smaller image size
FROM node:18-alpine

# Set working directory to server
WORKDIR /app/server

# Copy server package files first for better layer caching
COPY server/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy server application code
COPY server ./

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Change ownership
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js || exit 1

# Start the server directly
CMD ["node", "server.js"] 