import { createClient } from "@/lib/supabase/server"
import { ShieldX, AlertTriangle, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function BlockedPage() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-[20%] right-[10%] w-96 h-96 bg-signal-orange/10 blur-[120px] rounded-full animate-pulse" />
            <div className="absolute bottom-[20%] left-[10%] w-96 h-96 bg-carbon/50 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />

            <div className="max-w-md w-full z-10">
                <div className="bg-carbon border border-white/5 p-12 sharp-edge shadow-2xl text-center relative overflow-hidden group">
                    {/* Security Lines Pattern */}
                    <div className="absolute inset-0 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(225, 29, 72, 0.1) 10px, rgba(225, 29, 72, 0.1) 20px)' }}></div>
                    <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-signal-orange/30 to-transparent" />

                    <div className="w-24 h-24 bg-signal-orange/10 sharp-edge flex items-center justify-center mx-auto mb-10 border border-signal-orange/20 shadow-[0_0_40px_rgba(249,115,22,0.1)]">
                        <ShieldX className="h-12 w-12 text-signal-orange animate-pulse" />
                    </div>

                    <h1 className="text-3xl font-black text-white font-outfit mb-3 uppercase tracking-tighter">
                        Acesso Interrompido
                    </h1>

                    <div className="bg-black/40 border border-white/5 p-6 sharp-edge mb-10 space-y-2">
                        <div className="flex flex-col items-center gap-4">
                            <AlertTriangle className="h-6 w-6 text-signal-orange shrink-0 animate-bounce" />
                            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-tight leading-relaxed">
                                Sua unidade de acesso <b>{user?.email}</b> foi suspensa pelos protocolos de segurança da plataforma.
                            </p>
                        </div>
                    </div>

                    <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest mb-10 border-t border-white/5 pt-8">
                        Contate a central de suporte para revisão de credenciais.
                    </p>

                    <form action="/auth/signout" method="post">
                        <button className="w-full bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-[0.2em] py-5 sharp-edge transition-all shadow-lg flex items-center justify-center gap-3 text-xs">
                            <ArrowLeft className="h-4 w-4" />
                            Encerrar Sessão
                        </button>
                    </form>
                </div>
            </div>

            <p className="absolute bottom-8 text-[9px] text-white/10 font-black uppercase tracking-[0.3em]">
                AutoKanban CRM // Security Layer 01
            </p>
        </div>
    )
}
