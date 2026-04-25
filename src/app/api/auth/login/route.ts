import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
        return NextResponse.json({ error: 'email e password são obrigatórios' }, { status: 400 })
    }

    const supabase = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { auth: { persistSession: false, autoRefreshToken: false } }
    )

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 401 })
    }

    return NextResponse.json({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_in: data.session.expires_in,
        user: {
            id: data.user.id,
            email: data.user.email,
        },
    })
}
