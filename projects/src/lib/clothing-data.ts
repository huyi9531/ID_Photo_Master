import { ClothingItem } from "@/types"

export const clothingData: ClothingItem[] = [
  // 通用款式
  { id: "casual-jacket", name: "休闲夹克", gender: "通用", description: "合身休闲工装夹克，服装版型自然、与人物身形自然贴合" },
  { id: "wool-coat", name: "毛呢外套", gender: "通用", description: "厚款毛呢外套，服装质感柔软厚实、与人物身形自然贴合" },
  { id: "dark-shirt", name: "长袖衬衫", gender: "通用", description: "挺括长袖正装衬衫，领口整齐平整、与人物身形自然贴合" },
  { id: "dark-sweater", name: "半高领毛衣", gender: "通用", description: "纯色半高领针织毛衣，针织纹理自然、与人物身形自然贴合" },
  { id: "tang-suit", name: "唐装", gender: "通用", description: "传统盘扣唐装上衣，立领工整、盘扣精致、面料质感厚实、与人物身形自然贴合" },
  { id: "sports-jacket", name: "运动外套", gender: "通用", description: "合身立领运动外套，拉链整齐、面料质感挺括、与人物身形自然贴合" },
  { id: "crewneck", name: "圆领T恤", gender: "通用", description: "合身纯棉圆领T恤，领口平整、面料质感柔软、与人物身形自然贴合" },

  // 男款
  { id: "suit-tie", name: "西装领带", gender: "男", description: "正式商务西装搭配正装领带，服装平整挺括、与人物身形自然贴合" },
  { id: "zhongshan", name: "中山装", gender: "男", description: "经典立领中山装，服装工整服帖、与人物身形自然贴合" },
  { id: "polo", name: "Polo衫", gender: "男", description: "合身翻领Polo衫，领口平整、面料质感挺括、与人物身形自然贴合" },
  { id: "blazer", name: "休闲西装", gender: "男", description: "合身休闲西装外套内搭圆领T恤，版型自然随性、与人物身形自然贴合" },
  { id: "vest-shirt", name: "马甲衬衫", gender: "男", description: "西装马甲搭配长袖衬衫，马甲纽扣整齐、衬衫领口平整、与人物身形自然贴合" },
  { id: "trench-coat", name: "中长款风衣", gender: "男", description: "合身中长款风衣外套，翻领挺括、双排扣整齐、面料质感厚实、与人物身形自然贴合" },
  { id: "suit-vest", name: "西装配领结", gender: "男", description: "正式商务西装搭配领结，服装平整挺括、领结端正、与人物身形自然贴合" },
  { id: "hoodie", name: "连帽卫衣", gender: "男", description: "合身纯色连帽卫衣，帽形自然、面料质感厚实、与人物身形自然贴合" },

  // 女款
  { id: "qipao", name: "旗袍", gender: "女", description: "典雅立领旗袍，盘扣精致、面料质感细腻、与人物身形自然贴合" },
  { id: "women-suit", name: "女士西装", gender: "女", description: "修身职业西装外套搭配衬衫，服装剪裁利落、与人物身形自然贴合" },
  { id: "knit-cardigan", name: "针织开衫", gender: "女", description: "优雅V领针织开衫搭配内搭，针织质感柔软温润、与人物身形自然贴合" },
  { id: "lace-blouse", name: "蕾丝衬衫", gender: "女", description: "优雅蕾丝领口衬衫，领口蕾丝精致细腻、面料质感柔软、与人物身形自然贴合" },
  { id: "hanfu", name: "汉服上衣", gender: "女", description: "典雅交领汉服上衣，领口整齐、面料垂感自然、刺绣精美、与人物身形自然贴合" },
  { id: "chiffon-blouse", name: "雪纺衬衫", gender: "女", description: "优雅V领雪纺衬衫，面料轻盈飘逸、领口线条柔美、与人物身形自然贴合" },
  { id: "dress-suit", name: "连衣裙外套", gender: "女", description: "修身短款小西装外套搭配连衣裙，剪裁精致、与人物身形自然贴合" },
  { id: "turtleneck", name: "高领毛衣", gender: "女", description: "优雅修身高领针织毛衣，领口服帖、针织纹理细腻、与人物身形自然贴合" },
]

export const backgroundOptions = [
  { id: "white", name: "白色", color: "#ffffff", promptColor: "白色" },
  { id: "blue", name: "蓝色", color: "#438EDB", promptColor: "蓝色" },
  { id: "red", name: "红色", color: "#FF0000", promptColor: "红色" },
]

export const clothingColorOptions: { id: string; label: string; displayColor: string; needsBorder?: boolean }[] = [
  { id: "dark", label: "深色", displayColor: "#1D1D1F" },
  { id: "light", label: "浅色", displayColor: "#F5F5F7", needsBorder: true },
  { id: "deep-blue", label: "深蓝", displayColor: "#003366" },
  { id: "deep-gray", label: "深灰", displayColor: "#4A4A4A" },
  { id: "deep-red", label: "深红", displayColor: "#8B0000" },
  { id: "navy", label: "藏青", displayColor: "#1B2B44" },
  { id: "camel", label: "驼色", displayColor: "#C19A6B" },
  { id: "dark-green", label: "墨绿", displayColor: "#1A3C2A" },
]
