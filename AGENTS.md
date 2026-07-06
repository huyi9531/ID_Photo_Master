# 项目上下文

## 版本技术栈

- **Framework**: TanStack Start + TanStack Router
- **Build/Server**: Vite 8 + Cloudflare Vite Plugin
- **Deploy**: Cloudflare Workers + GitHub Actions
- **Core**: React 19
- **Language**: TypeScript 5
- **UI 组件**: shadcn/ui (基于 Radix UI)
- **Styling**: Tailwind CSS 4
- **支付/审核**: Creem 一次性支付、Prompt Moderation、Webhook
- **额度存储**: Cloudflare D1 原生 SQL，binding `DB`
- **AI 图像生成**: 火山方舟官方 Images API，模型 `doubao-seedream-4-5-251128`

## 项目说明

AIConductor PhotoID / 证照优化大师 — AI 驱动的专业证件照优化工具。用户上传正面人像照片，购买一次性额度后，选择背景色与服装，AI 一键生成标准证件照。

### 核心功能

1. **图片上传**: 支持拖拽和点击上传，接受 JPG/PNG 格式，最大 10MB
2. **背景颜色选择**: 白色、蓝色、红色三种标准证件照背景
3. **服装选择**: 通用/男款/女款服装选项
4. **Creem 一次性购买**: `$1.00` 购买 1 次生成额度，未使用额度 7 天内支持退款
5. **AI 合规拦截**: 生成前调用 Creem moderation，`deny`/`flag` 或审核失败均不扣额度
6. **AI 证件照生成**: 使用 `doubao-seedream-4-5-251128`，`3072x4096`，无水印

## 目录结构

```text
├── public/                 # 静态资源
├── scripts/                # 构建与启动脚本
├── src/
│   ├── routes/             # TanStack Start 文件路由
│   │   ├── __root.tsx      # 根文档、HeadContent、Scripts
│   │   ├── index.tsx       # 主页面、购买入口和额度状态
│   │   ├── success.tsx     # Creem 支付成功页
│   │   ├── privacy.tsx     # Privacy Policy
│   │   ├── terms.tsx       # Terms of Service
│   │   ├── acceptable-use.tsx # Acceptable Use Policy
│   │   ├── refund.tsx      # Refund Policy
│   │   ├── api/checkout.ts # POST /api/checkout
│   │   ├── api/credits.ts  # GET /api/credits
│   │   ├── api/optimize.ts # POST /api/optimize
│   │   └── api/webhooks/creem.ts # POST /api/webhooks/creem
│   ├── components/         # 业务组件与 shadcn/ui
│   ├── hooks/              # 自定义 Hooks
│   ├── lib/                # 工具库
│   │   ├── creem.server.ts # Creem checkout、moderation、webhook 签名，仅服务端导入
│   │   ├── db.server.ts    # Cloudflare D1 额度与审计 SQL，仅服务端导入
│   │   ├── seedream.server.ts # 官方火山方舟生图 API，仅服务端导入
│   │   ├── prompt.ts
│   │   └── utils.ts
│   ├── styles/globals.css  # 全局样式
│   ├── types/index.ts
│   └── router.tsx          # Router factory
├── vite.config.ts
├── wrangler.jsonc          # Cloudflare Workers 配置
├── migrations/             # Cloudflare D1 migrations
├── .github/workflows/      # GitHub Actions 自动部署
├── package.json
└── tsconfig.json
```

## 包管理规范

- 仅允许使用 pnpm，禁止 npm/yarn。
- 修改依赖后必须更新 `pnpm-lock.yaml`。
- 支付额度使用 Cloudflare D1 原生 SQL，不引入 Supabase、Postgres、S3 或 ORM 依赖。

常用命令：

```bash
pnpm install
pnpm run dev
pnpm run build
pnpm run start
pnpm run validate
pnpm run deploy
```

## TanStack Start 开发规范

- 页面使用 `src/routes` 文件路由，不创建 `src/app`、`pages` 或 Next.js route handler。
- 根文档在 `src/routes/__root.tsx` 中维护，必须保留 `<HeadContent />` 和 `<Scripts />`。
- 普通 React 组件不需要 `"use client"` / `"use server"` 指令。
- 服务端敏感逻辑必须放在 `.server.ts` 或 TanStack Start server route/server function 后面。
- 不要手动编辑 `src/routeTree.gen.ts`；通过 dev/build 自动生成。

## AI 图像生成 API 规范

- 使用火山方舟官方接口：`POST https://ark.cn-beijing.volces.com/api/v3/images/generations`。
- 仅在服务端读取密钥，优先使用环境变量 `ARK_API_KEY`，兼容 `VOLCENGINE_API_KEY` 和旧部署的 `IMAGE_API_KEY`。
- 固定模型：`doubao-seedream-4-5-251128`。
- 固定输出：`size: "3072x4096"`、`response_format: "url"`、`watermark: false`。
- 前端和外部调用仍使用 `POST /api/optimize`。
- Cloudflare 线上运行时推荐用 `pnpm wrangler secret put ARK_API_KEY` 设置 Worker Secret；已有 `IMAGE_API_KEY` 可作为兼容 fallback。
- GitHub Actions 部署凭据只放仓库 Secrets：`CLOUDFLARE_ACCOUNT_ID`、`CLOUDFLARE_API_TOKEN`。

## Creem / D1 商业化规范

- 品牌英文名：`AIConductor PhotoID`；中文名继续使用“证照优化大师”。
- 客服邮箱：`support@aiconductor.top`。
- 商品配置：`AIConductor PhotoID - Single Photo Credit`，`$1.00 USD`，`onetime`，`tax category: digital-goods-service`，`tax mode: exclusive`。
- 必需 Secrets：`CREEM_API_KEY`、`CREEM_WEBHOOK_SECRET`、`CREEM_PRODUCT_ID`、`CREEM_API_BASE`、`PUBLIC_SITE_URL`。
- `CREEM_API_BASE` 测试环境用 `https://test-api.creem.io`，生产环境用 `https://api.creem.io`。
- Cloudflare D1 binding 固定为 `DB`；迁移在 `migrations/0001_commerce.sql`。
- Webhook 路径：`POST /api/webhooks/creem`，使用 `creem-signature` + `CREEM_WEBHOOK_SECRET` 验签，只处理 `checkout.completed`，必须幂等。
- 首版不做登录、不做自动邮件发送；用户通过支付成功页和本地浏览器保存的 token 使用额度，丢失凭证时走客服邮箱人工处理。
- 审核页必须公开可访问：Pricing、Privacy Policy、Terms of Service、Acceptable Use Policy、Refund Policy、support email。

### POST /api/optimize

请求体：

```json
{
  "imageBase64": "data:image/...;base64,...",
  "prompt": "证件照生成 prompt",
  "purchaseToken": "purchase-token"
}
```

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

### 其他公开接口

- `POST /api/checkout`: 创建 Creem checkout，返回 `checkoutUrl` 和一次性 `token`。
- `GET /api/credits?token=...`: 查询额度状态，供首页和成功页使用。
- `POST /api/webhooks/creem`: Creem Webhook 入口。

## 验证要求

- 迁移路由、服务端边界、依赖或配置后运行：

```bash
pnpm run typecheck
pnpm run lint:build
pnpm run build
```

- 修改公开接口、环境变量或部署脚本时，同步更新 README/AGENTS。
