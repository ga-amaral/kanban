import { createClient } from "@/lib/supabase/server"
import { getColumns } from "@/app/actions/column"
import { getCardsByWorkspace } from "@/app/actions/card"
import { KanbanBoard } from "@/components/kanban/board"
import { UserNav } from "@/components/user-nav"
import { Kanban, ChevronLeft, Settings, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { AutomationManager } from "@/components/automation-manager"
import { WorkspaceSettings } from "@/components/workspace/settings"

export default async function WorkspacePage({
    params,
    searchParams
}: {
    params: { id: string },
    searchParams: { tab?: string }
}) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: workspace }: { data: any } = await supabase
        .from("workspaces")
        .select("*")
        .eq("id", params.id)
        .single()

    if (!workspace) notFound()

    const columns = await getColumns(params.id)
    const cards = await getCardsByWorkspace(params.id)
    const activeTab = searchParams.tab || "kanban"

    return (
        <div className="min-h-screen bg-transparent text-slate-200 flex flex-col overflow-hidden">
            {/* Workspace Header - Radical Redesign */}
            <header className="border-b border-white/5 bg-carbon z-40">
                <div className="mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link
                            href="/"
                            className="p-2 hover:bg-white/5 sharp-edge transition-colors text-slate-400 hover:text-white group"
                        >
                            <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                        </Link>
                        <div className="h-6 w-px bg-white/5" />
                        <div className="flex items-center gap-8">
                            <div className="flex flex-col border-r border-white/5 pr-8">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-0.5">Workspace</span>
                                <h1 className="text-sm font-black text-white font-outfit uppercase tracking-tighter leading-none truncate max-w-[150px]">
                                    {workspace.name}
                                </h1>
                            </div>

                            <nav className="flex items-center gap-0 bg-black/40 p-0 sharp-edge border border-white/5">
                                <Link
                                    href={`/workspace/${params.id}?tab=kanban`}
                                    className={`px-5 py-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === 'kanban' ? 'bg-neon-green text-black' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                                >
                                    Quadro
                                    {activeTab === 'kanban' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black/10" />}
                                </Link>
                                <Link
                                    href={`/workspace/${params.id}?tab=automations`}
                                    className={`px-5 py-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === 'automations' ? 'bg-neon-green text-black' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                                >
                                    Automações
                                </Link>
                                <Link
                                    href={`/workspace/${params.id}?tab=settings`}
                                    className={`px-5 py-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === 'settings' ? 'bg-neon-green text-black' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                                >
                                    Configurações
                                </Link>
                            </nav>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <UserNav user={user} />
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 overflow-auto bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]">
                {activeTab === "kanban" && (
                    <KanbanBoard
                        workspaceId={params.id}
                        initialColumns={columns}
                        initialCards={cards}
                    />
                )}
                {activeTab === "automations" && (
                    <div className="max-w-6xl mx-auto px-6 py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <AutomationManager
                            workspaceId={params.id}
                            columns={columns}
                        />
                    </div>
                )}
                {activeTab === "settings" && (
                    <div className="max-w-6xl mx-auto px-6">
                        <WorkspaceSettings workspace={workspace} />
                    </div>
                )}
            </main>
        </div>
    )
}
