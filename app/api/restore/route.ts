import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { prompt, image } = body

    if (!prompt || !image) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      )
    }

    const arkKey = process.env.ARK_API_KEY
    if (!arkKey) {
      console.error('[restore] ARK_API_KEY not configured')
      return NextResponse.json(
        { error: 'API密钥未配置，请检查环境变量 ARK_API_KEY' },
        { status: 500 }
      )
    }

    console.log('[restore] Starting image generation request...')
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 55000)

    try {
      const response = await fetch('https://ark.cn-beijing.volces.com/api/v3/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${arkKey}`,
        },
        body: JSON.stringify({
          model: 'doubao-seedream-4-5-251128',
          prompt,
          image,
          sequential_image_generation: 'disabled',
          response_format: 'url',
          size: '3520x4704',
          stream: false,
          watermark: false,
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      const responseText = await response.text()
      console.log('[restore] API response status:', response.status)
      
      if (!response.ok) {
        console.error('[restore] API error:', responseText)
        let errorMessage = '图片生成失败'
        try {
          const errorJson = JSON.parse(responseText)
          errorMessage = errorJson.error?.message || errorJson.message || errorMessage
        } catch {
          if (responseText.includes('net_exception') || responseText.includes('network')) {
            errorMessage = '网络连接失败，请检查平台是否支持访问外部API'
          }
        }
        return NextResponse.json(
          { error: errorMessage },
          { status: response.status }
        )
      }

      const data = JSON.parse(responseText)
      return NextResponse.json(data)
    } catch (fetchError: unknown) {
      clearTimeout(timeoutId)
      
      if (fetchError instanceof Error) {
        if (fetchError.name === 'AbortError') {
          console.error('[restore] Request timeout')
          return NextResponse.json(
            { error: '请求超时，图片生成时间过长' },
            { status: 504 }
          )
        }
        console.error('[restore] Fetch error:', fetchError.message)
        
        if (fetchError.message.includes('fetch') || fetchError.message.includes('network')) {
          return NextResponse.json(
            { error: '网络连接失败，请检查部署平台是否允许访问 ark.cn-beijing.volces.com' },
            { status: 502 }
          )
        }
      }
      throw fetchError
    }
  } catch (error) {
    console.error('[restore] Server error:', error)
    return NextResponse.json(
      { error: '服务器错误，请稍后重试' },
      { status: 500 }
    )
  }
}
