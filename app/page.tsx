'use client'

import { useState, useCallback } from 'react'
import { ImageUploader } from '@/components/image-uploader'
import { OutfitSelector } from '@/components/outfit-selector'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { type Outfit } from '@/lib/outfits'
import { Sparkles, Camera, Download, RefreshCw } from 'lucide-react'

export default function PhotoRestorePage() {
  const [image, setImage] = useState<string | null>(null)
  const [selectedOutfit, setSelectedOutfit] = useState<Outfit | null>(null)
  const [resultImage, setResultImage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleImageChange = useCallback((newImage: string | null) => {
    setImage(newImage)
    setError(null)
    // 清除之前的结果
    if (!newImage) {
      setResultImage(null)
      setSelectedOutfit(null)
    }
  }, [])

  const handleOutfitSelect = useCallback((outfit: Outfit) => {
    setSelectedOutfit(outfit)
    setError(null)
  }, [])

  const handleGenerate = useCallback(async () => {
    if (!image || !selectedOutfit) return

    setIsLoading(true)
    setError(null)
    setResultImage(null)

    try {
      const response = await fetch('/api/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: selectedOutfit.prompt,
          image: image,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '生成失败')
      }

      const generatedUrl = data.data?.[0]?.url
      if (generatedUrl) {
        setResultImage(generatedUrl)
      } else {
        throw new Error('未获取到生成的图片')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }, [image, selectedOutfit])

  const handleReset = useCallback(() => {
    setImage(null)
    setSelectedOutfit(null)
    setResultImage(null)
    setError(null)
    setIsLoading(false)
  }, [])

  const handleDownload = async () => {
    if (!resultImage || !selectedOutfit) return
    try {
      const response = await fetch(resultImage)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `修复照片_${selectedOutfit.name}_${Date.now()}.png`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch {
      window.open(resultImage, '_blank')
    }
  }

  const showResultPanel = isLoading || resultImage

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Header */}
        <header className="text-center py-6 mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Camera className="h-9 w-9 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">证照优化大师</h1>
          </div>
          <p className="text-muted-foreground text-base">
            上传照片，选择服装，一键生成高清证件照
          </p>
        </header>

        {/* Main Content - Two Column Layout */}
        <div className="flex gap-8 items-stretch">
          {/* Left Panel - Upload & Select */}
          <div className={`${showResultPanel ? 'w-1/2' : 'w-full max-w-3xl mx-auto'} transition-all duration-300 flex`}>
            <div className="bg-card border border-border rounded-2xl p-6 flex-1 flex flex-col">
              {/* Image Upload Section */}
              <section className="mb-4">
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  第一步：上传照片
                </h2>
                <ImageUploader image={image} onImageChange={handleImageChange} />
              </section>

              {/* Outfit Selection Section */}
              {image && (
                <section className="mb-4">
                  <h2 className="text-xl font-semibold text-foreground mb-2">
                    第二步：选择服装款式
                  </h2>
                  <OutfitSelector
                    selectedOutfit={selectedOutfit}
                    onSelect={handleOutfitSelect}
                  />
                </section>
              )}

              {/* Error Message */}
              {error && (
                <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-lg mb-4">
                  {error}
                </div>
              )}

              {/* Generate Button - Fixed at bottom */}
              {image && selectedOutfit && !isLoading && (
                <div className="mt-auto flex justify-center pt-4">
                  <Button
                    onClick={handleGenerate}
                    size="lg"
                    className="gap-2 px-8 py-5 text-lg h-auto"
                  >
                    <Sparkles className="h-5 w-5" />
                    开始生成
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Result */}
          {showResultPanel && (
            <div className="w-1/2 transition-all duration-300 flex">
              <div className="bg-card border border-border rounded-2xl p-6 flex-1 flex flex-col">
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  修复结果
                </h2>

                {isLoading ? (
                  <div className="h-80 flex flex-col items-center justify-center gap-4">
                    <Spinner className="h-12 w-12" />
                    <div className="text-center">
                      <p className="text-muted-foreground text-xl mb-1">
                        正在修复照片，请稍候...
                      </p>
                      <p className="text-muted-foreground text-lg">
                        预计需要 20-40 秒
                      </p>
                    </div>
                  </div>
                ) : resultImage && selectedOutfit ? (
                  <>
                    <div className="h-96 border border-border rounded-xl overflow-auto bg-muted/20 mb-2 flex items-center justify-center">
                      <img
                        src={resultImage}
                        alt="修复后"
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                    <p className="text-center text-base text-muted-foreground mb-2">
                      服装款式：{selectedOutfit.name}
                    </p>
                  </>
                ) : null}

                {/* Buttons - Fixed at bottom */}
                {resultImage && selectedOutfit && !isLoading && (
                  <div className="flex gap-4 mt-auto">
                    <Button
                      onClick={handleDownload}
                      size="lg"
                      className="gap-2 flex-1 py-5 text-lg h-auto"
                    >
                      <Download className="h-5 w-5" />
                      下载照片
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleReset}
                      size="lg"
                      className="gap-2 flex-1 py-5 text-lg h-auto"
                    >
                      <RefreshCw className="h-5 w-5" />
                      重新开始
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="text-center mt-4 text-base text-muted-foreground">
          提示：网页关闭后数据不会保存，请及时下载照片
        </footer>
      </div>
    </main>
  )
}
