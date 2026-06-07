import { Pencil, Trash2, Tag, ToggleLeft, ToggleRight } from 'lucide-react'
import { discountedPrice, formatPrice, isValidUrl } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { MenuItem } from '@/types'

interface AdminItemCardProps {
  item:     MenuItem
  layout?:  'grid' | 'list'
  onEdit:   () => void
  onDelete: () => void
}

export function AdminItemCard({ item, layout = 'grid', onEdit, onDelete }: AdminItemCardProps) {
  const finalPrice = discountedPrice(item.price, item.offer_percent)
  const hasImage   = isValidUrl(item.image_url)

  if (layout === 'list') {
    return (
      <div className={cn(
        'flex items-center gap-4 p-3 rounded-xl border transition-all',
        'bg-black border-brand-900/30 hover:border-brand-700/40'
      )}>
        <div className="w-20 h-20 rounded-lg bg-white flex items-center justify-center overflow-hidden shrink-0">
          {hasImage
            ? <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
            : <span className="text-2xl">{item.image_url}</span>
          }
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-lg truncate">{item.name}</p>
          <p className="text-white text-xs">{item.category}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {item.offer_percent > 0 && (
            <span className="text-xs text-red-400 font-mono bg-red-900/20 px-2 py-0.5 rounded-full">
              -{item.offer_percent}%
            </span>
          )}
          <div className="text-right">
            <p className="font-mono font-bold text-brand-300 text-sm">{formatPrice(finalPrice)}</p>
            {item.offer_percent > 0 && (
              <p className="font-mono text-brand-800 text-xs line-through">{formatPrice(item.price)}</p>
            )}
          </div>
          <div className="flex items-center gap-1">
            {item.available
              ? <ToggleRight size={18} className="text-green-500" />
              : <ToggleLeft  size={18} className="text-brand-800" />
            }
          </div>
          <button onClick={onEdit}
            className="p-2 rounded-lg bg-brand-900/40 hover:bg-brand-800/60 text-brand-400 transition-all">
            <Pencil size={13} />
          </button>
          <button onClick={onDelete}
            className="p-2 rounded-lg bg-red-900/20 hover:bg-red-900/40 text-red-700 hover:text-red-400 transition-all">
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={cn(
      'menu-card group relative',
      !item.available && 'opacity-60'
    )}>
      {item.offer_percent > 0 && (
        <span className="badge-offer">-{item.offer_percent}%</span>
      )}

      {/* Image */}
      <div className="h-24 flex items-center justify-center bg-surface-100/60 border-b border-brand-900/20 overflow-hidden">
        {hasImage
          ? <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
          : <span className="text-5xl select-none">{item.image_url || '🍽️'}</span>
        }
      </div>

      <div className="p-3">
        <div className="flex items-start justify-between gap-1 mb-1">
          <h3 className="font-display text-brand-200 font-semibold text-xs leading-tight line-clamp-1 flex-1">
            {item.name}
          </h3>
          <span className={cn(
            'text-[9px] px-1 py-0.5 rounded-sm shrink-0',
            item.available ? 'bg-green-900/30 text-green-600' : 'bg-red-900/20 text-red-700'
          )}>
            {item.available ? 'ON' : 'OFF'}
          </span>
        </div>

        <div className="flex items-center gap-1 mb-2">
          <Tag size={9} className="text-brand-800" />
          <span className="text-brand-800 text-[10px]">{item.category}</span>
        </div>

        <div className="flex items-center justify-between mb-2">
          <div>
            <span className="font-mono font-bold text-brand-300 text-xs">{formatPrice(finalPrice)}</span>
            {item.offer_percent > 0 && (
              <span className="font-mono text-brand-800 text-[10px] line-through ml-1">{formatPrice(item.price)}</span>
            )}
          </div>
        </div>

        {/* Admin actions */}
        <div className="flex gap-1.5">
          <button
            onClick={onEdit}
            className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg
                       bg-brand-800/30 hover:bg-brand-700/40 text-brand-300
                       text-[11px] font-semibold border border-brand-800/30 transition-all"
          >
            <Pencil size={10} /> Edit
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 rounded-lg bg-red-900/20 hover:bg-red-900/40
                       text-red-800 hover:text-red-400 border border-red-900/20 transition-all"
          >
            <Trash2 size={11} />
          </button>
        </div>
      </div>
    </div>
  )
}
