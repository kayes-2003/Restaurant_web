import { loadStripe } from '@stripe/stripe-js'

const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY

if (!key) throw new Error('VITE_STRIPE_PUBLISHABLE_KEY is not set')

export const stripePromise = loadStripe(key)