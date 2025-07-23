# ---------- shared deps ----------
FROM node:18-alpine AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
RUN npm i -g pnpm && pnpm i --frozen-lockfile

# ---------- dev stage ----------
FROM deps AS dev
WORKDIR /app
COPY . .
EXPOSE 3000
CMD ["pnpm", "start:dev"]

# ---------- prod stage ----------
FROM deps AS builder
WORKDIR /app
COPY . .
RUN pnpm build

FROM node:18-alpine AS prod
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY --from=deps /app/node_modules ./node_modules
EXPOSE 3000
CMD ["node", "dist/main.js"]