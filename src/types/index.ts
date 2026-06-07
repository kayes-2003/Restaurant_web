// ─── Database row types ───────────────────────────────────────────────────────

export interface Profile {
  id: string
  email: string
  role: 'admin' | 'customer'
  created_at: string
}

export interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  category: string
  image_url: string
  offer_percent: number
  available: boolean
  created_at: string
}

export interface CartItem {
  id: string
  user_id: string
  menu_item_id: string
  quantity: number
  created_at: string
  menu_items: MenuItem
}

// ─── App-layer types ──────────────────────────────────────────────────────────

export type Category = 'All' | 'Pizza' | 'Burgers' | 'Salads' | 'Pasta' | 'Drinks' | 'Desserts'

export interface CartSummary {
  items: CartItem[]
  count: number
  total: number
}

export interface MenuItemFormData {
  name: string
  description: string
  price: string
  category: string
  image_url: string
  offer_percent: string
  available: boolean
}

// ─── Auth flow ────────────────────────────────────────────────────────────────

export type AuthView =
  | 'sign_in'
  | 'sign_up'
  | 'confirm_pending'   // waiting for email confirmation
  | 'forgot_password'   // enter email to get reset link
  | 'update_password'   // enter new password (after clicking reset link)




  export type OrderStatus = 'pending' | 'paid' | 'failed' | 'cancelled'

export interface Order {
  id:         string
  user_id:    string
  items:      CartItem[]
  total:      number
  status:     OrderStatus
  created_at: string
}

export interface CartItem {
  id:       string
  name:     string
  price:    number
  quantity: number
}


// Add this — separate from your existing CartItem
export interface CheckoutItem {
  id:       string
  name:     string
  price:    number
  quantity: number
}