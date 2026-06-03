// ─── Price helpers ────────────────────────────────────────────────────────────

export const discountedPrice = (price: number, offerPercent: number): number =>
  offerPercent > 0 ? price * (1 - offerPercent / 100) : price

export const formatPrice = (amount: number): string =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)

// ─── String helpers ───────────────────────────────────────────────────────────

export const truncate = (str: string, len: number): string =>
  str.length > len ? str.slice(0, len) + '…' : str

export const initials = (email: string): string =>
  email.split('@')[0].slice(0, 2).toUpperCase()

// ─── Validation ───────────────────────────────────────────────────────────────

export const isValidUrl = (s: string): boolean => {
  try { new URL(s); return true } catch { return false }
}

export const isEmoji = (s: string): boolean => /^\p{Emoji}/u.test(s)

// ─── Class merge ─────────────────────────────────────────────────────────────

export const cn = (...classes: (string | undefined | false | null)[]): string =>
  classes.filter(Boolean).join(' ')
