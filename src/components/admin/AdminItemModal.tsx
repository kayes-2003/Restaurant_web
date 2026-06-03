import { useState, useEffect } from 'react'
import { X, ImageIcon, DollarSign, Tag, Percent } from 'lucide-react'
import { discountedPrice, formatPrice, isValidUrl } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { MenuItem, MenuItemFormData } from '@/types'

const CATEGORIES = ['Pizza', 'Burgers', 'Salads', 'Pasta', 'Drinks', 'Desserts', 'Other']

interface AdminItemModalProps {
  item:    MenuItem | null      // null = create new
  onClose: () => void
  onSave:  (form: MenuItemFormData) => Promise<{ error: unknown }>
}

const blank: MenuItemFormData = {
  name: '', description: '', price: '', category: 'Pizza',
  image_url: '', offer_percent: '0', available: true,
}

export function AdminItemModal({ item, onClose, onSave }: AdminItemModalProps) {
  const [form,    setForm]    = useState<MenuItemFormData>(blank)
  const [saving,  setSaving]  = useState(false)

  useEffect(() => {
    if (item) {
      setForm({
        name:          item.name,
        description:   item.description,
        price:         String(item.price),
        category:      item.category,
        image_url:     item.image_url,
        offer_percent: String(item.offer_percent),
        available:     item.available,
      })
    } else {
      setForm(blank)
    }
  }, [item])

  const set = <K extends keyof MenuItemFormData>(key: K, val: MenuItemFormData[K]) =>
    setForm(f => ({ ...f, [key]: val }))

  const handleSave = async () => {
    if (!form.name.trim())            { toast.error('Name is required'); return }
    if (!form.price || isNaN(+form.price) || +form.price <= 0)
                                       { toast.error('Enter a valid price'); return }
    setSaving(true)
    const { error } = await onSave(form)
    setSaving(false)
    if (error) {
      toast.error((error as { message?: string })?.message ?? 'Save failed')
      return
    }
    toast.success(item ? 'Item updated!' : 'Item added!')
    onClose()
  }

  const previewPrice = form.price && !isNaN(+form.price) && +form.price > 0
    ? discountedPrice(+form.price, +form.offer_percent || 0)
    : null

  const previewEmoji = !isValidUrl(form.image_url) && form.image_url

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="w-full max-w-md bg-surface-50 border border-brand-800/40 rounded-2xl shadow-2xl animate-fade-up pointer-events-auto max-h-[90vh] flex flex-col">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-brand-900/30 shrink-0">
            <h2 className="font-display font-bold text-brand-200 text-lg">
              {item ? 'Edit Item' : 'Add New Item'}
            </h2>
            <button onClick={onClose} className="text-brand-700 hover:text-brand-400 transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* Scrollable body */}
          <div className="overflow-y-auto px-6 py-5 flex flex-col gap-4 flex-1">
            {/* Preview */}
            <div className="flex items-center gap-4 p-4 bg-surface-100/60 border border-brand-900/30 rounded-xl">
              <div className="w-16 h-16 rounded-xl bg-surface-200 flex items-center justify-center overflow-hidden shrink-0">
                {isValidUrl(form.image_url)
                  ? <img src={form.image_url} alt="" className="w-full h-full object-cover" />
                  : <span className="text-3xl">{previewEmoji || '🍽️'}</span>
                }
              </div>
              <div>
                <p className="text-brand-200 font-semibold text-sm">{form.name || 'Item name'}</p>
                <p className="text-brand-700 text-xs mt-0.5 line-clamp-1">{form.description || 'Description'}</p>
                {previewPrice !== null && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-mono font-bold text-brand-300 text-sm">{formatPrice(previewPrice)}</span>
                    {+form.offer_percent > 0 && (
                      <span className="text-xs bg-red-900/30 text-red-400 px-1.5 py-0.5 rounded-full font-mono">
                        -{form.offer_percent}% off
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="label">Name *</label>
              <input
                value={form.name}
                onChange={e => set('name', e.target.value)}
                placeholder="e.g. Margherita Pizza"
                className="input-field"
              />
            </div>

            {/* Description */}
            <div>
              <label className="label">Description</label>
              <textarea
                value={form.description}
                onChange={e => set('description', e.target.value)}
                placeholder="Short, mouth-watering description…"
                rows={2}
                className="input-field resize-none"
              />
            </div>

            {/* Price + Offer */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Price ($) *</label>
                <div className="relative">
                  <DollarSign size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-700" />
                  <input
                    type="number" min="0" step="0.01"
                    value={form.price}
                    onChange={e => set('price', e.target.value)}
                    placeholder="0.00"
                    className="input-field pl-8"
                  />
                </div>
              </div>
              <div>
                <label className="label">Offer (%)</label>
                <div className="relative">
                  <Percent size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-700" />
                  <input
                    type="number" min="0" max="99"
                    value={form.offer_percent}
                    onChange={e => set('offer_percent', e.target.value)}
                    placeholder="0"
                    className="input-field pl-8"
                  />
                </div>
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="label">Category</label>
              <div className="relative">
                <Tag size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-700" />
                <select
                  value={form.category}
                  onChange={e => set('category', e.target.value)}
                  className="input-field pl-8 appearance-none"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            {/* Image */}
            <div>
              <label className="label">Image</label>
              <div className="relative">
                <ImageIcon size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-700" />
                <input
                  value={form.image_url}
                  onChange={e => set('image_url', e.target.value)}
                  placeholder="🍕 emoji  or  https://image-url.com/photo.jpg"
                  className="input-field pl-8"
                />
              </div>
            </div>

            {/* Available toggle */}
            <label className="flex items-center justify-between gap-4 p-3 bg-surface-100/50 border border-brand-900/30 rounded-xl cursor-pointer">
              <span className="text-brand-400 text-sm font-medium">Available for ordering</span>
              <div
                onClick={() => set('available', !form.available)}
                className={`relative w-10 h-5 rounded-full transition-colors ${form.available ? 'bg-brand-500' : 'bg-brand-900'}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${form.available ? 'left-5' : 'left-0.5'}`} />
              </div>
            </label>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-brand-900/30 flex gap-3 shrink-0">
            <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 py-2.5">
              {saving ? 'Saving…' : item ? 'Update Item' : 'Add Item'}
            </button>
            <button onClick={onClose} className="btn-outline px-4">Cancel</button>
          </div>
        </div>
      </div>
    </>
  )
}
