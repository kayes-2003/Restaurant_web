import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Profile } from '@/types'

interface AuthState {
  uid:          string | null
  profile:      Profile | null
  loading:      boolean
  isAdmin:      boolean
  needsNewPass: boolean
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    uid: null, profile: null, loading: true, isAdmin: false, needsNewPass: false,
  })

  const fetchProfile = useCallback(async (uid: string) => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('id, email, role, created_at')
        .eq('id', uid)
        .limit(1)

      const profile = data && data.length > 0 ? data[0] as Profile : null
      setState(s => ({
        ...s, loading: false, profile,
        isAdmin: profile?.role === 'admin',
      }))
    } catch {
      setState(s => ({ ...s, loading: false }))
    }
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setState(s => ({ ...s, uid: session.user.id }))
        fetchProfile(session.user.id)
      } else {
        setState(s => ({ ...s, loading: false }))
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'PASSWORD_RECOVERY') {
          setState(s => ({ ...s, needsNewPass: true, loading: false }))
          return
        }
        if (session?.user) {
          setState(s => ({ ...s, uid: session.user.id, needsNewPass: false }))
          fetchProfile(session.user.id)
        } else {
          setState({ uid: null, profile: null, loading: false, isAdmin: false, needsNewPass: false })
        }
      }
    )
    return () => subscription.unsubscribe()
  }, [fetchProfile])

  const signIn = async (email: string, password: string): Promise<string | null> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (!error) return null
    const m = error.message.toLowerCase()
    if (m.includes('invalid login') || m.includes('invalid credentials'))
      return 'Wrong email or password.'
    if (m.includes('not confirmed'))
      return 'EMAIL_NOT_CONFIRMED'
    if (m.includes('user not found'))
      return 'No account found. Please sign up first.'
    return error.message
  }

  const signUp = async (email: string, password: string): Promise<string | null> => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: 'http://localhost:5173',
      },
    })
    if (error) {
      const m = error.message.toLowerCase()
      if (m.includes('already registered'))
        return 'Account already exists. Please sign in.'
      if (m.includes('sending') || m.includes('smtp') || m.includes('500'))
        return 'SMTP_ERROR'
      return error.message
    }
    if (data.user && !data.session) return 'CONFIRM_EMAIL'
    return null
  }

  const resendConfirmation = async (email: string): Promise<string | null> => {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: { emailRedirectTo: 'http://localhost:5173' },
    })
    if (!error) return null
    if (error.message.toLowerCase().includes('rate'))
      return 'Please wait 60 seconds before requesting another email.'
    return error.message
  }

  const sendPasswordReset = async (email: string): Promise<string | null> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'http://localhost:5173',
    })
    return error ? error.message : null
  }

  const updatePassword = async (newPassword: string): Promise<string | null> => {
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (!error) { setState(s => ({ ...s, needsNewPass: false })); return null }
    return error.message
  }

  const signOut = () => supabase.auth.signOut()

  return {
    ...state,
    signIn, signUp, signOut,
    resendConfirmation, sendPasswordReset, updatePassword,
  }
}