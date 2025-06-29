################# 1. deps (npm + pnpm) #################################
FROM node:20-alpine AS deps
WORKDIR /workspace
RUN corepack enable

# копіюємо lock-файли
COPY package*.json ./

RUN --mount=type=cache,target=/root/.npm  \
    npm ci --omit=dev

################# 2. backend prune (залишаємо prod-deps) ##############
FROM node:20-alpine AS backend
WORKDIR /workspace

COPY --from=deps /workspace/node_modules ./node_modules
COPY . .
RUN npm prune --omit=dev        # тільки тут випиляємо dev-deps

################# 3. runtime (tiny) ###################################
FROM alpine:3.19
RUN apk add --no-cache nodejs tini && \
    rm -rf /var/cache/apk/*

WORKDIR /app
COPY --from=backend /workspace/package.json ./package.json
COPY --from=backend /workspace/dist ./dist

ENV PORT=3000
ENV NODE_ENV=production
EXPOSE 3000
ENTRYPOINT ["/sbin/tini","--"]
CMD ["node","dist/server.mjs"]

