import { createFileRoute } from "@tanstack/react-router"
import {
  CheckCircle2,
  CreditCard,
  Loader2,
  RotateCcw,
  Sparkles,
} from "lucide-react"
import { useCallback, useEffect, useMemo, useState } from "react"
import ImageUploader from "@/components/ImageUploader"
import ResultDisplay from "@/components/ResultDisplay"
import {
  backgroundOptions,
  clothingColorOptions,
  clothingData,
} from "@/lib/clothing-data"
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
  const selectedSummary = useMemo(
    () => [
      background.name,
      clothing?.name ?? "原始服装",
      clothingColor,
    ],
    [background.name, clothing?.name, clothingColor],
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
    <div className="bg-[#f5f5f7]">
      <section className="mx-auto min-h-[calc(100dvh-44px)] max-w-[1500px] px-4 py-5 sm:px-6 lg:px-8">
        <header className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-body text-[13px] font-semibold text-[#0071E3]">
              AIConductor PhotoID
            </p>
            <h1 className="mt-1 max-w-[760px] text-balance font-display text-[32px] font-semibold leading-tight text-[#1d1d1f] sm:text-[40px]">
              证照优化大师
            </h1>
            <p className="mt-2 max-w-[720px] text-pretty font-body text-[14px] leading-6 text-[#5f6368] sm:text-[15px]">
              上传正面人像，选择背景和服装风格，生成一张适合证件照用途的排版结果。
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedSummary.map((item) => (
              <span
                key={item}
                className="rounded-full bg-white px-3 py-1.5 font-body text-[12px] font-semibold text-[#424245] shadow-[0_0_0_1px_rgba(0,0,0,0.06)]"
              >
                {item}
              </span>
            ))}
          </div>
        </header>

        <div className="grid gap-5 xl:grid-cols-[minmax(360px,0.95fr)_minmax(390px,1.05fr)_340px]">
          <PreviewPanel
            imageBase64={imageBase64}
            resultImageUrl={resultImageUrl}
            isOptimizing={isOptimizing}
            onImageReady={setImageBase64}
            onReset={handleReset}
          />

          <SetupPanel
            background={background}
            clothing={clothing}
            clothingColor={clothingColor}
            onBackgroundChange={setBackground}
            onClothingChange={setClothing}
            onClothingColorChange={setClothingColor}
          />

          <CheckoutPanel
            checkoutEmail={checkoutEmail}
            creditStatus={creditStatus}
            error={error}
            hasImage={Boolean(imageBase64)}
            hasUsageConsent={hasUsageConsent}
            hasUsableCredit={hasUsableCredit}
            isCheckingCredit={isCheckingCredit}
            isCreatingCheckout={isCreatingCheckout}
            isOptimizing={isOptimizing}
            canOptimize={canOptimize}
            onCheckout={handleCheckout}
            onEmailChange={setCheckoutEmail}
            onOptimize={handleOptimize}
            onReset={handleReset}
            onUsageConsentChange={setHasUsageConsent}
            showReset={Boolean(imageBase64 || resultImageUrl)}
          />
        </div>
      </section>

      <section className="border-t border-black/[0.06] bg-white px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-[1180px] gap-6 lg:grid-cols-[1fr_1.25fr]">
          <div>
            <p className="font-body text-[13px] font-semibold text-[#0071E3]">
              Review ready
            </p>
            <h2 className="mt-2 text-balance font-display text-[26px] font-semibold leading-tight text-[#1d1d1f]">
              Pricing, refunds, and acceptable use are visible before purchase.
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <InfoPanel
              title="Pricing"
              body="$1.00 buys one AI ID photo formatting credit."
            />
            <InfoPanel
              title="Refunds"
              body="Unused credits are refundable within 7 days."
            />
            <InfoPanel
              title="Compliance"
              body="NSFW, deepfake, face swap, impersonation, forged ID, and fraud are blocked."
            />
          </div>
        </div>
      </section>
    </div>
  )
}

