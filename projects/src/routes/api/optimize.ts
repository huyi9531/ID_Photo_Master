import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"
import { generateImage } from "@/lib/seedream.server"

const optimizeRequestSchema = z.object({
  imageBase64: z.string().min(1),
  prompt: z.string().min(1),
})

export const Route = createFileRoute("/api/optimize")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: unknown

        try {
          body = await request.json()
        } catch (parseError: unknown) {
          console.error("Invalid optimize request JSON", { parseError })
          return Response.json({ error: "Invalid JSON body" }, { status: 400 })
        }

        const parsed = optimizeRequestSchema.safeParse(body)

        if (!parsed.success) {
          console.error("Invalid optimize request body", {
            issues: parsed.error.issues,
          })
          return Response.json(
            { error: "Missing imageBase64 or prompt" },
            { status: 400 },
          )
        }

        try {
          const resultImageUrl = await generateImage({
            imageBase64: parsed.data.imageBase64,
            prompt: parsed.data.prompt,
          })

          return Response.json({ resultImageUrl })
        } catch (generationError: unknown) {
          const message =
            generationError instanceof Error
              ? generationError.message
              : "生成失败，请重试"

          console.error("Optimize image generation failed", {
            message,
            generationError,
          })

          return Response.json({ error: message }, { status: 500 })
        }
      },
    },
  },
})
