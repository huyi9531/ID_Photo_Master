export interface ClothingItem {
  id: string
  name: string
  gender: "通用" | "男" | "女"
  description: string
}

export interface BackgroundOption {
  id: string
  name: string
  color: string
  promptColor: string
}

export interface ClothingColorOption {
  id: string
  label: string
  displayColor: string
  needsBorder?: boolean
}

export interface OptimizeParams {
  imageBase64: string
  prompt: string
}

export type OptimizeResult =
  | {
      resultImageUrl: string
    }
  | {
      error: string
    }