function PreviewPanel({
  imageBase64,
  resultImageUrl,
  isOptimizing,
  onImageReady,
  onReset,
}: {
  imageBase64: string | null
  resultImageUrl: string | null
  isOptimizing: boolean
  onImageReady: (base64: string) => void
  onReset: () => void
}) {
  return (
    <section className="overflow-hidden rounded-[24px] bg-[#202124] p-4 shadow-[0_20px_50px_-34px_rgba(0,0,0,0.72)] xl:min-h-[650px]">
      <div className="mb-4 flex items-center justify-between gap-4 px-1">
        <div>
          <h2 className="font-display text-[16px] font-semibold text-white">
            Preview
          </h2>
          <p className="mt-1 font-body text-[12px] text-white/54">
            Upload, compare, then download the final result.
          </p>
        </div>
        <span className="rounded-full bg-white/10 px-3 py-1 font-body text-[12px] font-semibold text-white/70">
          3:4
        </span>
      </div>

      <div className="flex min-h-[520px] items-center justify-center rounded-[18px] bg-[#17181a] p-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07)]">
        {resultImageUrl && !isOptimizing ? (
          <ResultDisplay resultImageUrl={resultImageUrl} isLoading={false} />
        ) : isOptimizing && imageBase64 ? (
          <div className="relative flex w-full flex-col items-center justify-center">
            <div className="relative overflow-hidden rounded-[16px]">
              <img
                src={imageBase64}
                alt="正在处理的照片"
                className="max-h-[430px] w-auto object-contain brightness-75 blur-[2px] transition-[filter] duration-700 outline outline-1 -outline-offset-1 outline-white/10"
                style={{ aspectRatio: "3/4" }}
              />
              <div className="absolute inset-0 bg-black/30 backdrop-blur-[3px]" />
              <div className="scan-line-anim absolute left-0 right-0 h-[2px] bg-[#2997FF] shadow-[0_0_12px_2px_rgba(41,151,255,0.5)]" />
            </div>

            <div className="mt-6 w-64">
              <div className="relative h-[3px] w-full overflow-hidden rounded-full bg-white/10">
                <div className="indeterminate-bar absolute h-full rounded-full bg-[#2997FF]" />
              </div>
              <p className="mt-3 text-center font-body text-[13px] font-semibold text-white">
                AI 正在优化
              </p>
              <p className="mt-1 text-center font-body text-[12px] text-white/50">
                预计需要 15-30 秒
              </p>
            </div>
          </div>
        ) : (
          <ImageUploader
            imageBase64={imageBase64}
            onImageReady={onImageReady}
            onRemove={onReset}
          />
        )}
      </div>
    </section>
  )
}

