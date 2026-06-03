import { cn } from '@/lib/utils'
import type { Category, MenuItem } from '@/types'

const ALL_CATS: Category[] = ['All', 'Pizza', 'Burgers', 'Salads', 'Pasta', 'Drinks', 'Desserts']

const CAT_ICONS: Record<string, string> = {
  All: '🍽️', Pizza: '🍕', Burgers: '🍔', Salads: '🥗',
  Pasta: '🍝', Drinks: '🥤', Desserts: '🍮',
}

interface CategoryTabsProps {
  active:   Category
  onChange: (c: Category) => void
  items:    MenuItem[]
}

export function CategoryTabs({ active, onChange, items }: CategoryTabsProps) {
  const counts = ALL_CATS.reduce<Record<string, number>>((acc, cat) => {
    acc[cat] = cat === 'All' ? items.length : items.filter(i => i.category === cat).length
    return acc
  }, {})

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none"
      style={{ scrollbarWidth: 'none' }}>
      {ALL_CATS.filter(c => counts[c] > 0 || c === 'All').map(cat => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={cn(
            'category-pill flex items-center gap-1.5 shrink-0',
            active === cat
              ? 'bg-brand-500 text-surface font-bold shadow'
              : 'bg-surface-100 text-brand-500 border border-brand-900/40 hover:bg-surface-200 hover:text-brand-300'
          )}
        >
          <span className="text-sm">{CAT_ICONS[cat]}</span>
          {cat}
          <span className={cn(
            'text-[10px] px-1.5 py-0.5 rounded-full',
            active === cat ? 'bg-surface/30 text-surface' : 'bg-brand-900/50 text-brand-600'
          )}>
            {counts[cat]}
          </span>
        </button>
      ))}
    </div>
  )
}
