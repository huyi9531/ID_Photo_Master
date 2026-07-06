# 证照优化大师

基于 TanStack Start + Vite + Cloudflare Workers 的证件照优化工具。用户上传正面人像，购买一次性额度后，选择背景色和服装，后端先经 Creem moderation 审核，再调用火山方舟官方 Images API 生成标准证件照。

## 技术栈

- TanStack Start / TanStack Router
- React 19 + TypeScript 5
- Vite 8 + Cloudflare Vite Plugin
- Tailwind CSS 4 + shadcn/ui
- Creem 一次性支付、Prompt Moderation、Webhook
- Cloudflare D1 原生 SQL 额度表
- 火山方舟官方生图 API：`doubao-seedream-4-5-251128`

## 环境变量

服务端生图接口需要配置以下任一变量：

```bash
ARK_API_KEY=你的火山方舟 API Key
# 或
VOLCENGINE_API_KEY=你的火山方舟 API Key
# 兼容旧部署，也可用
IMAGE_API_KEY=你的火山方舟 API Key
```

Creem 支付、审核和 Webhook 需要配置：

```bash
CREEM_API_KEY=你的 Creem API Key
CREEM_WEBHOOK_SECRET=Creem Webhook Signing Secret
CREEM_PRODUCT_ID=Creem 一次性商品 ID
CREEM_API_BASE=https://test-api.creem.io
PUBLIC_SITE_URL=http://localhost:5000
```

密钥只在 `src/lib/seedream.server.ts` 中读取，不会进入客户端 bundle。
Creem 密钥只在 `src/lib/creem.server.ts` 中读取。D1 通过 Cloudflare binding `DB` 访问，不使用 Supabase、Postgres 或 ORM。

部署到 Cloudflare Workers 时，推荐把服务端密钥设置为 Worker Secret：

```bash
pnpm wrangler secret put ARK_API_KEY
pnpm wrangler secret put CREEM_API_KEY
pnpm wrangler secret put CREEM_WEBHOOK_SECRET
pnpm wrangler secret put CREEM_PRODUCT_ID
```

GitHub Actions 自动部署还需要在 GitHub repository secrets 中配置：

```text
CLOUDFLARE_ACCOUNT_ID
CLOUDFLARE_API_TOKEN
```

## 快速开始

```bash
pnpm install
pnpm run dev
```

默认开发地址：

```text
http://localhost:5000
```

## Creem 商品配置

Creem 后台创建一次性商品：

```text
Name: AIConductor PhotoID - Single Photo Credit
Price: 100
Currency: USD
Billing type: onetime
Tax category: digital-goods-service
Tax mode: exclusive
```

Webhook 地址：

```text
https://你的域名/api/webhooks/creem
```

只需要处理 `checkout.completed` 事件；服务端会使用 `creem-signature` 和 `CREEM_WEBHOOK_SECRET` 验签，并通过 `request_id` 幂等发放 1 次额度。

## Cloudflare D1

首次部署前创建 D1 数据库，并把返回的 `database_id` 写入 `wrangler.jsonc`：

```bash
pnpm wrangler d1 create id-photo-master
```

应用迁移：

```bash
pnpm wrangler d1 migrations apply id-photo-master --local
pnpm wrangler d1 migrations apply id-photo-master --remote
```

当前迁移在 `migrations/0001_commerce.sql`，包含 `purchases`、`generation_attempts`、`webhook_events` 三张表。

## 常用命令

```bash
pnpm run dev        # 启动 TanStack Start 开发服务器
pnpm run build      # 构建 Vite + Nitro 产物
pnpm run start      # 使用 vite preview 预览 Cloudflare Worker 构建
pnpm run typecheck  # TypeScript 检查
pnpm run lint:build # ESLint 检查
pnpm run validate   # 并行运行 typecheck 和 lint
pnpm run deploy     # 构建并部署到 Cloudflare Workers
```

## 项目结构

```text
src/
├── routes/
│   ├── __root.tsx              # 根文档、HeadContent、Scripts
│   ├── index.tsx               # 主页面、购买入口和额度状态
│   ├── success.tsx             # Creem 支付成功页
│   ├── privacy.tsx             # Privacy Policy
│   ├── terms.tsx               # Terms of Service
│   ├── acceptable-use.tsx      # Acceptable Use Policy
│   ├── refund.tsx              # Refund Policy
│   └── api/
│       ├── checkout.ts         # POST /api/checkout
│       ├── credits.ts          # GET /api/credits
│       ├── optimize.ts         # POST /api/optimize
│       └── webhooks/creem.ts   # POST /api/webhooks/creem
├── components/           # 业务组件与 shadcn/ui
├── hooks/
├── lib/
│   ├── creem.server.ts   # Creem checkout、moderation、webhook 签名
│   ├── db.server.ts      # Cloudflare D1 额度与审计 SQL
│   ├── seedream.server.ts # 火山方舟官方 API 调用
│   ├── clothing-data.ts
│   ├── prompt.ts
│   └── utils.ts
├── styles/globals.css
├── types/index.ts
└── router.tsx
```

## API

### POST /api/checkout

请求：

```json
{
  "email": "customer@example.com"
}
```

`email` 可为空。成功响应：

```json
{
  "checkoutUrl": "https://...",
  "token": "purchase-token"
}
```

### GET /api/credits?token=...

成功响应：

```json
{
  "token": "purchase-token",
  "status": "paid",
  "creditsRemaining": 1,
  "customerEmail": "customer@example.com",
  "paidAt": "2026-07-06T00:00:00.000Z",
  "usedAt": null
}
```

### POST /api/optimize

请求：

```json
{
  "imageBase64": "data:image/...;base64,...",
  "prompt": "证件照生成 prompt",
  "purchaseToken": "purchase-token"
}
```

没有已付款且未使用的额度时会拒绝生成。Creem moderation 返回 `deny` 或 `flag`、审核接口失败、Seedream 失败都不会扣除额度；只有生成成功才会原子消费 1 次额度。

成功响应：

```json
{
  "resultImageUrl": "https://..."
}
```

错误响应：

```json
{
  "error": "错误信息"
}
```

### POST /api/webhooks/creem

Creem Webhook 入口。服务端验证 `creem-signature`，只处理 `checkout.completed`，重复投递不会重复发放额度。

## 开发注意

- 使用 `src/routes` 文件路由，不使用 Next.js `src/app`。
- 不要手动修改 `src/routeTree.gen.ts`，它由 TanStack Start 自动生成。
- 服务端密钥、官方 API 调用、文件系统或其他敏感逻辑必须放在 `.server.ts` 或 server route 中。
- 新增依赖前先全局检索是否已有可复用实现。
- 支付额度使用 Cloudflare D1 原生 SQL，不引入 Supabase、Postgres、S3 或 ORM 依赖。
- Cloudflare Worker 名称在 `wrangler.jsonc` 的 `name` 字段中配置；当前为 `id-photo-master`。
