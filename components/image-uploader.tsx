'use client'

import { useCallback } from 'react'
import { Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ImageUploaderProps {
  image: string | null
  onImageChange: (image: string | null) => void
}

export function ImageUploader({ image, onImageChange }: ImageUploaderProps) {
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onloadend = () => {
          onImageChange(reader.result as string)
        }
        reader.readAsDataURL(file)
      }
    },
    [onImageChange]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      const file = e.dataTransfer.files?.[0]
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onloadend = () => {
          onImageChange(reader.result as string)
        }
        reader.readAsDataURL(file)
      }
    },
    [onImageChange]
  )

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }, [])

  const clearImage = useCallback(() => {
    onImageChange(null)
  }, [onImageChange])

  return (
    <div className="w-full">
      {image ? (
        <div className="relative">
          <img
            src={image}
            alt="上传的照片"
            className="w-full max-h-64 object-contain rounded-xl border border-border bg-muted/30"
          />
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-3 right-3 h-10 w-10"
            onClick={clearImage}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      ) : (
        <label
          className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-border rounded-xl cursor-pointer bg-muted/20 hover:bg-muted/40 transition-colors"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <div className="flex flex-col items-center justify-center py-4">
            <Upload className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-xl text-muted-foreground mb-1">
              点击或拖拽上传照片
            </p>
            <p className="text-base text-muted-foreground">
              支持 JPG、PNG 格式
            </p>
          </div>
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
        </label>
      )}
    </div>
  )
}
