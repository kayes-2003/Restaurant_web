import { useState, useEffect } from 'react'
import { useAuth }    from '@/hooks/useAuth'
import { useMenu }    from '@/hooks/useMenu'
import { useCart }    from '@/hooks/useCart'
import { Header }     from '@/components/shared/Header'
import { MenuPage }   from '@/pages/MenuPage'
import { AdminPage }  from '@/pages/AdminPage'
import { AuthModal }  from '@/components/shared/AuthModal'
import { CartDrawer } from '@/components/customer/CartDrawer'
import { Loader }     from '@/components/shared/Loader'

type View = 'menu' | 'admin'

export default function App() {
  const auth = useAuth()
  const menu = useMenu()
  const cart = useCart(auth.uid)

  const [view,     setView]     = useState<View>('menu')
  const [showAuth, setShowAuth] = useState(false)
  const [showCart, setShowCart] = useState(false)

  // Auto-open auth modal when user arrives via password-reset link
  useEffect(() => {
    if (auth.needsNewPass) setShowAuth(true)
  }, [auth.needsNewPass])

  // If user signs out while on admin, return to menu
  useEffect(() => {
    if (!auth.uid) { setView('menu'); setShowCart(false) }
  }, [auth.uid])

  const handleSignOut = async () => {
    await auth.signOut()
  }

  const handleAddToCart = async (menuItemId: string) => {
    if (!auth.uid) { setShowAuth(true); return }
    await cart.addToCart(menuItemId)
  }

  if (auth.loading) return <Loader />

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        profile={auth.profile}
        cartCount={cart.summary.count}
        onSignIn={() => setShowAuth(true)}
        onCartOpen={() => setShowCart(true)}
        onSignOut={handleSignOut}
        onAdminPanel={() => setView(v => v === 'admin' ? 'menu' : 'admin')}
        activeView={view}
      />

      <main className="flex-1">
        {view === 'admin' && auth.isAdmin
          ? <AdminPage
              items={menu.items}
              loading={menu.loading}
              onAdd={menu.addItem}
              onUpdate={menu.updateItem}
              onDelete={menu.deleteItem}
            />
          : <MenuPage
              items={menu.items}
              loading={menu.loading}
              cartItemIds={cart.summary.items.map(i => i.menu_item_id)}
              onAddToCart={handleAddToCart}
            />
        }
      </main>

      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          onAuth={() => setShowAuth(false)}
          signIn={auth.signIn}
          signUp={auth.signUp}
          resendConfirmation={auth.resendConfirmation}
          sendPasswordReset={auth.sendPasswordReset}
          updatePassword={auth.updatePassword}
          needsNewPass={auth.needsNewPass}
        />
      )}

      {showCart && !auth.isAdmin && (
        <CartDrawer
          summary={cart.summary}
          onClose={() => setShowCart(false)}
          onRemove={cart.removeFromCart}
          onUpdateQty={cart.updateQuantity}
          onClear={cart.clearCart}
        />
      )}
    </div>
  )
}
