import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"
import { screenPrompt } from "@/lib/creem.server"
import {
  consumeReservedCredit,
  getDb,
  logGenerationAttempt,
  reserveCredit,
  restoreReservedCredit,
} from "@/lib/db.server"
import { generateImage } from "@/lib/seedream.server"

const optimizeRequestSchema = z.object({
  imageBase64: z.string().min(1),
  prompt: z.string().min(1),
  purchaseToken: z.string().min(1),
})

interface AttemptLog {
  id: string
  purchaseToken: string
  status: "moderation_blocked" | "failed" | "succeeded"
  moderationId: string | null
  moderationDecision: string | null
  promptLength: number
  resultImageUrl: string | null
  errorMessage: string | null
}

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
            { error: "Missing imageBase64, prompt, or purchaseToken" },
            { status: 400 },
          )
        }

        const db = getDb()
        const attemptId = crypto.randomUUID()
        const { imageBase64, prompt, purchaseToken } = parsed.data
        const reservedPurchase = await reserveCredit(db, purchaseToken)

        if (
          !reservedPurchase ||
          reservedPurchase.status !== "processing" ||
          reservedPurchase.credits_used >= reservedPurchase.credits_total
        ) {
          console.error("Optimize request rejected without available credit", {
            attemptId,
            purchaseToken,
            purchaseStatus: reservedPurchase?.status ?? null,
            creditsTotal: reservedPurchase?.credits_total ?? null,
            creditsUsed: reservedPurchase?.credits_used ?? null,
          })
          return Response.json(
            { error: "Please buy an unused photo credit before generating." },
            { status: 402 },
          )
        }

        let moderationId: string | null = null
        let moderationDecision: string | null = null

        try {
          const moderation = await screenPrompt(prompt, attemptId)
          moderationId = moderation.id
          moderationDecision = moderation.decision

          if (moderation.decision !== "allow") {
            await restoreReservedCredit(db, purchaseToken)
            await writeAttemptLog(db, {
              id: attemptId,
              purchaseToken,
              status: "moderation_blocked",
              moderationId,
              moderationDecision,
              promptLength: prompt.length,
              resultImageUrl: null,
              errorMessage: `Creem moderation decision: ${moderation.decision}`,
            })

            console.error("Optimize request blocked by Creem moderation", {
              attemptId,
              moderationId,
              moderationDecision,
            })

            return Response.json(
              {
                error:
                  "This request is blocked by our acceptable use policy. The credit was not used.",
              },
              { status: 400 },
            )
          }

          const resultImageUrl = await generateImage({
            imageBase64,
            prompt,
          })

          const consumed = await consumeReservedCredit(db, purchaseToken)

          if (consumed !== 1) {
            console.error("Generated image but failed to consume reserved credit", {
              attemptId,
              purchaseToken,
              consumed,
            })
            await writeAttemptLog(db, {
              id: attemptId,
              purchaseToken,
              status: "failed",
              moderationId,
              moderationDecision,
              promptLength: prompt.length,
              resultImageUrl,
              errorMessage: "Failed to consume reserved credit after generation",
            })

            return Response.json(
              { error: "Credit state changed unexpectedly. Please contact support." },
              { status: 409 },
            )
          }

          await writeAttemptLog(db, {
            id: attemptId,
            purchaseToken,
            status: "succeeded",
            moderationId,
            moderationDecision,
            promptLength: prompt.length,
            resultImageUrl,
            errorMessage: null,
          })

          return Response.json({ resultImageUrl })
        } catch (generationError: unknown) {
          await restoreReservedCredit(db, purchaseToken)

          const message =
            generationError instanceof Error
              ? generationError.message
              : "生成失败，请重试"

          await writeAttemptLog(db, {
            id: attemptId,
            purchaseToken,
            status: "failed",
            moderationId,
            moderationDecision,
            promptLength: prompt.length,
            resultImageUrl: null,
            errorMessage: message,
          })

          console.error("Optimize failed before successful generation", {
            attemptId,
            message,
            generationError,
          })

          return Response.json({ error: message }, { status: 500 })
        }
      },
    },
  },
})

async function writeAttemptLog(
  db: D1Database,
  attempt: AttemptLog,
): Promise<void> {
  try {
    await logGenerationAttempt(db, attempt)
  } catch (logError: unknown) {
    console.error("Failed to write generation attempt log", {
      attemptId: attempt.id,
      purchaseToken: attempt.purchaseToken,
      status: attempt.status,
      logError,
    })
  }
}
