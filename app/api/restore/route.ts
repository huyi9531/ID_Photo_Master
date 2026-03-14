import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { prompt, image } = await request.json()

    if (!prompt || !image) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      )
    }

    const response = await fetch('https://ark.cn-beijing.volces.com/api/v3/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer bc38e088-6086-4633-81eb-a68c7b69c7ec',
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
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[v0] API error:', errorText)
      return NextResponse.json(
        { error: '图片生成失败，请重试' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('[v0] Server error:', error)
    return NextResponse.json(
      { error: '服务器错误，请稍后重试' },
      { status: 500 }
    )
  }
}
