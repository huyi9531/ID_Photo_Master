import type { Metadata } from "next"
import "./globals.css"
import GlobalNav from "@/components/GlobalNav"

export const metadata: Metadata = {
  title: "证照优化大师 — AI驱动的专业证件照优化",
  description:
    "上传照片，选择背景色和服装，一键生成高质量证件照。AI驱动，专业品质。",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="antialiased">
        <GlobalNav />
        <main className="pt-11">{children}</main>
      </body>
    </html>
  )
}
