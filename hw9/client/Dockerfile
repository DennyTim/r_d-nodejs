FROM node:18-alpine AS dev
WORKDIR /app

COPY package.json pnpm-lock.yaml* ./
RUN npm install

COPY . .

EXPOSE 5173
CMD ["npx", "vite", "--host"]
