"use client"

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
          className="max-h-[calc(100vh-220px)] max-w-full rounded-lg object-contain shadow-product"
        />
        <button
          onClick={onRemove}
          className="absolute -top-2 -right-2 w-7 h-7 bg-[rgba(210,210,215,0.64)] text-white rounded-full flex items-center justify-center active:scale-95 transition-transform cursor-pointer backdrop-blur-sm"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    )
  }

  return (
    <div className="w-full max-w-xs mx-auto">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative border border-dashed rounded-lg p-12
          flex flex-col items-center justify-center gap-4
          transition-all duration-200 cursor-pointer
          ${
            isDragging
              ? "border-[#2997FF] bg-[#2997FF]/5"
              : "border-[#cccccc]/30 hover:border-[#2997FF]/50"
          }
          ${isReading ? "pointer-events-none opacity-60" : ""}
        `}
      >
        {isReading ? (
          <>
            <Loader2 className="w-8 h-8 text-[#2997FF] animate-spin" />
            <p className="text-[#cccccc] font-body text-[14px]">读取中...</p>
          </>
        ) : (
          <>
            <Upload className="w-8 h-8 text-[#cccccc]" />
            <div className="text-center">
              <p className="text-white font-body text-[14px] font-semibold">
                拖拽照片到此处
              </p>
              <p className="text-[#cccccc] font-body text-[12px] mt-1">
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
        <p className="text-red-400 font-body text-[12px] mt-2 text-center">
          {error}
        </p>
      )}
    </div>
  )
}
