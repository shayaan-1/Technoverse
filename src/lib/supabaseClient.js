import { createBrowserClient } from '@supabase/ssr'

let supabase = null

export function createClient() {
  if (!supabase) {
    supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
  }
  return supabase
}

export const supabaseClient = createClient()