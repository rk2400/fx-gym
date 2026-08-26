FROM node:20-alpine AS base
  # Only install the deps needed for building the app
  RUN apk add --no-cache python3 make g++
  WORKDIR /app

FROM base AS deps
  COPY package.json package-lock.json* ./
  RUN npm ci

FROM base AS builder
  COPY --from=deps /app/node_modules ./node_modules
  COPY . .
  ARG NEXT_PUBLIC_APP_URL
  ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
  RUN npm run build

FROM base AS runner
  WORKDIR /app

  ENV NODE_ENV=production

  COPY --from=deps /app/node_modules ./node_modules
  COPY --from=builder /app/public ./public
  COPY --from=builder /app/.next ./.next
  COPY --from=builder /app/next.config.mjs .
  COPY --from=builder /app/package.json ./package.json

  EXPOSE 3000

  CMD ["npm", "run", "start"]