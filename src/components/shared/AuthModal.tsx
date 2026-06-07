import { useState } from 'react'
import {
  X, Mail, Lock, UtensilsCrossed,
  AlertCircle, CheckCircle2, ArrowLeft,
  Eye, EyeOff, RefreshCw,
} from 'lucide-react'
import type { AuthView } from '@/types'

interface AuthModalProps {
  onClose:              () => void
  onAuth:               () => void
  signIn:               (email: string, pass: string) => Promise<string | null>
  signUp:               (email: string, pass: string) => Promise<string | null>
  resendConfirmation:   (email: string) => Promise<string | null>
  sendPasswordReset:    (email: string) => Promise<string | null>
  needsNewPass?:        boolean
  updatePassword:       (newPass: string) => Promise<string | null>
}

// ✅ MOVED OUTSIDE — these are now stable components

const inp = 'input-field'

function EmailField({ email, setEmail, clearMsgs, onEnter }: {
  email: string
  setEmail: (v: string) => void
  clearMsgs: () => void
  onEnter?: () => void
}) {
  return (
    <div>
      <label className="label">Email</label>
      <div className="relative">
        <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-700 pointer-events-none" />
        <input
          type="email"
          value={email}
          onChange={e => { setEmail(e.target.value); clearMsgs() }}
          placeholder="you@example.com"
          autoComplete="email"
          className={`${inp} pl-9`}
          onKeyDown={e => { if (e.key === 'Enter') onEnter?.() }}
        />
      </div>
    </div>
  )
}

function PassField({ label = 'Password', value, onChange, auto = 'current-password', showPass, toggleShow }: {
  label?: string
  value: string
  onChange: (v: string) => void
  auto?: string
  showPass: boolean
  toggleShow: () => void
}) {
  return (
    <div>
      <label className="label">{label}</label>
      <div className="relative">
        <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-700 pointer-events-none" />
        <input
          type={showPass ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="Min. 6 characters"
          autoComplete={auto}
          className={`${inp} pl-9 pr-10`}
        />
        <button type="button" onClick={toggleShow}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-700 hover:text-brand-400">
          {showPass ? <EyeOff size={13} /> : <Eye size={13} />}
        </button>
      </div>
    </div>
  )
}

function Feedback({ okMsg, errMsg }: { okMsg: string; errMsg: string }) {
  return (
    <>
      {okMsg && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-green-900/20 border border-green-800/30 text-green-300 text-xs leading-relaxed">
          <CheckCircle2 size={13} className="mt-0.5 shrink-0" /><span>{okMsg}</span>
        </div>
      )}
      {errMsg && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-red-900/20 border border-red-800/30 text-red-300 text-xs leading-relaxed">
          <AlertCircle size={13} className="mt-0.5 shrink-0" /><span>{errMsg}</span>
        </div>
      )}
    </>
  )
}

function SubmitBtn({ label, onClick, loading }: { label: string; onClick: () => void; loading: boolean }) {
  return (
    <button onClick={onClick} disabled={loading} className="btn-primary w-full py-2.5">
      {loading
        ? <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
            Please wait…
          </span>
        : label
      }
    </button>
  )
}

function BackBtn({ onClick, label = 'Back to Sign In' }: { onClick: () => void; label?: string }) {
  return (
    <button onClick={onClick}
      className="flex items-center gap-1.5 text-xs text-brand-600 hover:text-brand-300 transition-colors">
      <ArrowLeft size={12} /> {label}
    </button>
  )
}

