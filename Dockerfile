# ---- Build Stage ----
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Copy package files first for better caching
COPY package.json yarn.lock* ./

RUN yarn install

# Copy source code
COPY . .

# Build arguments for environment variables at build time
ARG NEXT_PUBLIC_API_URL=http://167.172.90.235:4009
ARG NEXT_PUBLIC_WS_URL=ws://167.172.90.235:4009

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_WS_URL=$NEXT_PUBLIC_WS_URL

# Build the Next.js app
RUN yarn build

# ---- Production Stage ----
FROM node:20-alpine AS production

WORKDIR /usr/src/app

# Copy package files
COPY package.json yarn.lock* ./

# Install only production dependencies
RUN yarn install --production

# Copy built app from builder
COPY --from=builder /usr/src/app/.next ./.next
COPY --from=builder /usr/src/app/public ./public
COPY --from=builder /usr/src/app/next.config.mjs ./

EXPOSE 5010

ENV PORT=5010
ENV HOSTNAME="0.0.0.0"

CMD ["yarn", "start", "-p", "5010"]
