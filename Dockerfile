# Stage 1: Build
FROM node:22-slim AS builder

WORKDIR /app

# Lockfile was generated with npm 11; node:22-slim ships npm 10 which rejects npm ci.
RUN npm install -g npm@11.6.2

# Copy package configurations (lockfile required for reproducible npm ci)
COPY package.json package-lock.json ./

# Install dependencies from the lockfile
RUN npm ci

# Copy all source files
COPY . .

# Build the Nuxt application
# This generates the output in the .output directory
RUN npm run build:fast

# Stage 2: Production
FROM node:22-slim AS runner

WORKDIR /app

# Essential environment variables for Nuxt
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

# Copy the build artifacts from the builder stage
# We only copy .output to keep the production image extremely small
COPY --from=builder /app/.output ./.output

EXPOSE 3000

# Start the Nuxt production server
CMD ["node", ".output/server/index.mjs"]
