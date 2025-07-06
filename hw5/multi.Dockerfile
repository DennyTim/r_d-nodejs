################# 1. deps #################################
FROM node:20-alpine AS deps
WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./
COPY tsconfig.build.json ./
COPY nest-cli.json ./

RUN npm install --prefer-offline --no-audit

################# 2. build ################################
FROM deps AS builder
WORKDIR /app

COPY . .

RUN npm run build

################# 3. backend — prod-only node_modules #####
FROM deps AS backend
WORKDIR /app
COPY --from=builder /app/build ./build
COPY package*.json ./
RUN npm prune --omit=dev  # лишає тільки production-залежності

################# 4. runtime ################################
FROM alpine:3.19

# Додаємо лише потрібне: nodejs + tini
RUN apk add --no-cache nodejs tini && \
    rm -rf /var/cache/apk/* /tmp/* /usr/lib/node_modules/npm/man /usr/share/doc

WORKDIR /app

# Копіюємо лише runtime-необхідне
COPY --from=builder /app/build ./build

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "build/server.mjs"]
