# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage - serve with Node (hoặc có thể dùng nginx)
FROM node:20-alpine
WORKDIR /app
RUN npm install -g vite
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
RUN npm ci --only=production

EXPOSE 5173

# Serve static files
CMD ["npx", "vite", "preview", "--host", "0.0.0.0", "--port", "5173"]
