import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'
import { createClient } from './server'

/**
 * Returns a Supabase client and the authenticated user.
 * Supports both cookie-based auth (browser) and Bearer token auth (HTTP API calls).
 */
export async function getSupabaseWithUser(request: NextRequest) {
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

    if (token) {
        const supabase = createSupabaseClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                global: { headers: { Authorization: `Bearer ${token}` } },
                auth: { persistSession: false, autoRefreshToken: false },
            }
        ) as any

        const {
            data: { user },
        } = await supabase.auth.getUser(token)

        return { supabase, user }
    }

    // Fall back to cookie-based auth
    const supabase = createClient() as any
    const {
        data: { user },
    } = await supabase.auth.getUser()

    return { supabase, user }
}
