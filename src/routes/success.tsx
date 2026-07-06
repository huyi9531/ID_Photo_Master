import { createFileRoute } from "@tanstack/react-router"
import { CheckCircle2, Clock, Home, Loader2 } from "lucide-react"
import { useEffect, useState } from "react"

export const Route = createFileRoute("/success")({
  validateSearch: (search: Record<string, unknown>) => ({
    token: typeof search.token === "string" ? search.token : "",
  }),
  component: SuccessPage,
})

const TOKEN_STORAGE_KEY = "aiconductor-photoid-token"

type PurchaseStatus = "pending" | "paid" | "processing" | "used" | "refunded"

interface CreditStatus {
  token: string
  status: PurchaseStatus
  creditsRemaining: number
  customerEmail: string | null
  paidAt: string | null
  usedAt: string | null
}

function SuccessPage() {
  const { token } = Route.useSearch()
  const [creditStatus, setCreditStatus] = useState<CreditStatus | null>(null)
  const [isLoading, setIsLoading] = useState(Boolean(token))
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) {
      setIsLoading(false)
      setError("Missing purchase token.")
      return
    }

    window.localStorage.setItem(TOKEN_STORAGE_KEY, token)

    let active = true
    let timer: ReturnType<typeof setTimeout> | null = null

    const loadCredits = async (attempt: number) => {
      try {
        const res = await fetch(`/api/credits?token=${encodeURIComponent(token)}`)
        const data: unknown = await res.json().catch((parseError: unknown) => {
          console.error("Failed to parse credits response on success page", {
            status: res.status,
            parseError,
          })
          return null
        })

        if (!active) return

        if (!res.ok) {
          setError(getErrorMessage(data) || "Unable to load credit status.")
          setIsLoading(false)
          return
        }

        if (!isCreditStatus(data)) {
          console.error("Credits API returned an unexpected success response", {
            data,
          })
          setError("Credit status response was not recognized.")
          setIsLoading(false)
          return
        }

        setCreditStatus(data)

        if (data.status === "pending" && attempt < 6) {
          timer = setTimeout(() => {
            void loadCredits(attempt + 1)
          }, 2000)
          return
        }

        setIsLoading(false)
      } catch (requestError: unknown) {
        if (!active) return
        console.error("Success page credits request failed", {
          token,
          requestError,
        })
        setError("Network error while loading credit status.")
        setIsLoading(false)
      }
    }

    void loadCredits(0)

    return () => {
      active = false
      if (timer) clearTimeout(timer)
    }
  }, [token])

  const isReady = creditStatus?.status === "paid" && creditStatus.creditsRemaining > 0

  return (
    <section className="min-h-[calc(100vh-44px)] bg-[#f5f5f7] px-6 py-12">
      <div className="mx-auto max-w-[720px] rounded-lg border border-[#e8e8ed] bg-white p-8">
        <div className="flex items-center gap-3">
          {isLoading ? (
            <Loader2 className="h-7 w-7 animate-spin text-[#0071E3]" />
          ) : isReady ? (
            <CheckCircle2 className="h-7 w-7 text-[#0f8f4a]" />
          ) : (
            <Clock className="h-7 w-7 text-[#b26a00]" />
          )}
          <div>
            <h1 className="text-[#1d1d1f] font-display text-[28px] font-semibold">
              Payment received
            </h1>
            <p className="mt-1 text-[#86868b] font-body text-[14px]">
              Your purchase token has been saved in this browser.
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-md bg-[#fbfbfd] border border-[#e8e8ed] p-4">
          <p className="text-[#1d1d1f] font-body text-[15px] font-semibold">
            {getStatusText(creditStatus, isLoading, error)}
          </p>
          <p className="mt-2 break-all text-[#86868b] font-body text-[12px]">
            Token: {token || "Unavailable"}
          </p>
        </div>

        {error && (
          <p className="mt-4 text-red-500 font-body text-[14px]">{error}</p>
        )}

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <a
            href="/"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#0071E3] px-4 text-white font-body text-[14px] font-semibold hover:bg-[#0077ED]"
          >
            <Home className="h-4 w-4" />
            <span>Use credit</span>
          </a>
          <a
            href="mailto:support@aiconductor.top"
            className="text-[#0071E3] font-body text-[14px] hover:underline"
          >
            support@aiconductor.top
          </a>
        </div>
      </div>
    </section>
  )
}

function getStatusText(
  creditStatus: CreditStatus | null,
  isLoading: boolean,
  error: string | null,
): string {
  if (isLoading) return "Checking payment confirmation..."
  if (error) return "We could not confirm the credit automatically."
  if (!creditStatus) return "No credit status found."
  if (creditStatus.status === "paid" && creditStatus.creditsRemaining > 0) {
    return "Your one photo credit is ready."
  }
  if (creditStatus.status === "pending") {
    return "Payment is still pending. Webhook delivery can take a moment."
  }
  if (creditStatus.status === "used") return "This credit has already been used."
  if (creditStatus.status === "refunded") return "This credit has been refunded."
  return "Credit status is being updated."
}

function isCreditStatus(value: unknown): value is CreditStatus {
  return (
    typeof value === "object" &&
    value !== null &&
    "token" in value &&
    typeof value.token === "string" &&
    "status" in value &&
    typeof value.status === "string" &&
    "creditsRemaining" in value &&
    typeof value.creditsRemaining === "number"
  )
}

function getErrorMessage(value: unknown): string | null {
  if (
    typeof value === "object" &&
    value !== null &&
    "error" in value &&
    typeof value.error === "string"
  ) {
    return value.error
  }

  return null
}
