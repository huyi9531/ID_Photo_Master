import { useCallback, useState, useRef } from "react"
import { Upload, X, Loader2 } from "lucide-react"

interface ImageUploaderProps {
  imageBase64: string | null
  onImageReady: (base64: string) => void
  onRemove: () => void
}

export default function ImageUploader({
  imageBase64,
  onImageReady,
  onRemove,
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isReading, setIsReading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const readFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("请上传图片文件")
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("文件大小不能超过10MB")
      return
    }

    setError(null)
    setIsReading(true)

    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      setIsReading(false)
      onImageReady(result)
    }
    reader.onerror = () => {
      setIsReading(false)
      setError("读取文件失败")
    }
    reader.readAsDataURL(file)
  }, [onImageReady])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) readFile(file)
    },
    [readFile]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) readFile(file)
    },
    [readFile]
  )

  if (imageBase64) {
    return (
      <div className="relative inline-flex flex-col items-center">
        <img
          src={imageBase64}
          alt="已上传的照片"
          className="max-h-[440px] max-w-full rounded-[16px] object-contain outline outline-1 -outline-offset-1 outline-white/10 shadow-product"
        />
        <button
          onClick={onRemove}
          className="absolute -right-2 -top-2 flex h-9 w-9 items-center justify-center rounded-full bg-white/16 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.18)] backdrop-blur-sm transition-transform duration-150 active:scale-[0.96]"
          aria-label="移除照片"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-sm">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative rounded-[18px] border border-dashed px-6 py-12
          flex flex-col items-center justify-center gap-4
          cursor-pointer transition-[border-color,background-color,opacity] duration-150
          ${
            isDragging
              ? "border-[#2997FF] bg-[#2997FF]/8"
              : "border-white/18 bg-white/[0.03] hover:border-[#2997FF]/55"
          }
          ${isReading ? "pointer-events-none opacity-60" : ""}
        `}
      >
        {isReading ? (
          <>
            <Loader2 className="h-8 w-8 animate-spin text-[#2997FF]" />
            <p className="font-body text-[14px] text-white/66">读取中...</p>
          </>
        ) : (
          <>
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/8">
              <Upload className="h-6 w-6 text-white/70" />
            </span>
            <div className="text-center">
              <p className="font-body text-[14px] font-semibold text-white">
                拖拽照片到此处
              </p>
              <p className="mt-1 font-body text-[12px] text-white/54">
                或点击选择（JPG/PNG，≤10MB）
              </p>
            </div>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isReading}
        />
      </div>
      {error && (
        <p className="mt-2 text-center font-body text-[12px] text-red-300">
          {error}
        </p>
      )}
    </div>
  )
}
