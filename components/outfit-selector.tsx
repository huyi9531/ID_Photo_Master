'use client'

import { outfits, type Outfit } from '@/lib/outfits'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

interface OutfitSelectorProps {
  selectedOutfit: Outfit | null
  onSelect: (outfit: Outfit) => void
}

const genderColors = {
  '男': 'bg-blue-100 text-blue-700',
  '女': 'bg-pink-100 text-pink-700',
  '通用': 'bg-emerald-100 text-emerald-700',
}

export function OutfitSelector({ selectedOutfit, onSelect }: OutfitSelectorProps) {
  // 按性别分组：通用(前5个) -> 男(中间5个) -> 女(后5个)
  const universalOutfits = outfits.slice(0, 5)
  const maleOutfits = outfits.slice(5, 10)
  const femaleOutfits = outfits.slice(10, 15)

  const renderRow = (items: Outfit[], label: string, colorClass: string) => (
    <div className="flex items-center gap-3">
      <span className={cn('text-sm font-medium px-2 py-1 rounded w-12 text-center shrink-0', colorClass)}>
        {label}
      </span>
      <div className="grid grid-cols-5 gap-2 flex-1">
        {items.map((outfit) => (
          <button
            key={outfit.id}
            onClick={() => onSelect(outfit)}
            className={cn(
              'relative flex items-center justify-center p-3 rounded-xl border-2 transition-all h-14',
              selectedOutfit?.id === outfit.id
                ? 'border-primary bg-primary/5 shadow-md'
                : 'border-border hover:border-primary/50 hover:bg-muted/30'
            )}
          >
            {selectedOutfit?.id === outfit.id && (
              <div className="absolute top-1 right-1 h-4 w-4 rounded-full bg-primary flex items-center justify-center">
                <Check className="h-2.5 w-2.5 text-primary-foreground" />
              </div>
            )}
            <span className="text-base font-semibold text-foreground text-center leading-tight">
              {outfit.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  )

  return (
    <div className="flex flex-col gap-2">
      {renderRow(universalOutfits, '通用', genderColors['通用'])}
      {renderRow(maleOutfits, '男', genderColors['男'])}
      {renderRow(femaleOutfits, '女', genderColors['女'])}
    </div>
  )
}
