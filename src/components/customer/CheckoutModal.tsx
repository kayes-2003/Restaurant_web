import { useEffect, useState } from 'react'
import { X, ShoppingBag, CheckCircle2, AlertCircle } from 'lucide-react'
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import { stripePromise } from '@/lib/stripe'
import { useCheckout } from '@/hooks/useCheckout'
// import type { CartItem } from '@/types'
import type { CheckoutItem } from '@/types'

interface CheckoutModalProps {
  items:   CheckoutItem[]  
  userId:  string
  onClose: () => void
  onPaid:  () => void
}

// ── Inner form (must be inside <Elements>) ──────────────────────────────────
function PaymentForm({
  onPaid,
  onFail,
  confirmPayment,
}: {
  onPaid:          () => void
  onFail:          (msg: string) => void
  confirmPayment:  (s: 'paid' | 'failed') => Promise<void>
}) {
  const stripe   = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!stripe || !elements) return
    setLoading(true)

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    })

    if (error) {
      await confirmPayment('failed')
      onFail(error.message ?? 'Payment failed.')
    } else if (paymentIntent?.status === 'succeeded') {
      await confirmPayment('paid')
      onPaid()
    }

    setLoading(false)
  }

  return (
    <div className="flex flex-col gap-4">
      <PaymentElement />
      <button
        onClick={handleSubmit}
        disabled={loading || !stripe}
        className="btn-primary w-full py-2.5"
      >
        {loading ? 'Processing…' : 'Pay Now'}
      </button>
    </div>
  )
}

// ── Outer modal ─────────────────────────────────────────────────────────────
export function CheckoutModal({ items, userId, onClose, onPaid }: CheckoutModalProps) {
  const { loading, clientSecret, error, initCheckout, confirmPayment, reset } = useCheckout()
  const [paid,    setPaid]    = useState(false)
  const [payErr,  setPayErr]  = useState<string | null>(null)

  const total = items.reduce((s, i) => s + i.price * i.quantity, 0)

  useEffect(() => {
    initCheckout(items, userId)
    return () => reset()
  }, []) // eslint-disable-line

  const handlePaid = () => { setPaid(true); setTimeout(onPaid, 1800) }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md bg-surface-50 border border-brand-800/40 rounded-2xl shadow-2xl animate-fade-up">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-0">
          <div className="flex items-center gap-2">
            <ShoppingBag size={17} className="text-brand-400" />
            <span className="font-display font-bold text-brand-200">Checkout</span>
          </div>
          <button onClick={onClose} className="text-brand-700 hover:text-brand-300 p-1">
            <X size={17} />
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-4">

          {/* Order summary */}
          <div className="bg-surface-100 border border-brand-900/30 rounded-xl p-4 flex flex-col gap-2">
            {items.map(item => (
              <div key={item.id} className="flex justify-between text-sm text-brand-300">
                <span>{item.name} × {item.quantity}</span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t border-brand-800/40 mt-1 pt-2 flex justify-between font-bold text-brand-100">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          {/* States */}
          {paid && (
            <div className="flex flex-col items-center gap-2 py-6 text-green-400">
              <CheckCircle2 size={40} />
              <p className="font-semibold text-lg">Payment successful!</p>
              <p className="text-xs text-brand-600">Your order is confirmed.</p>
            </div>
          )}

          {!paid && payErr && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-900/20 border border-red-800/30 text-red-300 text-xs">
              <AlertCircle size={13} className="mt-0.5 shrink-0" />
              <span>{payErr}</span>
            </div>
          )}

          {!paid && error && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-900/20 border border-red-800/30 text-red-300 text-xs">
              <AlertCircle size={13} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!paid && loading && (
            <div className="flex justify-center py-6">
              <svg className="animate-spin w-6 h-6 text-brand-400" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
            </div>
          )}

          {!paid && !loading && clientSecret && (
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: {
                  theme: 'night',
                  variables: { colorPrimary: '#c9a96e', borderRadius: '8px' },
                },
              }}
            >
              <PaymentForm
                onPaid={handlePaid}
                onFail={setPayErr}
                confirmPayment={confirmPayment}
              />
            </Elements>
          )}
        </div>
      </div>
    </div>
  )
}