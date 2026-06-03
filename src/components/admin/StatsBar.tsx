import { UtensilsCrossed, Tag, TrendingDown, AlertCircle } from 'lucide-react'
import type { MenuItem } from '@/types'

interface StatsBarProps {
  items: MenuItem[]
}

export function StatsBar({ items }: StatsBarProps) {
  const total       = items.length
  const withOffer   = items.filter(i => i.offer_percent > 0).length
  const unavailable = items.filter(i => !i.available).length
  const categories  = new Set(items.map(i => i.category)).size

  const stats = [
    { label: 'Total Items',    value: total,       icon: UtensilsCrossed, color: 'text-brand-400'  },
    { label: 'Categories',     value: categories,  icon: Tag,             color: 'text-blue-400'   },
    { label: 'On Offer',       value: withOffer,   icon: TrendingDown,    color: 'text-green-400'  },
    { label: 'Unavailable',    value: unavailable, icon: AlertCircle,     color: 'text-red-400'    },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {stats.map(s => (
        <div key={s.label}
          className="bg-surface-50 border border-brand-900/30 rounded-xl p-4 flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-surface-100 ${s.color}`}>
            <s.icon size={16} />
          </div>
          <div>
            <p className="font-mono font-bold text-brand-200 text-xl leading-tight">{s.value}</p>
            <p className="text-brand-700 text-xs">{s.label}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
