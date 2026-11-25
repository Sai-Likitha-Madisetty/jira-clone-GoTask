# syntax=docker/dockerfile:1
ARG TARGETPLATFORM

FROM --platform=$TARGETPLATFORM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN if [ -f package-lock.json ]; then npm ci --legacy-peer-deps; \
    elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm install --frozen-lockfile; \
    elif [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
    else npm install --legacy-peer-deps; fi

FROM --platform=$TARGETPLATFORM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_APPWRITE_ENDPOINT
ARG NEXT_PUBLIC_APPWRITE_PROJECT
ARG NEXT_PUBLIC_APPWRITE_DATABASE_ID
ARG NEXT_PUBLIC_APPWRITE_WORKSPACES_ID
ARG NEXT_PUBLIC_APPWRITE_MEMBERS_ID
ARG NEXT_PUBLIC_APPWRITE_PROJECTS_ID
ARG NEXT_PUBLIC_APPWRITE_TASKS_ID
ARG NEXT_PUBLIC_APPWRITE_IMAGES_BUCKET_ID

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_APPWRITE_ENDPOINT=$NEXT_PUBLIC_APPWRITE_ENDPOINT
ENV NEXT_PUBLIC_APPWRITE_PROJECT=$NEXT_PUBLIC_APPWRITE_PROJECT
ENV NEXT_PUBLIC_APPWRITE_DATABASE_ID=$NEXT_PUBLIC_APPWRITE_DATABASE_ID
ENV NEXT_PUBLIC_APPWRITE_WORKSPACES_ID=$NEXT_PUBLIC_APPWRITE_WORKSPACES_ID
ENV NEXT_PUBLIC_APPWRITE_MEMBERS_ID=$NEXT_PUBLIC_APPWRITE_MEMBERS_ID
ENV NEXT_PUBLIC_APPWRITE_PROJECTS_ID=$NEXT_PUBLIC_APPWRITE_PROJECTS_ID
ENV NEXT_PUBLIC_APPWRITE_TASKS_ID=$NEXT_PUBLIC_APPWRITE_TASKS_ID
ENV NEXT_PUBLIC_APPWRITE_IMAGES_BUCKET_ID=$NEXT_PUBLIC_APPWRITE_IMAGES_BUCKET_ID

RUN npm run build

FROM --platform=$TARGETPLATFORM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="3.26.155.14"

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "const http = require('http'); http.get('http://127.0.0.1:3000/api/health', (r) => process.exit(r.statusCode < 500 ? 0 : 1)).on('error', () => process.exit(1));"

CMD ["node", "server.js"]
