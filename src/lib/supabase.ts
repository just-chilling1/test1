import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? ''
const isProductionBuild = process.env.NEXT_PHASE === 'phase-production-build'

const resolvedUrl =
  supabaseUrl ||
  (isProductionBuild ? 'https://placeholder.supabase.co' : '')
const resolvedKey =
  supabaseAnonKey ||
  (isProductionBuild ? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder' : '')

if (!supabaseUrl || !supabaseAnonKey) {
  if (typeof window === 'undefined' && !isProductionBuild) {
    console.error('CRITICAL: Missing Supabase environment variables on server side')
  }
}

export const supabase = createBrowserClient(resolvedUrl, resolvedKey)
