# Stage 1: Build
FROM node:22-slim AS builder

WORKDIR /app

# Install pnpm globally to bypass any npm bugs with Linux optional dependencies
RUN npm install -g pnpm@9

# Copy package configurations
COPY package.json ./
# Optional copy in case they exist locally to help with caching
COPY package-lock.json* pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install

# Copy all source files
COPY . .

# Build the Nuxt 4 application
# This generates the output in the .output directory
RUN pnpm run build:fast

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