function SetupPanel({
  background,
  clothing,
  clothingColor,
  onBackgroundChange,
  onClothingChange,
  onClothingColorChange,
}: {
  background: BackgroundOption
  clothing: ClothingItem | null
  clothingColor: string
  onBackgroundChange: (background: BackgroundOption) => void
  onClothingChange: (clothing: ClothingItem | null) => void
  onClothingColorChange: (color: string) => void
}) {
  return (
    <section className="rounded-[24px] bg-white p-5 shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_20px_50px_-36px_rgba(0,0,0,0.4)] xl:min-h-[650px]">
      <div className="mb-6">
        <h2 className="font-display text-[18px] font-semibold text-[#1d1d1f]">
          Photo setup
        </h2>
        <p className="mt-1 text-pretty font-body text-[13px] leading-5 text-[#6e7176]">
          These options describe formatting only. The model is instructed to
          preserve identity features.
        </p>
      </div>

      <div className="space-y-7">
        <section>
          <SectionHeader index="01" title="Background" />
          <div className="mt-3 grid grid-cols-3 gap-2">
            {backgroundOptions.map((option) => {
              const isSelected = option.id === background.id

              return (
                <button
                  key={option.id}
                  onClick={() => onBackgroundChange(option)}
                  className={`min-h-24 rounded-[14px] p-3 text-left transition-[box-shadow,transform,background-color] duration-150 ease-out active:scale-[0.96] ${
                    isSelected
                      ? "bg-[#eef6ff] shadow-[0_0_0_2px_#0071E3]"
                      : "bg-[#f5f5f7] shadow-[0_0_0_1px_rgba(0,0,0,0.06)] hover:shadow-[0_0_0_1px_rgba(0,113,227,0.45)]"
                  }`}
                >
                  <span
                    className="block h-9 rounded-[10px] shadow-[0_0_0_1px_rgba(0,0,0,0.08)]"
                    style={{ backgroundColor: option.color }}
                  />
                  <span
                    className={`mt-3 block font-body text-[13px] font-semibold ${
                      isSelected ? "text-[#0071E3]" : "text-[#1d1d1f]"
                    }`}
                  >
                    {option.name}
                  </span>
                </button>
              )
            })}
          </div>
        </section>

        <section>
          <SectionHeader index="02" title="Attire color" />
          <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-8 xl:grid-cols-4 2xl:grid-cols-8">
            {clothingColorOptions.map((option) => {
              const isSelected = clothingColor === option.label

              return (
                <button
                  key={option.id}
                  onClick={() => onClothingColorChange(option.label)}
                  className={`flex min-h-20 flex-col items-center justify-center rounded-[14px] p-2 transition-[box-shadow,transform,background-color] duration-150 ease-out active:scale-[0.96] ${
                    isSelected
                      ? "bg-[#eef6ff] shadow-[0_0_0_2px_#0071E3]"
                      : "bg-[#f5f5f7] shadow-[0_0_0_1px_rgba(0,0,0,0.06)] hover:shadow-[0_0_0_1px_rgba(0,113,227,0.45)]"
                  }`}
                >
                  <span
                    className={`h-7 w-7 rounded-full ${
                      option.needsBorder ? "shadow-[0_0_0_1px_rgba(0,0,0,0.14)]" : ""
                    }`}
                    style={{ backgroundColor: option.displayColor }}
                  />
                  <span
                    className={`mt-2 font-body text-[12px] font-semibold ${
                      isSelected ? "text-[#0071E3]" : "text-[#5f6368]"
                    }`}
                  >
                    {option.label}
                  </span>
                </button>
              )
            })}
          </div>
        </section>

        <section>
          <SectionHeader index="03" title="Clothing style" />
          <div className="mt-3 max-h-[310px] space-y-5 overflow-y-auto pr-1">
            <ClothingGroup
              title="通用"
              items={clothingData.filter((item) => item.gender === "通用")}
              selected={clothing}
              includeOriginal
              onSelect={onClothingChange}
            />
            <ClothingGroup
              title="男款"
              items={clothingData.filter((item) => item.gender === "男")}
              selected={clothing}
              onSelect={onClothingChange}
            />
            <ClothingGroup
              title="女款"
              items={clothingData.filter((item) => item.gender === "女")}
              selected={clothing}
              onSelect={onClothingChange}
            />
          </div>
        </section>
      </div>
    </section>
  )
}

