import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import viteReact from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "vite"
import { nitro } from "nitro/vite"

const port = Number(process.env.DEPLOY_RUN_PORT ?? process.env.PORT ?? 5000)

export default defineConfig({
  server: {
    host: "0.0.0.0",
    port,
  },
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    tailwindcss(),
    tanstackStart(),
    viteReact(),
    nitro(),
  ],
})
