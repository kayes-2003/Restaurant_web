import { ShoppingCart, CheckCircle } from 'lucide-react'
import { discountedPrice, formatPrice, isValidUrl } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { MenuItem } from '@/types'

interface MenuCardProps {
  item:       MenuItem
  inCart:     boolean
  onAddToCart: () => void
}

export function MenuCard({ item, inCart, onAddToCart }: MenuCardProps) {
  const finalPrice = discountedPrice(item.price, item.offer_percent)
  const hasImage   = isValidUrl(item.image_url)

  return (
    <div className={cn('menu-card group', !item.available && 'opacity-50')}>
      {/* Offer badge */}
      {item.offer_percent > 0 && (
        <span className="badge-offer">-{item.offer_percent}%</span>
      )}

      {/* Unavailable badge */}
      {!item.available && (
        <span className="badge-unavailable">Unavailable</span>
      )}

      {/* Image / Emoji */}
      <div className="h-24 sm:h-28 flex items-center justify-center bg-surface-100/60 border-b border-brand-900/20 overflow-hidden">
        {hasImage ? (
          <img
            src={item.image_url}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <span className="text-5xl group-hover:scale-110 transition-transform duration-300 select-none">
            {item.image_url || '🍽️'}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-3">
        <div className="flex items-start gap-1 mb-1">
          <h3 className="font-display text-brand-200 font-semibold text-sm leading-tight flex-1 line-clamp-1">
            {item.name}
          </h3>
        </div>
        <p className="text-brand-800 text-[11px] leading-relaxed mb-2 line-clamp-2">
          {item.description}
        </p>

        {/* Price + CTA */}
        <div className="flex items-center justify-between gap-1">
          <div className="leading-tight">
            <span className="font-mono font-bold text-brand-300 text-sm">
              {formatPrice(finalPrice)}
            </span>
            {item.offer_percent > 0 && (
              <span className="block text-[10px] text-brand-800 line-through">
                {formatPrice(item.price)}
              </span>
            )}
          </div>

          <button
            onClick={onAddToCart}
            disabled={!item.available}
            className={cn(
              'shrink-0 flex items-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-200',
              inCart
                ? 'bg-green-900/30 text-green-400 border border-green-800/40'
                : 'bg-brand-500 hover:bg-brand-400 active:bg-brand-600 text-surface',
              !item.available && 'opacity-40 pointer-events-none'
            )}
          >
            {inCart
              ? <><CheckCircle size={11} /> Added</>
              : <><ShoppingCart size={11} /> Add</>
            }
          </button>
        </div>
      </div>
    </div>
  )
}
