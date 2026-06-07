import { useState } from 'react'
import { X, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react'
import { discountedPrice, formatPrice, isValidUrl } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { CartSummary } from '@/types'
import { CheckoutModal } from './CheckoutModal'

interface CartDrawerProps {
  summary:     CartSummary
  userId:      string          // ← add this
  onClose:     () => void
  onRemove:    (cartItemId: string) => void
  onUpdateQty: (cartItemId: string, qty: number) => void
  onClear:     () => void
}

export function CartDrawer({ summary, userId, onClose, onRemove, onUpdateQty, onClear }: CartDrawerProps) {
  const [showCheckout, setShowCheckout] = useState(false)

  const handlePaid = () => {
    setShowCheckout(false)
    onClear()
    onClose()
    toast.success('Payment successful! Your order is confirmed 🎉')
  }

  // Map CartSummary items → CheckoutModal's CartItem shape
  const checkoutItems = summary.items.map(ci => ({
    id:       ci.id,
    name:     ci.menu_items.name,
    price:    discountedPrice(ci.menu_items.price, ci.menu_items.offer_percent),
    quantity: ci.quantity,
  }))

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-sm flex flex-col bg-surface-50 border-l border-brand-800/30 shadow-2xl animate-slide-in">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-brand-900/30">
          <div className="flex items-center gap-2">
            <ShoppingBag size={18} className="text-brand-400" />
            <h2 className="font-display font-bold text-brand-200 text-lg">Your Cart</h2>
            {summary.count > 0 && (
              <span className="bg-brand-800/50 text-brand-400 text-xs px-2 py-0.5 rounded-full font-mono">
                {summary.count}
              </span>
            )}
          </div>
          <button onClick={onClose} className="text-brand-700 hover:text-brand-400 transition-colors p-1">
            <X size={18} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {summary.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-brand-800 py-16">
              <span className="text-6xl opacity-40">🛒</span>
              <p className="font-display text-lg text-brand-600">Cart is empty</p>
              <p className="text-sm">Add something delicious!</p>
            </div>
          ) : (
            summary.items.map(ci => {
              const price    = discountedPrice(ci.menu_items.price, ci.menu_items.offer_percent)
              const hasImage = isValidUrl(ci.menu_items.image_url)
              return (
                <div
                  key={ci.id}
                  className="flex gap-3 bg-surface-100/60 border border-brand-900/30 rounded-xl p-3"
                >
                  {/* Thumbnail */}
                  <div className="w-12 h-12 rounded-lg bg-surface-200 flex items-center justify-center overflow-hidden shrink-0">
                    {hasImage
                      ? <img src={ci.menu_items.image_url} alt={ci.menu_items.name} className="w-full h-full object-cover" />
                      : <span className="text-2xl">{ci.menu_items.image_url}</span>
                    }
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-brand-200 text-sm font-semibold truncate">{ci.menu_items.name}</p>
                    <p className="text-brand-600 text-xs font-mono">{formatPrice(price)} each</p>

                    {/* Qty controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => onUpdateQty(ci.id, ci.quantity - 1)}
                        className="w-6 h-6 rounded-full bg-brand-900/50 hover:bg-brand-800/60 text-brand-300 flex items-center justify-center transition-colors"
                      >
                        <Minus size={10} />
                      </button>
                      <span className="text-brand-200 text-sm font-mono w-5 text-center">{ci.quantity}</span>
                      <button
                        onClick={() => onUpdateQty(ci.id, ci.quantity + 1)}
                        className="w-6 h-6 rounded-full bg-brand-900/50 hover:bg-brand-800/60 text-brand-300 flex items-center justify-center transition-colors"
                      >
                        <Plus size={10} />
                      </button>
                    </div>
                  </div>

                  {/* Subtotal + remove */}
                  <div className="flex flex-col items-end justify-between shrink-0">
                    <span className="font-mono font-bold text-brand-300 text-sm">
                      {formatPrice(price * ci.quantity)}
                    </span>
                    <button
                      onClick={() => onRemove(ci.id)}
                      className="text-red-700/60 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Footer */}
        {summary.items.length > 0 && (
          <div className="px-5 py-4 border-t border-brand-900/30 bg-surface space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-brand-600 text-sm">Total</span>
              <span className="font-mono font-bold text-brand-200 text-xl">
                {formatPrice(summary.total)}
              </span>
            </div>
            <button
              onClick={() => setShowCheckout(true)}
              className="btn-primary w-full py-3 text-base"
            >
              Checkout · {formatPrice(summary.total)}
            </button>
            <button onClick={onClear} className="btn-ghost w-full text-brand-700 hover:text-red-400 text-xs">
              Clear cart
            </button>
          </div>
        )}
      </div>

      {/* Checkout Modal — rendered outside drawer so z-index is clean */}
      {showCheckout && (
        <CheckoutModal
          items={checkoutItems}
          userId={userId}
          onClose={() => setShowCheckout(false)}
          onPaid={handlePaid}
        />
      )}
    </>
  )
}