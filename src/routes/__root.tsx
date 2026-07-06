import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
} from "@tanstack/react-router"
import type { ReactNode } from "react"
import Footer from "@/components/Footer"
import GlobalNav from "@/components/GlobalNav"
import { I18nProvider } from "@/lib/i18n"
import globalsCss from "@/styles/globals.css?url"

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "AIConductor PhotoID" },
      {
        name: "description",
        content:
          "AIConductor PhotoID formats ID photos with background and attire style optimization while preserving identity features.",
      },
    ],
    links: [
      { rel: "stylesheet", href: globalsCss },
      { rel: "icon", href: "/favicon.ico" },
    ],
  }),
  component: RootComponent,
})

function RootComponent() {
  return (
    <RootDocument>
      <I18nProvider>
        <GlobalNav />
        <main className="pt-11">
          <Outlet />
        </main>
        <Footer />
      </I18nProvider>
    </RootDocument>
  )
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="antialiased">
        {children}
        <Scripts />
      </body>
    </html>
  )
}
