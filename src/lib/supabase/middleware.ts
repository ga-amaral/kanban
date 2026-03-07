import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { Database } from '@/types/database'

export async function updateSession(request: NextRequest) {
    try {
        let supabaseResponse = NextResponse.next({
            request,
        })

        // Check for missing env vars
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
            console.error('Middleware Error: Missing Supabase environment variables.')
            return supabaseResponse
        }

        const supabase = createServerClient<Database>(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            {
                cookies: {
                    getAll() {
                        return request.cookies.getAll()
                    },
                    setAll(cookiesToSet: { name: string, value: string, options: any }[]) {
                        cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                        supabaseResponse = NextResponse.next({
                            request,
                        })
                        cookiesToSet.forEach(({ name, value, options }) =>
                            supabaseResponse.cookies.set(name, value, options)
                        )
                    },
                },
            }
        )

        // Proteger rotas
        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (
            !user &&
            !request.nextUrl.pathname.startsWith('/login') &&
            !request.nextUrl.pathname.startsWith('/auth')
        ) {
            const url = request.nextUrl.clone()
            url.pathname = '/login'
            return NextResponse.redirect(url)
        }

        // Se logado, checar role e status
        if (user) {
            // Pegar profile
            const { data: profile } = await (supabase.from('profiles') as any)
                .select('role, status')
                .eq('id', user.id)
                .single()

            // Bloquear usuário
            if (profile?.status === 'blocked' && !request.nextUrl.pathname.startsWith('/blocked')) {
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
            if (request.nextUrl.pathname.startsWith('/blocked') && profile?.status !== 'blocked') {
                const url = request.nextUrl.clone()
                url.pathname = '/'
                return NextResponse.redirect(url)
            }
        }

        return supabaseResponse
    } catch (e) {
        // Prevent middleware from crashing the whole app
        console.error('Middleware Error:', e)
        return NextResponse.next({
            request: {
                headers: request.headers,
            },
        })
    }
}
