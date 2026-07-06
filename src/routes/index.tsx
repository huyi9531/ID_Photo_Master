import { createFileRoute } from "@tanstack/react-router"
import { CheckCircle2, CreditCard, Loader2, ShieldCheck } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import BackgroundSelector from "@/components/BackgroundSelector"
import ClothingSelector from "@/components/ClothingSelector"
import ImageUploader from "@/components/ImageUploader"
import ResultDisplay from "@/components/ResultDisplay"
import { backgroundOptions, clothingColorOptions } from "@/lib/clothing-data"
import { assemblePrompt } from "@/lib/prompt"
import type { BackgroundOption, ClothingItem, OptimizeResult } from "@/types"

export const Route = createFileRoute("/")({
  component: Home,
})

const SUPPORT_EMAIL = "support@aiconductor.top"
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

interface CheckoutSuccess {
  checkoutUrl: string
  token: string
}

type OptimizeSuccessResult = Extract<OptimizeResult, { resultImageUrl: string }>

function isOptimizeResult(value: unknown): value is OptimizeSuccessResult {
  return (
    typeof value === "object" &&
    value !== null &&
    "resultImageUrl" in value &&
    typeof value.resultImageUrl === "string"
  )
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

function isCheckoutSuccess(value: unknown): value is CheckoutSuccess {
  return (
    typeof value === "object" &&
    value !== null &&
    "checkoutUrl" in value &&
    typeof value.checkoutUrl === "string" &&
    "token" in value &&
    typeof value.token === "string"
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

function Home() {
  const [imageBase64, setImageBase64] = useState<string | null>(null)
  const [background, setBackground] = useState<BackgroundOption>(backgroundOptions[0])
  const [clothing, setClothing] = useState<ClothingItem | null>(null)
  const [clothingColor, setClothingColor] = useState<string>("深色")
  const [resultImageUrl, setResultImageUrl] = useState<string | null>(null)
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [checkoutEmail, setCheckoutEmail] = useState("")
  const [purchaseToken, setPurchaseToken] = useState<string | null>(null)
  const [creditStatus, setCreditStatus] = useState<CreditStatus | null>(null)
  const [isCheckingCredit, setIsCheckingCredit] = useState(false)
  const [isCreatingCheckout, setIsCreatingCheckout] = useState(false)
  const [hasUsageConsent, setHasUsageConsent] = useState(false)

  const hasUsableCredit =
    creditStatus?.status === "paid" && creditStatus.creditsRemaining > 0
  const canOptimize = Boolean(
    imageBase64 && background && !isOptimizing && hasUsableCredit && hasUsageConsent,
  )

  const refreshCredits = useCallback(async (token: string) => {
    setIsCheckingCredit(true)

    try {
      const res = await fetch(`/api/credits?token=${encodeURIComponent(token)}`)
      const data: unknown = await res.json().catch((parseError: unknown) => {
        console.error("Failed to parse credits response", {
          status: res.status,
          parseError,
        })
        return null
      })

      if (!res.ok) {
        console.error("Failed to load credit status", {
          status: res.status,
          error: getErrorMessage(data),
        })
        return
      }

      if (!isCreditStatus(data)) {
        console.error("Credits API returned an unexpected response", { data })
        return
      }

      setCreditStatus(data)
      setPurchaseToken(data.token)
    } catch (requestError: unknown) {
      console.error("Credits request failed", { requestError })
    } finally {
      setIsCheckingCredit(false)
    }
  }, [])

  useEffect(() => {
    const savedToken = window.localStorage.getItem(TOKEN_STORAGE_KEY)

    if (savedToken) {
      setPurchaseToken(savedToken)
      void refreshCredits(savedToken)
    }
  }, [refreshCredits])

  const handleCheckout = async () => {
    setIsCreatingCheckout(true)
    setError(null)

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: checkoutEmail }),
      })

      const data: unknown = await res.json().catch((parseError: unknown) => {
        console.error("Failed to parse checkout response", {
          status: res.status,
          parseError,
        })
        return null
      })

      if (!res.ok) {
        setError(getErrorMessage(data) || "Unable to start checkout.")
        return
      }

      if (!isCheckoutSuccess(data)) {
        console.error("Checkout API returned an unexpected response", { data })
        setError("Checkout response was not recognized.")
        return
      }

      window.localStorage.setItem(TOKEN_STORAGE_KEY, data.token)
      setPurchaseToken(data.token)
      window.location.assign(data.checkoutUrl)
    } catch (requestError: unknown) {
      console.error("Checkout request failed", { requestError })
      setError("Network error while starting checkout.")
    } finally {
      setIsCreatingCheckout(false)
    }
  }

  const handleOptimize = async () => {
    if (!imageBase64 || !background) return

    if (!purchaseToken || !hasUsableCredit) {
      setError("Please buy or complete payment for one photo credit first.")
      return
    }

    if (!hasUsageConsent) {
      setError("Please confirm that you own or are authorized to use this photo.")
      return
    }

    setIsOptimizing(true)
    setError(null)
    setResultImageUrl(null)

    const prompt = assemblePrompt(background.promptColor, clothing, clothingColor)

    try {
      const res = await fetch("/api/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64, prompt, purchaseToken }),
      })

      const data: unknown = await res.json().catch((parseError: unknown) => {
        console.error("Failed to parse optimize response", {
          status: res.status,
          parseError,
        })
        return null
      })

      if (!res.ok) {
        setError(getErrorMessage(data) || "优化失败，请重试")
        await refreshCredits(purchaseToken)
        return
      }

      if (!isOptimizeResult(data)) {
        console.error("Optimize API returned an unexpected response", { data })
        setError("优化结果格式异常，请重试")
        await refreshCredits(purchaseToken)
        return
      }

      setResultImageUrl(data.resultImageUrl)
      await refreshCredits(purchaseToken)
    } catch (requestError: unknown) {
      console.error("Optimize request failed", { requestError })
      setError("网络错误，请重试")
    } finally {
      setIsOptimizing(false)
    }
  }

  const handleReset = () => {
    setImageBase64(null)
    setBackground(backgroundOptions[0])
    setClothing(null)
    setClothingColor("深色")
    setResultImageUrl(null)
    setError(null)
  }

  return (
    <div className="bg-white">
      <section className="min-h-[calc(100vh-44px)] flex flex-col lg:flex-row">
        <div className="lg:w-[42%] min-h-[440px] bg-[#272729] flex flex-col items-center justify-center p-6 sm:p-10 relative overflow-hidden">
          {resultImageUrl && !isOptimizing ? (
            <ResultDisplay resultImageUrl={resultImageUrl} isLoading={false} />
          ) : isOptimizing && imageBase64 ? (
            <div className="relative w-full flex flex-col items-center justify-center">
              <div className="relative rounded-lg overflow-hidden shadow-product">
                <img
                  src={imageBase64}
                  alt="正在处理的照片"
                  className="max-h-[calc(100vh-280px)] w-auto object-contain blur-[2px] brightness-75 transition-all duration-700"
                  style={{ aspectRatio: "3/4" }}
                />
                <div className="absolute inset-0 bg-black/30 backdrop-blur-[3px] rounded-lg" />
                <div className="scan-line-anim absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#2997FF] to-transparent shadow-[0_0_12px_2px_rgba(41,151,255,0.5)]" />
              </div>

              <div className="mt-6 w-64 flex flex-col items-center gap-3">
                <div className="relative w-full h-[3px] bg-white/10 rounded-full overflow-hidden">
                  <div className="indeterminate-bar absolute h-full bg-gradient-to-r from-[#2997FF] via-[#5cb8ff] to-[#2997FF] rounded-full" />
                </div>
                <div className="text-center">
                  <p className="text-white font-body text-[14px] font-semibold tracking-[-0.224px]">
                    AI 正在优化
                  </p>
                  <p className="text-white/50 font-body text-[12px] tracking-[-0.12px] mt-1">
                    预计需要 15-30 秒，请耐心等待
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <ImageUploader
              imageBase64={imageBase64}
              onImageReady={setImageBase64}
              onRemove={handleReset}
            />
          )}
        </div>

        <div className="lg:w-[58%] bg-white flex flex-col px-6 sm:px-10 pt-6 pb-8 overflow-y-auto">
          <div className="flex flex-col xl:flex-row gap-7 xl:gap-10 mb-7">
            <div className="flex-1">
              <BackgroundSelector selected={background} onSelect={setBackground} />
            </div>
            <div className="flex-1">
              <h3 className="text-[#1d1d1f] font-display text-[21px] leading-[1.19] tracking-[0.231px] font-semibold mb-4">
                服装颜色
              </h3>
              <div className="flex items-center gap-3 flex-wrap">
                {clothingColorOptions.map((cc) => {
                  const isSelected = clothingColor === cc.label
                  return (
                    <button
                      key={cc.id}
                      onClick={() => setClothingColor(cc.label)}
                      className="group flex flex-col items-center gap-1.5 cursor-pointer active:scale-95 transition-all duration-150"
                    >
                      <div
                        className={`
                          w-9 h-9 rounded-full transition-all duration-200
                          ${
                            isSelected
                              ? "ring-[3px] ring-[#0071E3] ring-offset-2 ring-offset-white scale-110"
                              : "ring-1 ring-black/[0.08] hover:ring-black/20 hover:scale-105"
                          }
                          ${cc.needsBorder ? "border border-black/10" : ""}
                        `}
                        style={{ backgroundColor: cc.displayColor }}
                      />
                      <span
                        className={`
                          font-body text-[12px] leading-[1.33] tracking-[-0.12px] transition-colors duration-150
                          ${isSelected ? "text-[#0071E3] font-semibold" : "text-[#7a7a7a]"}
                        `}
                      >
                        {cc.label}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="mb-7">
            <ClothingSelector selected={clothing} onSelect={setClothing} />
          </div>

          <div className="border-t border-[#f0f0f0] my-2" />

          <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(280px,340px)]">
            <div className="flex flex-col gap-4">
              <label className="flex items-start gap-3 text-[#424245] font-body text-[13px] leading-5">
                <input
                  type="checkbox"
                  checked={hasUsageConsent}
                  onChange={(event) => setHasUsageConsent(event.target.checked)}
                  className="mt-1 h-4 w-4 accent-[#0071E3]"
                />
                <span>
                  I own or am authorized to use this photo, and I will not use the
                  result for fraud, face swap, deepfake, NSFW, or impersonation.
                  <span className="block text-[#86868b]">
                    我确认拥有照片使用权，并遵守可接受使用政策。
                  </span>
                </span>
              </label>

              <div className="flex items-center gap-4 flex-wrap">
                <button
                  onClick={handleOptimize}
                  disabled={!canOptimize && !isOptimizing}
                  className={`
                    relative inline-flex items-center justify-center gap-2
                    px-8 py-3 rounded-[9999px]
                    font-body text-[18px] font-light
                    transition-all duration-300 cursor-pointer overflow-hidden
                    ${
                      isOptimizing
                        ? "bg-[#0071E3] text-white"
                        : canOptimize
                          ? "bg-[#0071E3] text-white active:scale-95 hover:bg-[#0077ED]"
                          : "bg-[#f5f5f7] text-[#7a7a7a] cursor-not-allowed"
                    }
                  `}
                >
                  {isOptimizing ? (
                    <>
                      <Loader2 className="w-[18px] h-[18px] animate-spin" />
                      <span>优化中</span>
                      <span className="btn-shimmer" />
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-[18px] h-[18px]" />
                      <span>开始优化</span>
                    </>
                  )}
                </button>

                {(imageBase64 || resultImageUrl) && !isOptimizing && (
                  <button
                    onClick={handleReset}
                    className="text-[#0071E3] font-body text-[14px] hover:underline cursor-pointer transition-colors"
                  >
                    重新开始
                  </button>
                )}
              </div>
            </div>

            <aside
              id="pricing"
              className="border border-[#e8e8ed] rounded-lg p-4 bg-[#fbfbfd]"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[#1d1d1f] font-display text-[13px] font-semibold">
                    AIConductor PhotoID
                  </p>
                  <p className="text-[#86868b] font-body text-[12px] mt-1">
                    Single photo credit
                  </p>
                </div>
                <p className="text-[#1d1d1f] font-display text-[22px] font-semibold">
                  $1.00
                </p>
              </div>

              <div className="mt-4 rounded-md bg-white border border-[#e8e8ed] p-3">
                <p className="text-[#1d1d1f] font-body text-[13px] font-semibold">
                  {getCreditStatusLabel(creditStatus, isCheckingCredit)}
                </p>
                <p className="text-[#86868b] font-body text-[12px] mt-1">
                  {hasUsableCredit
                    ? "1 unused generation is ready on this browser."
                    : "Buy once, generate one ID photo formatting result."}
                </p>
              </div>

              <div className="mt-4 flex flex-col gap-3">
                <input
                  value={checkoutEmail}
                  onChange={(event) => setCheckoutEmail(event.target.value)}
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="Email for receipt (optional)"
                  className="h-10 rounded-md border border-[#d2d2d7] px-3 font-body text-[13px] outline-none focus:border-[#0071E3]"
                />
                <button
                  onClick={handleCheckout}
                  disabled={isCreatingCheckout}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#1d1d1f] px-4 text-white font-body text-[14px] font-semibold hover:bg-[#2f2f32] disabled:cursor-not-allowed disabled:bg-[#b7b7bd]"
                >
                  {isCreatingCheckout ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CreditCard className="w-4 h-4" />
                  )}
                  <span>Buy 1 credit</span>
                </button>
              </div>

              <p className="mt-3 text-[#86868b] font-body text-[12px] leading-5">
                Unused credits are refundable within 7 days. Support:
                {" "}
                <a className="text-[#0071E3] hover:underline" href={`mailto:${SUPPORT_EMAIL}`}>
                  {SUPPORT_EMAIL}
                </a>
              </p>
            </aside>
          </div>

          {error && (
            <p className="text-red-500 font-body text-[14px] mt-3">{error}</p>
          )}

          <p className="text-[#7a7a7a] font-body text-[12px] tracking-[-0.12px] mt-auto pt-6">
            ID photo formatting with background and attire style optimization. We
            do not change identity features, swap faces, or create another person.
          </p>
        </div>
      </section>

      <section className="bg-[#f5f5f7] px-6 py-12">
        <div className="mx-auto grid max-w-[980px] gap-5 md:grid-cols-3">
          <InfoPanel
            title="Pricing"
            body="$1.00 buys one AI ID photo formatting credit. Each paid credit can generate one result."
          />
          <InfoPanel
            title="Refunds"
            body="Unused credits can be refunded within 7 days by contacting support@aiconductor.top."
          />
          <InfoPanel
            title="Compliance"
            body="Requests for NSFW, deepfake, face swap, impersonation, third-party unauthorized photos, forged ID, or fraud are blocked."
          />
        </div>
        <div className="mx-auto mt-6 flex max-w-[980px] items-start gap-3 rounded-lg border border-[#e8e8ed] bg-white p-4">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#0071E3]" />
          <p className="text-[#424245] font-body text-[13px] leading-6">
            AIConductor PhotoID optimizes ID photo background and attire styling for
            photos you own or are authorized to use. It is not a government ID
            issuance service and must not be used to misrepresent identity.
          </p>
        </div>
      </section>
    </div>
  )
}

function getCreditStatusLabel(
  creditStatus: CreditStatus | null,
  isCheckingCredit: boolean,
): string {
  if (isCheckingCredit) return "Checking credit..."
  if (!creditStatus) return "No active credit"
  if (creditStatus.status === "paid" && creditStatus.creditsRemaining > 0) {
    return "Ready: 1 credit available"
  }
  if (creditStatus.status === "pending") return "Payment pending"
  if (creditStatus.status === "used") return "Credit used"
  if (creditStatus.status === "refunded") return "Credit refunded"
  if (creditStatus.status === "processing") return "Generation in progress"
  return "No active credit"
}

function InfoPanel({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-lg border border-[#e8e8ed] bg-white p-5">
      <h2 className="text-[#1d1d1f] font-display text-[17px] font-semibold">
        {title}
      </h2>
      <p className="mt-3 text-[#424245] font-body text-[13px] leading-6">{body}</p>
    </div>
  )
}
