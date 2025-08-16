import { createBrowserClient } from '@supabase/ssr'

export const createClient = () => {
  const url = import.meta.env.VITE_SUPABASE_URL
  const anon = import.meta.env.VITE_SUPABASE_ANON_KEY

  if (url && anon) {
    return createBrowserClient(url, anon)
  }

  // Minimal no-op stub to avoid crashes when Supabase not configured
  const noop = () => {}
  const rejection = (msg = 'Supabase not configured') => ({ error: new Error(msg) })

  return {
    auth: {
      getSession: async () => ({ data: { session: null } }),
      onAuthStateChange: (_cb: any) => ({ data: { subscription: { unsubscribe: noop } } }),
      signUp: async () => rejection(),
      signInWithPassword: async () => ({ data: { user: null, session: null }, error: new Error('Supabase not configured') }),
      signOut: async () => {}
    },
    from: (_table: string) => ({
      select: () => ({ data: null, error: new Error('Supabase not configured') }),
      insert: () => ({ error: new Error('Supabase not configured') }),
      update: () => ({ error: new Error('Supabase not configured') })
    })
  } as any
}
