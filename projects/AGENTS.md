# 项目上下文

### 版本技术栈

- **Framework**: Next.js 16 (App Router)
- **Core**: React 19
- **Language**: TypeScript 5
- **UI 组件**: shadcn/ui (基于 Radix UI)
- **Styling**: Tailwind CSS 4
- **AI 图像生成**: coze-coding-dev-sdk (SeeDream v4.5)

## 项目说明

证照优化大师 — AI 驱动的专业证件照优化工具。用户上传正面人像照片，选择背景色与服装，AI 一键生成标准证件照。

### 核心功能

1. **图片上传**: 支持拖拽和点击上传，接受 JPG/PNG 格式，最大 10MB
2. **背景颜色选择**: 白色、蓝色、红色三种标准证件照背景
3. **服装选择**: 通用/男款/女款共 22 种服装选项
4. **AI 证件照生成**: 使用 SeeDream v4.5 模型 (doubao-seedream-4-5-251128)，2K 分辨率 3:4 画幅，无水印

## 目录结构

```
├── public/                 # 静态资源
├── scripts/                # 构建与启动脚本
│   ├── build.sh            # 构建脚本
│   ├── dev.sh              # 开发环境启动脚本
│   ├── prepare.sh          # 预处理脚本
│   └── start.sh            # 生产环境启动脚本
├── src/
│   ├── app/                # 页面路由与布局
│   │   ├── api/optimize/   # 证件照优化 API
│   │   │   └── route.ts    # POST /api/optimize
│   │   ├── globals.css     # 全局样式 (Tailwind CSS 4)
│   │   ├── layout.tsx      # 根布局
│   │   └── page.tsx        # 主页面
│   ├── components/         # 业务组件
│   │   ├── BackgroundSelector.tsx  # 背景颜色选择
│   │   ├── ClothingSelector.tsx    # 服装选择
│   │   ├── Footer.tsx              # 页脚
│   │   ├── GlobalNav.tsx           # 顶部导航
│   │   ├── ImageUploader.tsx       # 图片上传
│   │   ├── ResultDisplay.tsx       # 结果展示与下载
│   │   └── ui/                     # Shadcn UI 组件库
│   ├── hooks/              # 自定义 Hooks
│   ├── lib/                # 工具库
│   │   ├── clothing-data.ts  # 服装与背景数据
│   │   ├── coze.ts           # AI 图像生成 (coze-coding-dev-sdk)
│   │   ├── prompt.ts         # Prompt 组装
│   │   └── utils.ts          # 通用工具函数 (cn)
│   ├── types/              # 类型定义
│   │   └── index.ts
│   └── server.ts           # 自定义服务端入口
├── next.config.ts          # Next.js 配置
├── package.json            # 项目依赖管理
└── tsconfig.json           # TypeScript 配置
```

- 项目文件（如 app 目录、pages 目录、components 等）默认初始化到 `src/` 目录下。

## 包管理规范

**仅允许使用 pnpm** 作为包管理器，**严禁使用 npm 或 yarn**。
**常用命令**：
- 安装依赖：`pnpm add <package>`
- 安装开发依赖：`pnpm add -D <package>`
- 安装所有依赖：`pnpm install`
- 移除依赖：`pnpm remove <package>`

## 开发规范

### 编码规范

- 默认按 TypeScript `strict` 心智写代码；优先复用当前作用域已声明的变量、函数、类型和导入，禁止引用未声明标识符或拼错变量名。
- 禁止隐式 `any` 和 `as any`；函数参数、返回值、解构项、事件对象、`catch` 错误在使用前应有明确类型或先完成类型收窄，并清理未使用的变量和导入。

### next.config 配置规范

- 配置的路径不要写死绝对路径，必须使用 path.resolve(__dirname, ...)、import.meta.dirname 或 process.cwd() 动态拼接。

### Hydration 问题防范

1. 严禁在 JSX 渲染逻辑中直接使用 typeof window、Date.now()、Math.random() 等动态数据。**必须使用 'use client' 并配合 useEffect + useState 确保动态内容仅在客户端挂载后渲染**；同时严禁非法 HTML 嵌套（如 <p> 嵌套 <div>）。
2. **禁止使用 head 标签**，优先使用 metadata，详见文档：https://nextjs.org/docs/app/api-reference/functions/generate-metadata
   1. 三方 CSS、字体等资源可在 `globals.css` 中顶部通过 `@import` 引入或使用 next/font
   2. preload, preconnect, dns-prefetch 通过 ReactDOM 的 preload、preconnect、dns-prefetch 方法引入
   3. json-ld 可阅读 https://nextjs.org/docs/app/guides/json-ld

### AI 图像生成 API 使用规范

- 使用 `coze-coding-dev-sdk` 的 `ImageGenerationClient`，仅在后端代码中使用
- 模型: `doubao-seedream-4-5-251128` (SeeDream v4.5)
- 分辨率: `3072x4096` (2K, 3:4 画幅)
- 水印: `watermark: false`
- 必须使用 `HeaderUtils.extractForwardHeaders(request.headers)` 传递请求头
- image 参数支持 base64 data URL 格式

## UI 设计与组件规范 (UI & Styling Standards)

- 模板默认预装核心组件库 `shadcn/ui`，位于`src/components/ui/`目录下
- 业务组件位于 `src/components/` 目录下
- 设计风格参照 Apple 官网风格：摄影优先、简洁布局、单蓝色主色调、Inter 字体
- 颜色体系：
  - 主色: #0071E3 (Action Blue)
  - 暗色文字: #1d1d1f
  - 画布白: #ffffff
  - 羊皮纸: #f5f5f7
  - 暗色Tile: #272729

## API 接口说明

### POST /api/optimize

请求体:
```json
{
  "imageBase64": "data:image/...;base64,...",
  "prompt": "证件照生成prompt"
}
```

成功响应:
```json
{
  "resultImageUrl": "https://..."
}
```

错误响应:
```json
{
  "error": "错误信息"
}
```
