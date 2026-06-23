# ===== Stage 1: Build =====
FROM node:20-alpine AS builder
WORKDIR /app

# 安装依赖（利用 Docker 层缓存）
COPY package.json package-lock.json ./
RUN npm ci

# 复制源码并构建
COPY . .
RUN npm run build

# ===== Stage 2: Production runtime =====
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV TZ=Asia/Shanghai

# 安全：用非 root 用户运行
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# 复制 standalone 输出（已包含精简的 node_modules）
COPY --from=builder /app/.next/standalone ./

# 复制静态资源到 standalone 对应的 .next/static
COPY --from=builder /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
