import { ShoppingCart, LogOut, Crown, UtensilsCrossed, Menu, X, LayoutDashboard } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { Profile } from '@/types'

interface HeaderProps {
  profile:       Profile | null
  cartCount:     number
  onSignIn:      () => void
  onCartOpen:    () => void
  onSignOut:     () => void
  onAdminPanel?: () => void
  activeView?:   string
}

export function Header({
  profile, cartCount, onSignIn, onCartOpen, onSignOut, onAdminPanel, activeView,
}: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const isAdmin = profile?.role === 'admin'

  return (
    <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur-md border-b border-brand-900/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="h-16 flex items-center justify-between gap-4">

          {/* Logo */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-brand-600/20 border border-brand-700/40 flex items-center justify-center">
              <UtensilsCrossed size={17} className="text-brand-400" />
            </div>
            <div className="hidden sm:block">
              <p className="font-display font-bold text-brand-200 leading-tight">La Maison</p>
              <p className="text-brand-800 text-[10px] tracking-widest uppercase leading-none">Fine Dining</p>
            </div>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-2">
            {profile ? (
              <>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-100 border border-brand-900/30">
                  {isAdmin && <Crown size={11} className="text-brand-400" />}
                  <span className="text-brand-400 text-xs font-medium">
                    {profile.email.split('@')[0]}
                  </span>
                  <span className={cn(
                    'text-[10px] px-1.5 py-0.5 rounded-full font-mono',
                    isAdmin ? 'bg-brand-800/60 text-brand-300' : 'bg-surface-200 text-brand-600'
                  )}>
                    {profile.role}
                  </span>
                </div>

                {isAdmin && (
                  <button onClick={onAdminPanel}
                    className={cn('btn-outline text-xs flex items-center gap-1.5',
                      activeView === 'admin' && 'bg-brand-800/40 border-brand-600 text-brand-200')}>
                    <LayoutDashboard size={13} />
                    {activeView === 'admin' ? 'View Menu' : 'Admin Panel'}
                  </button>
                )}

                {!isAdmin && (
                  <button onClick={onCartOpen} className="btn-primary relative">
                    <ShoppingCart size={14} /> Cart
                    {cartCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold min-w-[17px] px-1 h-[17px] rounded-full flex items-center justify-center">
                        {cartCount}
                      </span>
                    )}
                  </button>
                )}

                <button onClick={onSignOut}
                  className="p-2 rounded-lg text-brand-700 hover:text-red-400 hover:bg-red-900/20 transition-all">
                  <LogOut size={15} />
                </button>
              </>
            ) : (
              <button onClick={onSignIn} className="btn-primary">Sign In</button>
            )}
          </div>

          {/* Mobile right side */}
          <div className="md:hidden flex items-center gap-2">
            {profile && !isAdmin && (
              <button onClick={onCartOpen} className="relative p-2 text-brand-400">
                <ShoppingCart size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
            )}
            <button onClick={() => setMobileOpen(o => !o)} className="p-2 text-brand-400">
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-brand-900/30 bg-surface-50 animate-fade-up">
          <div className="px-4 py-3 flex flex-col gap-2">
            {profile ? (
              <>
                <div className="flex items-center gap-2 py-2 border-b border-brand-900/20 mb-1">
                  {isAdmin && <Crown size={12} className="text-brand-400" />}
                  <span className="text-brand-300 text-sm flex-1">{profile.email}</span>
                  <span className={cn('text-xs px-2 py-0.5 rounded-full',
                    isAdmin ? 'bg-brand-800/50 text-brand-300' : 'bg-surface-100 text-brand-600')}>
                    {profile.role}
                  </span>
                </div>
                {isAdmin && (
                  <button onClick={() => { onAdminPanel?.(); setMobileOpen(false) }}
                    className="btn-outline w-full justify-center gap-2">
                    <LayoutDashboard size={14} />
                    {activeView === 'admin' ? 'View Menu' : 'Admin Panel'}
                  </button>
                )}
                <button onClick={() => { onSignOut(); setMobileOpen(false) }}
                  className="btn-ghost w-full justify-center text-red-600 hover:text-red-400">
                  <LogOut size={14} /> Sign Out
                </button>
              </>
            ) : (
              <button onClick={() => { onSignIn(); setMobileOpen(false) }}
                className="btn-primary w-full justify-center">
                Sign In
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
