import { Download } from "lucide-react"
import { useI18n } from "@/lib/i18n"

interface ResultDisplayProps {
  resultImageUrl: string | null
  isLoading: boolean
}

export default function ResultDisplay({
  resultImageUrl,
  isLoading,
}: ResultDisplayProps) {
  const { language } = useI18n()
  const isChinese = language === "zh"

  const handleDownload = async () => {
    if (!resultImageUrl) return
    try {
      const response = await fetch(resultImageUrl)
      const blob = await response.blob()
      const blobUrl = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = blobUrl
      link.download = `证照优化_${Date.now()}.jpg`
      link.click()
      window.URL.revokeObjectURL(blobUrl)
    } catch (downloadError: unknown) {
      console.error("Failed to download generated image", {
        resultImageUrl,
        downloadError,
      })
      window.open(resultImageUrl, "_blank")
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-2 border-[#cccccc]/30" />
          <div className="absolute inset-0 rounded-full border-2 border-[#2997FF] border-t-transparent animate-spin" />
        </div>
        <div className="text-center">
          <p className="text-white font-body text-[14px] leading-[1.29] tracking-[-0.224px] font-semibold">
            {isChinese ? "AI 正在优化" : "Optimizing photo"}
          </p>
          <p className="text-[#cccccc] font-body text-[12px] tracking-[-0.12px] mt-1">
            {isChinese ? "预计需要 15-30 秒，请耐心等待" : "This usually takes 15-30 seconds."}
          </p>
        </div>
      </div>
    )
  }

  if (!resultImageUrl) return null

  return (
    <div className="flex flex-col items-center gap-5">
      <img
        src={resultImageUrl}
        alt={isChinese ? "优化后的证件照" : "Optimized ID photo"}
        className="max-h-[430px] w-auto rounded-[16px] outline outline-1 -outline-offset-1 outline-white/10 shadow-product"
        style={{ aspectRatio: "3/4", objectFit: "contain" }}
      />
      <button
        onClick={handleDownload}
        className="
          inline-flex items-center gap-2
          bg-[#2997FF] text-white
          px-5 py-2.5 rounded-[12px]
          font-body text-[14px] font-semibold
          active:scale-[0.96] transition-[filter,transform] duration-150
          hover:brightness-110
        "
      >
        <Download className="w-3.5 h-3.5" />
        {isChinese ? "下载图片" : "Download"}
      </button>
    </div>
  )
}
