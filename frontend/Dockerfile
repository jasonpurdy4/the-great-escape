# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (needed for build)
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Build the app (CI=false to allow warnings)
RUN CI=false GENERATE_SOURCEMAP=false npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Install serve globally
RUN npm install -g serve@14.2.5

# Copy built files from builder stage
COPY --from=builder /app/build ./build

# Expose port (Railway uses $PORT)
EXPOSE 8080

# Start command (use array syntax for proper signal handling)
CMD ["sh", "-c", "serve -s build -l $PORT"]
