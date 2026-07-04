import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

// Adopt a session handed off from Staff Hub via the URL fragment
// (#at=<access_token>&rt=<refresh_token>). Runs once before we read the session.
async function adoptHandoffSession() {
  const hash = window.location.hash || ''
  if (!hash.includes('at=')) return
  const params = new URLSearchParams(hash.replace(/^#/, ''))
  const access_token = params.get('at')
  const refresh_token = params.get('rt')
  // Scrub the tokens from the URL immediately, regardless of outcome.
  history.replaceState(null, '', window.location.pathname + window.location.search)
  if (access_token && refresh_token) {
    try { await supabase.auth.setSession({ access_token, refresh_token }) } catch { /* ignore */ }
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let unsub = () => {}

    adoptHandoffSession().then(() => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setUser(session?.user ?? null)
        if (session?.user) fetchProfile(session.user)
        else setLoading(false)
      })

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) fetchProfile(session.user)
        else { setProfile(null); setLoading(false) }
      })
      unsub = () => subscription.unsubscribe()
    })

    return () => unsub()
  }, [])

  // Read-only. Profiles are created by the Staff Hub (P66) signup trigger; we never insert here.
  async function fetchProfile(authUser) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single()
    setProfile(data ?? null)
    setLoading(false)
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
