import { NextRequest, NextResponse } from "next/server"
import { generateImage, HeaderUtils } from "@/lib/coze"

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { imageBase64, prompt } = body

  if (!imageBase64 || !prompt) {
    return NextResponse.json(
      { error: "Missing imageBase64 or prompt" },
      { status: 400 }
    )
  }

  try {
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers)
    const resultImageUrl = await generateImage({ imageBase64, prompt, headers: customHeaders })
    return NextResponse.json({ resultImageUrl })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "生成失败，请重试"
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}
