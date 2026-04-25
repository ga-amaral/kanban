import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { Database } from '@/types/database'
import { SupabaseClient } from '@supabase/supabase-js'

// Middleware de sessão com proteção de rotas e verificação de role/status
export async function updateSession(request: NextRequest) {
    try {
        let supabaseResponse = NextResponse.next({
            request,
        })

        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
            console.error('Middleware Error: Missing Supabase environment variables.')
            return supabaseResponse
        }

        const supabase = createServerClient<Database, "public">(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            {
                cookies: {
                    getAll() {
                        return request.cookies.getAll()
                    },
                    setAll(cookiesToSet: Array<{ name: string; value: string; options: Record<string, unknown> }>) {
                        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                        supabaseResponse = NextResponse.next({
                            request,
                        })
                        cookiesToSet.forEach(({ name, value, options }) =>
                            supabaseResponse.cookies.set(name, value, options)
                        )
                    },
                },
            }
        ) as unknown as SupabaseClient<Database, "public", any>

        // Proteger rotas
        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (
            !user &&
            !request.nextUrl.pathname.startsWith('/login') &&
            !request.nextUrl.pathname.startsWith('/auth') &&
            !request.nextUrl.pathname.startsWith('/api')
        ) {
            const url = request.nextUrl.clone()
            url.pathname = '/login'
            return NextResponse.redirect(url)
        }

        // Se logado, checar role e status
        if (user) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('role, status, active')
                .eq('id', user.id)
                .single()

            // Bloquear usuário (checar tanto 'status' quanto 'active')
            const isBlocked = profile?.status === 'blocked' || profile?.active === false
            if (isBlocked && !request.nextUrl.pathname.startsWith('/blocked')) {
                const url = request.nextUrl.clone()
                url.pathname = '/blocked'
                return NextResponse.redirect(url)
            }

            // Proteger rota /admin
            if (request.nextUrl.pathname.startsWith('/admin') && profile?.role !== 'admin') {
                const url = request.nextUrl.clone()
                url.pathname = '/'
                return NextResponse.redirect(url)
            }

            // Redirecionar se logado e tentar acessar /login
            if (request.nextUrl.pathname.startsWith('/login')) {
                const url = request.nextUrl.clone()
                url.pathname = '/'
                return NextResponse.redirect(url)
            }

            // Redirecionar para inicio se estiver em /blocked mas não for blocked
            if (request.nextUrl.pathname.startsWith('/blocked') && !isBlocked) {
                const url = request.nextUrl.clone()
                url.pathname = '/'
                return NextResponse.redirect(url)
            }
        }

        return supabaseResponse
    } catch (e) {
        console.error('Middleware Error:', e)
        return NextResponse.next({
            request: {
                headers: request.headers,
            },
        })
    }
}
