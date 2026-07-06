import { createFileRoute } from "@tanstack/react-router"
import { Loader2 } from "lucide-react"
import { useState } from "react"
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

type OptimizeSuccessResult = Extract<OptimizeResult, { resultImageUrl: string }>

function isOptimizeResult(value: unknown): value is OptimizeSuccessResult {
  return (
    typeof value === "object" &&
    value !== null &&
    "resultImageUrl" in value &&
    typeof value.resultImageUrl === "string"
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

  const canOptimize = Boolean(imageBase64 && background && !isOptimizing)

  const handleOptimize = async () => {
    if (!imageBase64 || !background) return

    setIsOptimizing(true)
    setError(null)
    setResultImageUrl(null)

    const prompt = assemblePrompt(background.promptColor, clothing, clothingColor)

    try {
      const res = await fetch("/api/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64, prompt }),
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
        return
      }

      if (!isOptimizeResult(data)) {
        console.error("Optimize API returned an unexpected response", { data })
        setError("优化结果格式异常，请重试")
        return
      }

      setResultImageUrl(data.resultImageUrl)
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
    <div className="h-[calc(100vh-44px)] flex">
      <div className="w-[42%] bg-[#272729] flex flex-col items-center justify-center p-10 relative overflow-hidden">
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

      <div className="w-[58%] bg-white flex flex-col px-10 pt-6 pb-8 overflow-y-auto">
        <div className="flex gap-10 mb-7">
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

        <div className="flex items-center gap-4 mt-4">
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
              "开始优化"
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

        {error && (
          <p className="text-red-500 font-body text-[14px] mt-3">{error}</p>
        )}

        <p className="text-[#7a7a7a] font-body text-[12px] tracking-[-0.12px] mt-auto pt-6">
          上传正面人像 → 选择背景与服装 → AI 生成标准证件照
        </p>
      </div>
    </div>
  )
}
