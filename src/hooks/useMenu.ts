import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { MenuItem, MenuItemFormData } from '@/types'

export function useMenu() {
  const [items, setItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .order('category')
      .order('name')
    if (!error && data) setItems(data as MenuItem[])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const addItem = async (form: MenuItemFormData) => {
    const { error } = await supabase.from('menu_items').insert({
      name:          form.name.trim(),
      description:   form.description.trim(),
      price:         parseFloat(form.price),
      category:      form.category,
      image_url:     form.image_url.trim() || '🍽️',
      offer_percent: parseInt(form.offer_percent) || 0,
      available:     form.available,
    })
    if (!error) await load()
    return { error }
  }

  const updateItem = async (id: string, form: MenuItemFormData) => {
    const { error } = await supabase
      .from('menu_items')
      .update({
        name:          form.name.trim(),
        description:   form.description.trim(),
        price:         parseFloat(form.price),
        category:      form.category,
        image_url:     form.image_url.trim() || '🍽️',
        offer_percent: parseInt(form.offer_percent) || 0,
        available:     form.available,
      })
      .eq('id', id)
    if (!error) await load()
    return { error }
  }

  const deleteItem = async (id: string) => {
    const { error } = await supabase.from('menu_items').delete().eq('id', id)
    if (!error) await load()
    return { error }
  }

  return { items, loading, reload: load, addItem, updateItem, deleteItem }
}
