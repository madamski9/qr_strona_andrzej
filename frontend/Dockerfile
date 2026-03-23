FROM node:22-alpine AS builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

FROM nginx:1.27-alpine
COPY --from=builder /app/frontend/dist/frontend/browser /usr/share/nginx/html

EXPOSE 80
