import { ImageGenerationClient, Config, HeaderUtils } from "coze-coding-dev-sdk"

interface GenerateImageOptions {
  imageBase64: string
  prompt: string
  headers?: Record<string, string>
}

export async function generateImage({ imageBase64, prompt, headers }: GenerateImageOptions): Promise<string> {
  const config = new Config()
  const customHeaders = headers ?? {}
  const client = new ImageGenerationClient(config, customHeaders)

  const response = await client.generate({
    prompt,
    model: "doubao-seedream-4-5-251128",
    size: "3072x4096",
    watermark: false,
    image: imageBase64,
    responseFormat: "url",
  })

  const helper = client.getResponseHelper(response)

  if (!helper.success || !helper.imageUrls?.[0]) {
    const errorMsg = helper.errorMessages?.join("; ") || "生成失败"
    throw new Error(errorMsg)
  }

  return helper.imageUrls[0]
}

export { HeaderUtils }
