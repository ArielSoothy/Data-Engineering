import { createBrowserClient } from '@supabase/ssr'

export const createClient = () => {
  const url = import.meta.env.VITE_SUPABASE_URL
  const anon = import.meta.env.VITE_SUPABASE_ANON_KEY

  if (url && anon) {
    return createBrowserClient(url, anon)
  }

  // Chainable no-op stub so code like .from('x').select('y').eq('z',v).single()
  // resolves to { data: null, error } without crashing when Supabase is not configured.
  const stubError = new Error('Supabase not configured')
  const noop = () => {}

  type StubResult = { data: null; error: Error }
  const result: StubResult = { data: null, error: stubError }

  const buildChain = (): any => {
    const chain: any = {
      select: () => buildChain(),
      insert: () => buildChain(),
      update: () => buildChain(),
      upsert: () => buildChain(),
      delete: () => buildChain(),
      eq: () => buildChain(),
      neq: () => buildChain(),
      gt: () => buildChain(),
      gte: () => buildChain(),
      lt: () => buildChain(),
      lte: () => buildChain(),
      in: () => buildChain(),
      order: () => buildChain(),
      limit: () => buildChain(),
      single: () => buildChain(),
      maybeSingle: () => buildChain(),
      // Allow await — resolves to stub result
      then: (resolve: (v: StubResult) => void) => Promise.resolve(result).then(resolve),
    }
    return chain
  }

  return {
    auth: {
      getSession: async () => ({ data: { session: null } }),
      onAuthStateChange: (_cb: any) => ({ data: { subscription: { unsubscribe: noop } } }),
      signUp: async () => ({ error: stubError }),
      signInWithPassword: async () => ({ data: { user: null, session: null }, error: stubError }),
      signOut: async () => {}
    },
    from: () => buildChain()
  } as any
}
