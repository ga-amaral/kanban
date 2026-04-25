import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'
import { createHash } from 'crypto'
import { createClient } from './server'

function hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex')
}

function makeServiceClient() {
    return createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false, autoRefreshToken: false } }
    )
}

/**
 * Returns a Supabase client and the authenticated user.
 * Priority:
 *   1. Permanent API key  (Authorization: Bearer ak_...)
 *   2. Supabase JWT       (Authorization: Bearer eyJ...)
 *   3. Cookie session     (browser)
 */
export async function getSupabaseWithUser(request: NextRequest) {
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

    // --- Permanent API key (ak_...) ---
    if (token?.startsWith('ak_')) {
        const admin = makeServiceClient()
        const tokenHash = hashToken(token)

        const { data: userId } = await admin.rpc('get_user_by_api_token', {
            p_token_hash: tokenHash,
        })

        if (!userId) {
            return { supabase: admin, user: null }
        }

        // Update last_used_at without awaiting (fire & forget)
        admin.rpc('touch_api_token', { p_token_hash: tokenHash }).then(() => {})

        const { data: { user } } = await admin.auth.admin.getUserById(userId)

        // Create a client scoped to this user via impersonation header
        const userClient = createSupabaseClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            {
                global: { headers: { 'x-user-id': userId } },
                auth: { persistSession: false, autoRefreshToken: false },
            }
        ) as any

        return { supabase: userClient, user }
    }

    // --- Supabase JWT ---
    if (token) {
        const supabase = createSupabaseClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                global: { headers: { Authorization: `Bearer ${token}` } },
                auth: { persistSession: false, autoRefreshToken: false },
            }
        ) as any

        const { data: { user } } = await supabase.auth.getUser(token)
        return { supabase, user }
    }

    // --- Cookie session (browser) ---
    const supabase = createClient() as any
    const { data: { user } } = await supabase.auth.getUser()
    return { supabase, user }
}
