import { useState } from 'react'
import { supabase } from '@/lib/supabase'
// import type { CartItem } from '@/types'
import type { CheckoutItem } from '@/types'

export function useCheckout() {
  const [loading,       setLoading]       = useState(false)
  const [clientSecret,  setClientSecret]  = useState<string | null>(null)
  const [orderId,       setOrderId]       = useState<string | null>(null)
  const [error,         setError]         = useState<string | null>(null)

  const initCheckout = async (items: CheckoutItem[], userId: string) => {
    setLoading(true)
    setError(null)

    try {
      const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

      // 1. Create order in Supabase
      const { data: order, error: orderErr } = await supabase
        .from('orders')
        .insert({ user_id: userId, items, total, status: 'pending' })
        .select()
        .single()

      if (orderErr) throw new Error(orderErr.message)

      setOrderId(order.id)

      // 2. Call Edge Function to create PaymentIntent
      const { data, error: fnErr } = await supabase.functions.invoke('create-payment-intent', {
        body: { amount: Math.round(total * 100), orderId: order.id },
      })

      if (fnErr) throw new Error(fnErr.message)
      if (data.error) throw new Error(data.error)

      setClientSecret(data.clientSecret)

    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const confirmPayment = async (status: 'paid' | 'failed') => {
    if (!orderId) return
    await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)
  }

  const reset = () => {
    setClientSecret(null)
    setOrderId(null)
    setError(null)
  }

  return { loading, clientSecret, orderId, error, initCheckout, confirmPayment, reset }
}