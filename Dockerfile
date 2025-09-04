# Multi-stage Dockerfile for different interfaces

# Base stage with common dependencies
FROM node:18-alpine AS base
WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy built application
COPY dist/ ./dist/

# Create database directory
RUN mkdir -p /app/database

# CLI interface
FROM base AS cli
COPY dist/interfaces/cli ./cli
COPY dist/core ./core
COPY dist/shared ./shared
COPY dist/types ./types

# Make CLI executable
RUN chmod +x cli/index.js

# Set up volume for database
VOLUME ["/app/database"]

# Default command
ENTRYPOINT ["node", "cli/index.js"]

# Web interface
FROM base AS web
COPY dist/interfaces/web ./web
COPY dist/core ./core
COPY dist/shared ./shared
COPY dist/types ./types

# Copy static files if any
COPY src/interfaces/web/public ./web/public
COPY src/interfaces/web/views ./web/views

# Expose port
EXPOSE 3000

# Set up volume for database
VOLUME ["/app/database"]

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => process.exit(res.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

# Start command
CMD ["node", "web/server.js"]

# MCP interface
FROM base AS mcp
COPY dist/interfaces/mcp ./mcp
COPY dist/core ./core
COPY dist/shared ./shared
COPY dist/types ./types

# Expose port for MCP server
EXPOSE 8080

# Set up volume for database
VOLUME ["/app/database"]

# Start command
CMD ["node", "mcp/index.js"]

# Development stage
FROM node:18-alpine AS development
WORKDIR /app

# Install all dependencies (including dev)
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Default to development
CMD ["npm", "run", "dev:web"]
