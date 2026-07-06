interface D1RunMeta {
  changes?: number
  last_row_id?: number
}

interface D1Result<T = unknown> {
  results?: T[]
  success: boolean
  meta: D1RunMeta
}

interface D1PreparedStatement {
  bind(...values: Array<string | number | null>): D1PreparedStatement
  all<T = unknown>(): Promise<D1Result<T>>
  first<T = unknown>(): Promise<T | null>
  run(): Promise<D1Result>
}

interface D1Database {
  prepare(query: string): D1PreparedStatement
  batch<T = unknown>(statements: D1PreparedStatement[]): Promise<Array<D1Result<T>>>
}

interface CloudflareBindings {
  DB: D1Database
  CREEM_API_KEY?: string
  CREEM_WEBHOOK_SECRET?: string
  CREEM_PRODUCT_ID?: string
  CREEM_API_BASE?: string
  PUBLIC_SITE_URL?: string
  ARK_API_KEY?: string
  VOLCENGINE_API_KEY?: string
  IMAGE_API_KEY?: string
}

declare module "cloudflare:workers" {
  export const env: CloudflareBindings
}
