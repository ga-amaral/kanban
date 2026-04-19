import { createClient } from "@/lib/supabase/server"
import { getWorkspaces } from "@/app/actions/workspace"
import { UserNav } from "@/components/user-nav"
import { CreateWorkspace } from "@/components/create-workspace"
import Link from "next/link"
import { LayoutGrid, ArrowRight, Kanban, Settings, Bot, Terminal } from "lucide-react"
import type { Tables } from "@/types/database"

/**
 * Gabriel Amaral (https://instagram.com/sougabrielamaral)
 */

export default async function DashboardPage() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const workspaces = await getWorkspaces() as Tables<"workspaces">[]

    return (
        <div className="min-h-screen bg-transparent text-white font-inter selection:bg-neon-green/30">
            {/* Legend: No traditional header - Radical approach */}

            <main className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid lg:grid-cols-3 gap-12">
                    {/* Left Column: Workspaces */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-black text-white font-outfit uppercase tracking-tighter">Seus Workspaces</h2>
                                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">Gerencie seus fluxos de trabalho e leads.</p>
                            </div>
                            <div className="h-10 w-10 bg-neon-green/10 sharp-edge border border-neon-green/20 flex items-center justify-center text-neon-green">
                                <LayoutGrid className="h-5 w-5" />
                            </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4 stagger-reveal">
                            {workspaces.map((workspace) => (
                                <Link
                                    key={workspace.id}
                                    href={`/workspace/${workspace.id}`}
                                    className="group bg-carbon border border-white/5 p-6 sharp-edge hover:border-neon-green/30 transition-all duration-500 relative overflow-hidden animate-spring"
                                >
                                    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ArrowRight className="h-5 w-5 text-neon-green" />
                                    </div>
                                    <h3 className="text-lg font-black text-white font-outfit uppercase tracking-tighter group-hover:text-neon-green transition-colors">
                                        {workspace.name}
                                    </h3>
                                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-4 flex items-center gap-2">
                                        <span className="h-1.5 w-1.5 bg-neon-green rounded-full" />
                                        Criado em {workspace.created_at ? new Date(workspace.created_at).toLocaleDateString('pt-BR') : 'N/A'}
                                    </p>
                                </Link>
                            ))}

                            {workspaces.length === 0 && (
                                <div className="col-span-2 py-12 text-center bg-carbon border border-dashed border-white/10 sharp-edge">
                                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Nenhum workspace encontrado. Crie o primeiro ao lado!</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Actions & Quick Settings */}
                    <div className="space-y-6">
                        <div className="bg-carbon border border-white/5 p-6 sharp-edge space-y-6 relative overflow-hidden group">
                            <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em] flex items-center gap-2 group-hover:text-neon-green transition-colors">
                                <Plus className="h-3.5 w-3.5" />
                                Novo Workspace
                            </h3>
                            <CreateWorkspace />
                        </div>

                        <div className="bg-neon-green p-7 sharp-edge text-black space-y-4 shadow-[0_0_30px_hsla(var(--neon-green),0.2)] relative overflow-hidden group border border-white/10">
                            <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-black/10 blur-3xl rounded-full group-hover:scale-150 transition-transform duration-700" />
                            <div className="relative z-10">
                                <h4 className="font-black text-xl font-outfit uppercase tracking-tighter">Precisa de Ajuda?</h4>
                                <p className="text-black/70 text-xs mt-2 leading-relaxed font-bold">
                                    Confira nossos tutoriais de automação para tirar o máximo proveito do AutoKanban.
                                </p>
                                <button className="mt-6 w-full bg-black text-white hover:bg-black/80 sharp-edge py-3 rounded-none text-xs font-black uppercase tracking-widest transition-all">
                                    Ver Documentação
                                </button>
                            </div>
                        </div>

                        <Link 
                            href="/agents"
                            className="block bg-carbon border border-white/5 p-7 sharp-edge space-y-4 hover:border-neon-green/50 transition-all relative overflow-hidden group animate-spring"
                        >
                            <div className="absolute -right-8 -bottom-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Bot className="h-32 w-32 text-white" />
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="bg-neon-green/10 p-2 sharp-edge">
                                    <Bot className="h-5 w-5 text-neon-green" />
                                </div>
                                <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">Agentes de IA</h3>
                            </div>
                            <p className="text-slate-500 text-xs leading-relaxed font-medium">
                                Personalize e gerencie seus próprios agentes de inteligência artificial para o seu negócio.
                            </p>
                            <div className="flex items-center gap-2 text-neon-green text-[10px] font-black uppercase tracking-[0.2em] pt-2">
                                Acessar Área <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                            </div>
                        </Link>

                        <Link 
                            href="/api-test"
                            className="block bg-carbon border border-white/5 p-7 sharp-edge space-y-4 hover:border-neon-green/50 transition-all relative overflow-hidden group animate-spring"
                        >
                            <div className="absolute -right-8 -bottom-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Terminal className="h-32 w-32 text-white" />
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="bg-neon-green/10 p-2 sharp-edge">
                                    <Terminal className="h-5 w-5 text-neon-green" />
                                </div>
                                <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">Teste de API</h3>
                            </div>
                            <p className="text-slate-500 text-xs leading-relaxed font-medium">
                                Teste as ações da API e gere comandos cURL para integração externa.
                            </p>
                            <div className="flex items-center gap-2 text-neon-green text-[10px] font-black uppercase tracking-[0.2em] pt-2">
                                Acessar Área <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                            </div>
                        </Link>

                        <p className="text-[10px] text-white/20 text-center px-4 font-black uppercase tracking-widest leading-relaxed">
                            © 2026 AutoKanban CRM. Desenvolvido por <a href="https://instagram.com/sougabrielamaral" target="_blank" className="hover:text-neon-green transition-colors">Gabriel Amaral</a>.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    )
}

function Plus(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M5 12h14" />
            <path d="M12 5v14" />
        </svg>
    )
}
