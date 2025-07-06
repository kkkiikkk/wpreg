# Step 1: Build stage
FROM node:24-alpine AS builder

# Create app directory
WORKDIR /app

# Copy dependencies
COPY package*.json ./

# Install dependencies (only needed for build)
RUN npm ci

# Copy rest of the code
COPY . .

# Build the NestJS app
RUN npm run build

# Step 2: Run stage
FROM node:24-alpine

# Create app directory
WORKDIR /app

# Install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built output and other needed files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.env ./  # optional if using dotenv

# Expose port (default for NestJS)
EXPOSE 3000

# Start the app
CMD ["node", "dist/main.js"]
