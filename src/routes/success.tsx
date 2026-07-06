import { createFileRoute } from "@tanstack/react-router"
import { CheckCircle2, Clock, Home, Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { useI18n, type Language } from "@/lib/i18n"

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
  const { language } = useI18n()
  const copy = successCopy[language]
  const { token } = Route.useSearch()
  const [creditStatus, setCreditStatus] = useState<CreditStatus | null>(null)
  const [isLoading, setIsLoading] = useState(Boolean(token))
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) {
      setIsLoading(false)
      setError(copy.errors.missingToken)
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
          setError(getDisplayError(data, copy.errors.loadCredit, language))
          setIsLoading(false)
          return
        }

        if (!isCreditStatus(data)) {
          console.error("Credits API returned an unexpected success response", {
            data,
          })
          setError(copy.errors.creditShape)
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
        setError(copy.errors.network)
        setIsLoading(false)
      }
    }

    void loadCredits(0)

    return () => {
      active = false
      if (timer) clearTimeout(timer)
    }
  }, [
    copy.errors.creditShape,
    copy.errors.loadCredit,
    copy.errors.missingToken,
    copy.errors.network,
    language,
    token,
  ])

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
              {copy.title}
            </h1>
            <p className="mt-1 text-[#86868b] font-body text-[14px]">
              {copy.subtitle}
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-md bg-[#fbfbfd] border border-[#e8e8ed] p-4">
          <p className="text-[#1d1d1f] font-body text-[15px] font-semibold">
            {getStatusText(creditStatus, isLoading, error, language)}
          </p>
          <p className="mt-2 break-all text-[#86868b] font-body text-[12px]">
            {copy.tokenLabel}: {token || copy.unavailable}
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
            <span>{copy.useCredit}</span>
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
  language: Language,
): string {
  const copy = successCopy[language].status

  if (isLoading) return copy.checking
  if (error) return copy.unconfirmed
  if (!creditStatus) return copy.notFound
  if (creditStatus.status === "paid" && creditStatus.creditsRemaining > 0) {
    return copy.ready
  }
  if (creditStatus.status === "pending") {
    return copy.pending
  }
  if (creditStatus.status === "used") return copy.used
  if (creditStatus.status === "refunded") return copy.refunded
  return copy.updating
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

function getDisplayError(
  value: unknown,
  fallback: string,
  language: Language,
): string {
  if (language === "zh") return fallback
  return getErrorMessage(value) || fallback
}

const successCopy = {
  en: {
    title: "Payment received",
    subtitle: "Your purchase token has been saved in this browser.",
    tokenLabel: "凭证",
    unavailable: "Unavailable",
    useCredit: "Use credit",
    errors: {
      missingToken: "Missing purchase token.",
      loadCredit: "Unable to load credit status.",
      creditShape: "Credit status response was not recognized.",
      network: "Network error while loading credit status.",
    },
    status: {
      checking: "Checking payment confirmation...",
      unconfirmed: "We could not confirm the credit automatically.",
      notFound: "No credit status found.",
      ready: "Your one photo credit is ready.",
      pending: "Payment is still pending. Webhook delivery can take a moment.",
      used: "This credit has already been used.",
      refunded: "This credit has been refunded.",
      updating: "Credit status is being updated.",
    },
  },
  zh: {
    title: "付款已收到",
    subtitle: "购买凭证已保存到当前浏览器。",
    tokenLabel: "Token",
    unavailable: "不可用",
    useCredit: "使用额度",
    errors: {
      missingToken: "缺少购买凭证。",
      loadCredit: "无法加载额度状态。",
      creditShape: "额度状态响应格式异常。",
      network: "加载额度状态时网络错误。",
    },
    status: {
      checking: "正在确认付款...",
      unconfirmed: "暂时无法自动确认额度。",
      notFound: "没有找到额度状态。",
      ready: "你的 1 次照片额度已可使用。",
      pending: "付款仍在确认中，webhook 送达可能需要一点时间。",
      used: "这个额度已经被使用。",
      refunded: "这个额度已经退款。",
      updating: "额度状态正在更新。",
    },
  },
} as const
