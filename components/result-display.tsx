'use client'

import { Download, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ResultDisplayProps {
  originalImage: string
  resultImage: string
  outfitName: string
  onReset: () => void
}

export function ResultDisplay({
  originalImage,
  resultImage,
  outfitName,
  onReset,
}: ResultDisplayProps) {
  const handleDownload = async () => {
    try {
      const response = await fetch(resultImage)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `修复照片_${outfitName}_${Date.now()}.png`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch {
      window.open(resultImage, '_blank')
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6 items-stretch">
        <div className="flex flex-col space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">原图</h3>
          <div className="flex-1 border border-border rounded-lg overflow-hidden bg-muted/20 flex items-center justify-center min-h-72">
            <img
              src={originalImage}
              alt="原图"
              className="w-full h-full object-contain max-h-96"
            />
          </div>
        </div>
        <div className="flex flex-col space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">
            修复后 · {outfitName}
          </h3>
          <div className="flex-1 border border-border rounded-lg overflow-hidden bg-muted/20 flex items-center justify-center min-h-72">
            <img
              src={resultImage}
              alt="修复后"
              className="w-full h-full object-contain max-h-96"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button onClick={handleDownload} size="lg" className="gap-2">
          <Download className="h-4 w-4" />
          下载修复照片
        </Button>
        <Button variant="outline" onClick={onReset} size="lg" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          重新开始
        </Button>
      </div>
    </div>
  )
}
