import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { discountedPrice } from '@/lib/utils'
import type { CartItem, CartSummary } from '@/types'

export function useCart(uid: string | null) {
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    if (!uid) { setItems([]); return }
    setLoading(true)
    const { data, error } = await supabase
      .from('cart_items')
      .select('*, menu_items(*)')
      .eq('user_id', uid)
      .order('created_at')
    if (!error && data) setItems(data as CartItem[])
    setLoading(false)
  }, [uid])

  useEffect(() => { load() }, [load])

  const addToCart = async (menuItemId: string) => {
    if (!uid) return { error: new Error('Not authenticated') }
    const existing = items.find(i => i.menu_item_id === menuItemId)
    let error = null
    if (existing) {
      const res = await supabase
        .from('cart_items')
        .update({ quantity: existing.quantity + 1 })
        .eq('id', existing.id)
      error = res.error
    } else {
      const res = await supabase.from('cart_items').insert({
        user_id: uid, menu_item_id: menuItemId, quantity: 1,
      })
      error = res.error
    }
    if (!error) await load()
    return { error }
  }

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    if (quantity < 1) return removeFromCart(cartItemId)
    const { error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', cartItemId)
    if (!error) await load()
  }

  const removeFromCart = async (cartItemId: string) => {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', cartItemId)
    if (!error) await load()
  }

  const clearCart = async () => {
    if (!uid) return
    await supabase.from('cart_items').delete().eq('user_id', uid)
    setItems([])
  }

  const summary: CartSummary = {
    items,
    count: items.reduce((s, i) => s + i.quantity, 0),
    total: items.reduce((s, i) =>
      s + discountedPrice(i.menu_items.price, i.menu_items.offer_percent) * i.quantity, 0),
  }

  return { summary, loading, reload: load, addToCart, updateQuantity, removeFromCart, clearCart }
}
