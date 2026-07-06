"use client"

import { backgroundOptions } from "@/lib/clothing-data"
import type { BackgroundOption } from "@/types"

interface BackgroundSelectorProps {
  selected: BackgroundOption
  onSelect: (bg: BackgroundOption) => void
}

export default function BackgroundSelector({
  selected,
  onSelect,
}: BackgroundSelectorProps) {
  return (
    <div>
      <h3 className="text-[#1d1d1f] font-display text-[21px] leading-[1.19] tracking-[0.231px] font-semibold mb-4">背景颜色</h3>
      <div className="flex items-center gap-5">
        {backgroundOptions.map((bg) => {
          const isSelected = selected.id === bg.id
          return (
            <button
              key={bg.id}
              onClick={() => onSelect(bg)}
              className="group flex flex-col items-center gap-2 cursor-pointer active:scale-95 transition-all duration-150"
            >
              <div
                className={`
                  w-11 h-11 rounded-full transition-all duration-200
                  ${
                    isSelected
                      ? "ring-[3px] ring-[#0071E3] ring-offset-2 ring-offset-white scale-110"
                      : "ring-1 ring-black/[0.08] hover:ring-black/20 hover:scale-105"
                  }
                `}
                style={{ backgroundColor: bg.color }}
              />
              <span
                className={`
                  font-body text-[14px] leading-[1.43] tracking-[-0.224px] transition-colors duration-150
                  ${isSelected ? "text-[#0071E3] font-semibold" : "text-[#7a7a7a]"}
                `}
              >
                {bg.name}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
