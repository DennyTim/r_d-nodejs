FROM node:18-alpine AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
RUN npm i -g pnpm && pnpm i --frozen-lockfile

# ---- dev stage ----
FROM deps AS dev
WORKDIR /app
COPY . .
EXPOSE 5173
CMD ["pnpm", "dev", "--host"]

# ---- prod stage (як було) ----
FROM deps AS builder
WORKDIR /app
COPY . .
RUN pnpm build

FROM nginx:1.25-alpine
WORKDIR /usr/share/nginx/html
COPY --from=builder /app/dist .
RUN printf 'server { listen 80; root /usr/share/nginx/html; location / { try_files $uri /index.html; } }' > /etc/nginx/conf.d/default.conf
EXPOSE 80