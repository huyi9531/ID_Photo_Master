import { ClothingItem } from "@/types"

const BASE_PROMPT = "老照片高清修复，去除原图的折痕、污渍、划痕、噪点、泛黄、模糊瑕疵，严格100%保留原图人物的五官轮廓、面部细节、发型特征完全不做任何修改，调整人物姿态为端正端坐的正面朝向，构图为腰部以上的标准半身照，背景替换为纯{bgColor}无杂质的干净背景，柔和均匀的正面演播室灯光，自然真实的肤色，清晰锐利的细节，真实证件照质感"

const COLOR_PREFIX_MAP: Record<string, string> = {
  "深色": "深色",
  "浅色": "浅色",
  "黑色": "黑色",
  "白色": "白色",
  "深蓝": "深蓝色",
  "深灰": "深灰色",
  "深红": "深红色",
  "藏青": "藏青色",
  "驼色": "驼色",
  "墨绿": "墨绿色",
}

export function assemblePrompt(bgColor: string, clothing: ClothingItem | null, clothingColor?: string): string {
  let prompt = BASE_PROMPT.replace("{bgColor}", bgColor)

  if (clothing) {
    let desc = clothing.description
    if (clothingColor) {
      const prefix = COLOR_PREFIX_MAP[clothingColor] || clothingColor
      desc = `${prefix}${desc}`
    }
    prompt += `，人物穿着${desc}。`
  }

  return prompt
}