function CheckoutPanel({
  checkoutEmail,
  creditStatus,
  error,
  hasImage,
  hasUsageConsent,
  hasUsableCredit,
  isCheckingCredit,
  isCreatingCheckout,
  isOptimizing,
  canOptimize,
  onCheckout,
  onEmailChange,
  onOptimize,
  onReset,
  onUsageConsentChange,
  showReset,
}: {
  checkoutEmail: string
  creditStatus: CreditStatus | null
  error: string | null
  hasImage: boolean
  hasUsageConsent: boolean
  hasUsableCredit: boolean
  isCheckingCredit: boolean
  isCreatingCheckout: boolean
  isOptimizing: boolean
  canOptimize: boolean
  onCheckout: () => void
  onEmailChange: (email: string) => void
  onOptimize: () => void
  onReset: () => void
  onUsageConsentChange: (checked: boolean) => void
  showReset: boolean
}) {
  return (
    <aside
      id="pricing"
      className="rounded-[24px] bg-white p-5 shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_20px_50px_-36px_rgba(0,0,0,0.4)] xl:sticky xl:top-16 xl:min-h-[650px] xl:self-start"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-[18px] font-semibold text-[#1d1d1f]">
            Checkout
          </h2>
          <p className="mt-1 font-body text-[13px] text-[#6e7176]">
            One-time purchase
          </p>
        </div>
        <div className="text-right">
          <p className="font-display text-[28px] font-semibold leading-none text-[#1d1d1f] tabular-nums">
            $1.00
          </p>
          <p className="mt-1 font-body text-[12px] text-[#6e7176]">
            1 credit
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-[16px] bg-[#f5f5f7] p-4">
        <div className="flex items-start gap-3">
          <span
            className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
              hasUsableCredit ? "bg-[#e7f7ee] text-[#14783e]" : "bg-white text-[#6e7176]"
            }`}
          >
            {isCheckingCredit ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
          </span>
          <div>
            <p className="font-body text-[13px] font-semibold text-[#1d1d1f]">
              {getCreditStatusLabel(creditStatus, isCheckingCredit)}
            </p>
            <p className="mt-1 text-pretty font-body text-[12px] leading-5 text-[#6e7176]">
              {hasUsableCredit
                ? "Your browser has one unused generation credit."
                : "Buy once, generate one formatted ID photo result."}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <label className="block">
          <span className="mb-1.5 block font-body text-[12px] font-semibold text-[#424245]">
            Receipt email
          </span>
          <input
            value={checkoutEmail}
            onChange={(event) => onEmailChange(event.target.value)}
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="Optional"
            className="h-11 w-full rounded-[12px] border border-[#d2d2d7] bg-white px-3 font-body text-[14px] text-[#1d1d1f] outline-none transition-[border-color,box-shadow] duration-150 focus:border-[#0071E3] focus:shadow-[0_0_0_3px_rgba(0,113,227,0.14)]"
          />
        </label>

        <button
          onClick={onCheckout}
          disabled={isCreatingCheckout}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-[12px] bg-[#1d1d1f] px-4 font-body text-[14px] font-semibold text-white transition-[background-color,transform] duration-150 hover:bg-[#2f2f32] active:scale-[0.96] disabled:cursor-not-allowed disabled:bg-[#b7b7bd]"
        >
          {isCreatingCheckout ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CreditCard className="h-4 w-4" />
          )}
          <span>Buy 1 credit</span>
        </button>
      </div>

      <div className="my-5 h-px bg-black/[0.06]" />

      <label className="flex items-start gap-3 rounded-[16px] bg-[#f5f5f7] p-4 font-body text-[13px] leading-5 text-[#424245]">
        <input
          type="checkbox"
          checked={hasUsageConsent}
          onChange={(event) => onUsageConsentChange(event.target.checked)}
          className="mt-0.5 h-4 w-4 accent-[#0071E3]"
        />
        <span>
          I own or am authorized to use this photo and will not use it for fraud,
          face swap, deepfake, NSFW, or impersonation.
        </span>
      </label>

      <button
        onClick={onOptimize}
        disabled={!canOptimize && !isOptimizing}
        className={`mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-[14px] px-4 font-body text-[15px] font-semibold transition-[background-color,transform,color] duration-150 active:scale-[0.96] ${
          isOptimizing
            ? "bg-[#0071E3] text-white"
            : canOptimize
              ? "bg-[#0071E3] text-white hover:bg-[#0077ED]"
              : "cursor-not-allowed bg-[#e8e8ed] text-[#86868b]"
        }`}
      >
        {isOptimizing ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>优化中</span>
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            <span>Generate photo</span>
          </>
        )}
      </button>

      {showReset && !isOptimizing && (
        <button
          onClick={onReset}
          className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-[12px] bg-white font-body text-[13px] font-semibold text-[#0071E3] shadow-[0_0_0_1px_rgba(0,113,227,0.22)] transition-[background-color,transform] duration-150 hover:bg-[#f3f9ff] active:scale-[0.96]"
        >
          <RotateCcw className="h-4 w-4" />
          <span>重新开始</span>
        </button>
      )}

      {error && (
        <p className="mt-4 rounded-[12px] bg-[#fff1f1] p-3 font-body text-[13px] leading-5 text-[#c21b1b]">
          {error}
        </p>
      )}

      <div className="mt-5 space-y-2 rounded-[16px] bg-[#f5f5f7] p-4">
        <Requirement checked={hasImage} label="Photo uploaded" />
        <Requirement checked={hasUsableCredit} label="Unused credit ready" />
        <Requirement checked={hasUsageConsent} label="Usage confirmed" />
      </div>

      <p className="mt-4 text-pretty font-body text-[12px] leading-5 text-[#6e7176]">
        Unused credits are refundable within 7 days. Support:
        {" "}
        <a className="text-[#0071E3] hover:underline" href={`mailto:${SUPPORT_EMAIL}`}>
          {SUPPORT_EMAIL}
        </a>
      </p>
    </aside>
  )
}

function SectionHeader({ index, title }: { index: string; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#eef6ff] font-body text-[12px] font-semibold text-[#0071E3] tabular-nums">
        {index}
      </span>
      <h3 className="font-display text-[15px] font-semibold text-[#1d1d1f]">
        {title}
      </h3>
    </div>
  )
}

function ClothingGroup({
  title,
  items,
  selected,
  includeOriginal = false,
  onSelect,
}: {
  title: string
  items: ClothingItem[]
  selected: ClothingItem | null
  includeOriginal?: boolean
  onSelect: (item: ClothingItem | null) => void
}) {
  return (
    <div>
      <p className="mb-2 font-body text-[12px] font-semibold text-[#86868b]">
        {title}
      </p>
      <div className="grid grid-cols-2 gap-2">
        {includeOriginal && (
          <ClothingButton
            isSelected={selected === null}
            label="原始服装"
            onClick={() => onSelect(null)}
          />
        )}
        {items.map((item) => (
          <ClothingButton
            key={item.id}
            isSelected={selected?.id === item.id}
            label={item.name}
            onClick={() => onSelect(item)}
          />
        ))}
      </div>
    </div>
  )
}

function ClothingButton({
  isSelected,
  label,
  onClick,
}: {
  isSelected: boolean
  label: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`min-h-11 rounded-[12px] px-3 py-2 text-left font-body text-[13px] font-semibold transition-[box-shadow,transform,background-color,color] duration-150 active:scale-[0.96] ${
        isSelected
          ? "bg-[#eef6ff] text-[#0071E3] shadow-[0_0_0_2px_#0071E3]"
          : "bg-[#f5f5f7] text-[#424245] shadow-[0_0_0_1px_rgba(0,0,0,0.06)] hover:shadow-[0_0_0_1px_rgba(0,113,227,0.45)]"
      }`}
    >
      {label}
    </button>
  )
}

function Requirement({ checked, label }: { checked: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2 font-body text-[12px] text-[#424245]">
      <CheckCircle2
        className={`h-4 w-4 ${checked ? "text-[#14783e]" : "text-[#b7b7bd]"}`}
      />
      <span>{label}</span>
    </div>
  )
}

function InfoPanel({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-[16px] bg-[#f5f5f7] p-4">
      <h3 className="font-display text-[15px] font-semibold text-[#1d1d1f]">
        {title}
      </h3>
      <p className="mt-2 text-pretty font-body text-[13px] leading-5 text-[#5f6368]">
        {body}
      </p>
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
