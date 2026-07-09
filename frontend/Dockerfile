#Сборка статики
FROM node:20-alpine AS builder

WORKDIR /app

# Копируем файлы зависимостей
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci

RUN npm install @rollup/rollup-linux-x64-musl

# Копируем исходный код
COPY . .

# Собираем проект с переменными окружения
ARG VITE_API_URL
ARG VITE_CDN_URL
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_CDN_URL=$VITE_CDN_URL

RUN npm run build


#Этап 2: Контейнер-хранитель (Volume)
FROM alpine:latest

# Копируем собранный dist из builder
COPY --from=builder /app/dist /dist

# Команда, которая просто завершает контейнер с кодом успеха (0)
# Это нужно для docker-compose condition: service_completed_successfully
CMD ["true"]