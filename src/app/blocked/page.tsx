import { createClient } from "@/lib/supabase/server"
import { ShieldX, AlertTriangle, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function BlockedPage() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-[20%] right-[10%] w-96 h-96 bg-rose-600/10 blur-[100px] rounded-full" />
            <div className="absolute bottom-[20%] left-[10%] w-96 h-96 bg-red-900/10 blur-[100px] rounded-full" />

            <div className="max-w-md w-full z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="bg-slate-900/50 backdrop-blur-xl border border-rose-900/50 p-10 rounded-[40px] shadow-2xl text-center relative overflow-hidden">
                    {/* Security Lines Pattern */}
                    <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(225, 29, 72, 0.1) 10px, rgba(225, 29, 72, 0.1) 20px)' }}></div>

                    <div className="w-24 h-24 bg-rose-500/10 rounded-[28px] flex items-center justify-center mx-auto mb-8 border border-rose-500/20 shadow-[0_0_40px_rgba(225,29,72,0.2)]">
                        <ShieldX className="h-12 w-12 text-rose-500 animate-pulse" />
                    </div>

                    <h1 className="text-3xl font-bold text-white font-outfit mb-4">
                        Acesso Restrito
                    </h1>

                    <div className="bg-slate-950/50 border border-slate-800 p-4 rounded-2xl mb-8 space-y-2">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                            <p className="text-sm text-slate-300 text-left leading-relaxed">
                                Sua conta <b>{user?.email}</b> foi bloqueada por um administrador da plataforma. Você não tem permissão para acessar o sistema no momento.
                            </p>
                        </div>
                    </div>

                    <p className="text-xs text-slate-500 mb-8 border-t border-slate-800/50 pt-6">
                        Se você acredita que isso foi um engano ou precisa de acesso, por favor entre em contato com o suporte ou gestor responsável.
                    </p>

                    <form action="/auth/signout" method="post">
                        <button className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2">
                            <ArrowLeft className="h-5 w-5" />
                            Sair da Conta
                        </button>
                    </form>
                </div>
            </div>

            <p className="absolute bottom-6 text-[10px] text-slate-600">
                AutoKanban CRM Security System
            </p>
        </div>
    )
}