// ✅ Main modal — clean and focused
export function AuthModal({
  onClose, onAuth, signIn, signUp,
  resendConfirmation, sendPasswordReset, updatePassword,
  needsNewPass = false,
}: AuthModalProps) {
  const [view,        setView]      = useState<AuthView>(needsNewPass ? 'update_password' : 'sign_in')
  const [email,       setEmail]     = useState('')
  const [pass,        setPass]      = useState('')
  const [pass2,       setPass2]     = useState('')
  const [showPass,    setShowPass]  = useState(false)
  const [loading,     setLoading]   = useState(false)
  const [errMsg,      setErrMsg]    = useState('')
  const [okMsg,       setOkMsg]     = useState('')
  const [pendingEmail, setPending]  = useState('')

  const clearMsgs = () => { setErrMsg(''); setOkMsg('') }
  const go = (v: AuthView) => { setView(v); clearMsgs(); setPass(''); setPass2('') }

  const handleSignIn = async () => {
    clearMsgs()
    if (!email.trim()) { setErrMsg('Please enter your email.'); return }
    if (!pass)         { setErrMsg('Please enter your password.'); return }
    setLoading(true)
    const result = await signIn(email.trim(), pass)
    setLoading(false)
    if (!result)                          { onAuth(); onClose(); return }
    if (result === 'EMAIL_NOT_CONFIRMED') { setPending(email.trim()); setView('confirm_pending'); return }
    setErrMsg(result)
  }

  const handleSignUp = async () => {
    clearMsgs()
    if (!email.trim())   { setErrMsg('Please enter your email.'); return }
    if (pass.length < 6) { setErrMsg('Password must be at least 6 characters.'); return }
    if (pass !== pass2)  { setErrMsg('Passwords do not match.'); return }
    setLoading(true)
    const result = await signUp(email.trim(), pass)
    setLoading(false)
    if (!result)                   { onAuth(); onClose(); return }
    if (result === 'SMTP_ERROR')   { setErrMsg('Email service not configured. Contact the administrator.'); return }
    if (result === 'CONFIRM_EMAIL') { setPending(email.trim()); setView('confirm_pending'); return }
    setErrMsg(result)
  }

  const handleResend = async () => {
    clearMsgs()
    setLoading(true)
    const err = await resendConfirmation(pendingEmail || email.trim())
    setLoading(false)
    if (err) { setErrMsg(err); return }
    setOkMsg('Confirmation email resent! Check your inbox (and spam folder).')
  }

  const handleForgot = async () => {
    clearMsgs()
    if (!email.trim()) { setErrMsg('Please enter your email.'); return }
    setLoading(true)
    const err = await sendPasswordReset(email.trim())
    setLoading(false)
    if (err) { setErrMsg(err); return }
    setOkMsg('Password reset link sent! Check your email inbox.')
  }

  const handleUpdatePassword = async () => {
    clearMsgs()
    if (pass.length < 6) { setErrMsg('New password must be at least 6 characters.'); return }
    if (pass !== pass2)  { setErrMsg('Passwords do not match.'); return }
    setLoading(true)
    const err = await updatePassword(pass)
    setLoading(false)
    if (err) { setErrMsg(err); return }
    setOkMsg('Password updated successfully!')
    setTimeout(() => { onAuth(); onClose() }, 1500)
  }

  const titles: Record<AuthView, string> = {
    sign_in: 'Sign In', sign_up: 'Create Account',
    confirm_pending: 'Check Your Email',
    forgot_password: 'Reset Password',
    update_password: 'Set New Password',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-surface-50 border border-brand-800/40 rounded-2xl shadow-2xl animate-fade-up">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-0">
          <div className="flex items-center gap-2">
            <UtensilsCrossed size={17} className="text-brand-400" />
            <span className="font-display font-bold text-brand-200">{titles[view]}</span>
          </div>
          <button onClick={onClose} className="text-brand-700 hover:text-brand-300 transition-colors p-1">
            <X size={17} />
          </button>
        </div>

        {/* Tabs */}
        {(view === 'sign_in' || view === 'sign_up') && (
          <div className="flex gap-1 mx-6 mt-4 bg-surface-100 border border-brand-900/40 rounded-lg p-1">
            {(['sign_in', 'sign_up'] as AuthView[]).map(v => (
              <button key={v} onClick={() => go(v)}
                className={`flex-1 py-2 rounded text-sm font-semibold transition-all ${
                  view === v ? 'bg-brand-500 text-surface shadow' : 'text-brand-600 hover:text-brand-300'
                }`}>
                {v === 'sign_in' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>
        )}

        <div className="px-6 py-5 flex flex-col gap-3">
          <Feedback okMsg={okMsg} errMsg={errMsg} />

          {/* ── SIGN IN ── */}
          {view === 'sign_in' && (
            <>
              <EmailField email={email} setEmail={setEmail} clearMsgs={clearMsgs} onEnter={handleSignIn} />
              <PassField value={pass} onChange={v => { setPass(v); clearMsgs() }} showPass={showPass} toggleShow={() => setShowPass(p => !p)} />
              <button onClick={() => go('forgot_password')}
                className="text-right text-xs text-brand-600 hover:text-brand-300 transition-colors -mt-1">
                Forgot password?
              </button>
              <SubmitBtn label="Sign In" onClick={handleSignIn} loading={loading} />
              <p className="text-center text-xs text-brand-800">
                No account?{' '}
                <button onClick={() => go('sign_up')} className="text-brand-500 hover:text-brand-300 underline underline-offset-2">Sign up</button>
              </p>
            </>
          )}

          {/* ── SIGN UP ── */}
          {view === 'sign_up' && (
            <>
              <EmailField email={email} setEmail={setEmail} clearMsgs={clearMsgs} />
              <PassField label="Password" value={pass} onChange={v => { setPass(v); clearMsgs() }} auto="new-password" showPass={showPass} toggleShow={() => setShowPass(p => !p)} />
              <PassField label="Confirm Password" value={pass2} onChange={v => { setPass2(v); clearMsgs() }} auto="new-password" showPass={showPass} toggleShow={() => setShowPass(p => !p)} />
              <SubmitBtn label="Create Account" onClick={handleSignUp} loading={loading} />
              <p className="text-center text-xs text-brand-800">
                Already have an account?{' '}
                <button onClick={() => go('sign_in')} className="text-brand-500 hover:text-brand-300 underline underline-offset-2">Sign in</button>
              </p>
            </>
          )}

          {/* ── CONFIRM PENDING ── */}
          {view === 'confirm_pending' && (
            <>
              <div className="text-center py-3">
                <div className="text-5xl mb-3">📧</div>
                <p className="text-brand-200 text-sm font-semibold mb-1">Confirmation email sent</p>
                <p className="text-brand-700 text-xs leading-relaxed">
                  We sent a confirmation link to<br />
                  <strong className="text-brand-400">{pendingEmail || email}</strong><br />
                  Click the link, then come back and sign in.
                </p>
              </div>
              <div className="flex flex-col gap-2 mt-1">
                <button onClick={handleResend} disabled={loading}
                  className="btn-outline w-full py-2 flex items-center justify-center gap-2 text-sm">
                  <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
                  Resend confirmation email
                </button>
                <BackBtn onClick={() => go('sign_in')} />
              </div>
            </>
          )}

          {/* ── FORGOT PASSWORD ── */}
          {view === 'forgot_password' && (
            <>
              <p className="text-brand-700 text-xs leading-relaxed -mt-1">
                Enter your email and we'll send you a password reset link.
              </p>
              <EmailField email={email} setEmail={setEmail} clearMsgs={clearMsgs} onEnter={handleForgot} />
              <SubmitBtn label="Send Reset Link" onClick={handleForgot} loading={loading} />
              <BackBtn onClick={() => go('sign_in')} />
            </>
          )}

          {/* ── UPDATE PASSWORD ── */}
          {view === 'update_password' && (
            <>
              <p className="text-brand-700 text-xs leading-relaxed -mt-1">
                Choose a new password for your account.
              </p>
              <PassField label="New Password" value={pass} onChange={v => { setPass(v); clearMsgs() }} auto="new-password" showPass={showPass} toggleShow={() => setShowPass(p => !p)} />
              <PassField label="Confirm New Password" value={pass2} onChange={v => { setPass2(v); clearMsgs() }} auto="new-password" showPass={showPass} toggleShow={() => setShowPass(p => !p)} />
              <SubmitBtn label="Update Password" onClick={handleUpdatePassword} loading={loading} />
            </>
          )}
        </div>
      </div>
    </div>
  )
}