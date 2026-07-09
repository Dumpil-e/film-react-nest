#Сборка (Builder)
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build


#Продакшен (Runner)
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production

# Копируем скомпилированный код из builder
COPY --from=builder /app/dist ./dist

COPY --from=builder /app/public ./public

COPY package*.json ./
RUN npm ci --only=production

EXPOSE 3000
CMD ["node", "dist/main.js"]