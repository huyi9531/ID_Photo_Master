"use client"

import { clothingData } from "@/lib/clothing-data"
import type { ClothingItem } from "@/types"

interface ClothingSelectorProps {
  selected: ClothingItem | null
  onSelect: (clothing: ClothingItem | null) => void
}

const groups = [
  { key: "通用", label: "通用" },
  { key: "男", label: "男款" },
  { key: "女", label: "女款" },
]

export default function ClothingSelector({
  selected,
  onSelect,
}: ClothingSelectorProps) {
  return (
    <div>
      <h3 className="text-[#1d1d1f] font-display text-[21px] leading-[1.19] tracking-[0.231px] font-semibold mb-4">服装选择</h3>
      <div className="space-y-4">
        {groups.map((group) => {
          const items = clothingData.filter((c) => c.gender === group.key)
          return (
            <div key={group.key}>
              <p className="text-[#7a7a7a] font-body text-[12px] tracking-[-0.12px] mb-2">
                {group.label}
              </p>
              <div className="grid grid-cols-4 gap-2">
                {group.key === "通用" && (
                  <button
                    onClick={() => onSelect(null)}
                    className={`
                      text-left border rounded-md px-3 py-2 transition-all duration-200 cursor-pointer
                      active:scale-[0.97]
                      ${selected === null
                        ? "border-[#0071E3] ring-1 ring-[#0071E3] bg-[#0071E3]/5"
                        : "border-[#e0e0e0] hover:border-[#0071E3]/40 hover:bg-[#f5f5f7]"
                      }
                    `}
                  >
                    <p className={`font-body text-[14px] leading-[1.29] tracking-[-0.224px] font-semibold ${selected === null ? "text-[#0071E3]" : "text-[#1d1d1f]"}`}>
                      原始服装
                    </p>
                  </button>
                )}
                {items.map((item) => {
                  const isSelected = selected?.id === item.id
                  return (
                    <button
                      key={item.id}
                      onClick={() => onSelect(item)}
                      className={`
                        text-left border rounded-md px-3 py-2 transition-all duration-200 cursor-pointer
                        active:scale-[0.97]
                        ${isSelected
                          ? "border-[#0071E3] ring-1 ring-[#0071E3] bg-[#0071E3]/5"
                          : "border-[#e0e0e0] hover:border-[#0071E3]/40 hover:bg-[#f5f5f7]"
                        }
                      `}
                    >
                      <p className={`font-body text-[14px] leading-[1.29] tracking-[-0.224px] font-semibold ${isSelected ? "text-[#0071E3]" : "text-[#1d1d1f]"}`}>
                        {item.name}
                      </p>
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
