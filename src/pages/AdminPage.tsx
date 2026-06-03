import { useState } from 'react'
import { Plus, LayoutGrid, List } from 'lucide-react'
import { AdminItemCard } from '@/components/admin/AdminItemCard'
import { AdminItemModal } from '@/components/admin/AdminItemModal'
import { CategoryTabs }  from '@/components/shared/CategoryTabs'
import { Loader }        from '@/components/shared/Loader'
import { StatsBar }      from '@/components/admin/StatsBar'
import type { MenuItem, MenuItemFormData, Category } from '@/types'

interface AdminPageProps {
  items:    MenuItem[]
  loading:  boolean
  onAdd:    (form: MenuItemFormData) => Promise<{ error: unknown }>
  onUpdate: (id: string, form: MenuItemFormData) => Promise<{ error: unknown }>
  onDelete: (id: string) => Promise<{ error: unknown }>
}

export function AdminPage({ items, loading, onAdd, onUpdate, onDelete }: AdminPageProps) {
  const [modalItem, setModalItem] = useState<MenuItem | null | undefined>(undefined)
  const [category,  setCategory]  = useState<Category>('All')
  const [layout,    setLayout]    = useState<'grid' | 'list'>('grid')

  const filtered = category === 'All' ? items : items.filter(i => i.category === category)

  if (loading) return <Loader />

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-brand-300">Admin Panel</h1>
          <p className="text-brand-700 text-sm mt-0.5">Manage menu items, prices & offers</p>
        </div>
        <button onClick={() => setModalItem(null)} className="btn-primary self-start sm:self-auto">
          <Plus size={16} /> Add New Item
        </button>
      </div>

      {/* Stats */}
      <StatsBar items={items} />

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4 mt-6">
        <div className="flex-1">
          <CategoryTabs active={category} onChange={setCategory} items={items} />
        </div>
        <div className="flex gap-1 bg-surface-100 border border-brand-900/40 rounded-lg p-1 self-start">
          {(['grid', 'list'] as const).map(l => (
            <button
              key={l}
              onClick={() => setLayout(l)}
              className={`p-1.5 rounded transition-all ${layout === l ? 'bg-brand-700/40 text-brand-300' : 'text-brand-700 hover:text-brand-400'}`}
            >
              {l === 'grid' ? <LayoutGrid size={15} /> : <List size={15} />}
            </button>
          ))}
        </div>
      </div>

      {/* Item grid / list */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-brand-800">
          <p className="font-display text-xl">No items in this category</p>
        </div>
      ) : layout === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {filtered.map(item => (
            <AdminItemCard
              key={item.id}
              item={item}
              onEdit={() => setModalItem(item)}
              onDelete={() => onDelete(item.id)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map(item => (
            <AdminItemCard
              key={item.id}
              item={item}
              layout="list"
              onEdit={() => setModalItem(item)}
              onDelete={() => onDelete(item.id)}
            />
          ))}
        </div>
      )}

      {/* Add / Edit modal */}
      {modalItem !== undefined && (
        <AdminItemModal
          item={modalItem}
          onClose={() => setModalItem(undefined)}
          onSave={async form => {
            if (modalItem?.id) return onUpdate(modalItem.id, form)
            return onAdd(form)
          }}
        />
      )}
    </div>
  )
}
