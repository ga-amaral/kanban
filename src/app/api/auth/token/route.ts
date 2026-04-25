import { NextRequest, NextResponse } from 'next/server'
import { createHash, randomBytes } from 'crypto'
import { getSupabaseWithUser } from '@/lib/supabase/api-auth'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

function hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex')
}

function makeAdminClient() {
    return createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false, autoRefreshToken: false } }
    )
}

// GET /api/auth/token — list all tokens for the authenticated user
export async function GET(request: NextRequest) {
    const { supabase, user } = await getSupabaseWithUser(request)

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
        .from('api_tokens')
        .select('id, name, created_at, last_used_at, revoked_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
}

// POST /api/auth/token — create a new permanent token
export async function POST(request: NextRequest) {
    const { supabase, user } = await getSupabaseWithUser(request)

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const name = body.name || 'Token'

    const rawToken = 'ak_' + randomBytes(32).toString('hex')
    const tokenHash = hashToken(rawToken)

    const { data, error } = await supabase
        .from('api_tokens')
        .insert([{ user_id: user.id, name, token_hash: tokenHash }])
        .select('id, name, created_at')
        .single()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Return the raw token only once — it cannot be retrieved again
    return NextResponse.json({ ...data, token: rawToken })
}

// DELETE /api/auth/token?id=TOKEN_ID — revoke a token
export async function DELETE(request: NextRequest) {
    const { supabase, user } = await getSupabaseWithUser(request)

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
        return NextResponse.json({ error: 'id é obrigatório' }, { status: 400 })
    }

    const { error } = await supabase
        .from('api_tokens')
        .update({ revoked_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
}
