"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Trash2, AlertTriangle, Loader2, Save } from "lucide-react"
import { updateWorkspace, deleteWorkspace } from "@/app/actions/workspace"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"

export function WorkspaceSettings({ workspace }: { workspace: any }) {
    const router = useRouter()
    const [name, setName] = useState(workspace.name)
    const [isSaving, setIsSaving] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [deleteInput, setDeleteInput] = useState("")

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim() || name === workspace.name) return

        setIsSaving(true)
        const result = await updateWorkspace(workspace.id, name)

        if (result.error) {
            toast.error("Erro ao atualizar o workspace")
        } else {
            toast.success("Workspace atualizado com sucesso!")
        }
        setIsSaving(false)
    }

    const handleDelete = async () => {
        if (deleteInput !== workspace.name) return

        setIsDeleting(true)
        const result = await deleteWorkspace(workspace.id)

        if (result.error) {
            toast.error("Erro ao excluir o workspace")
            setIsDeleting(false)
            setShowDeleteConfirm(false)
        } else {
            toast.success("Workspace excluído com sucesso!")
            router.push("/")
            router.refresh()
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 py-8">
            <div className="relative group">
                <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-1 h-12 bg-neon-green sharp-edge opacity-0 group-hover:opacity-100 transition-all duration-300" />
                <h2 className="text-3xl font-black text-white font-outfit uppercase tracking-tighter">Configurações</h2>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-2">Personalize as diretrizes fundamentais do seu ecossistema de trabalho.</p>
            </div>

            {/* General Settings */}
            <div className="bg-carbon border border-white/10 sharp-edge p-10 space-y-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-neon-green/5 blur-[80px] rounded-full pointer-events-none" />
                
                <h3 className="text-[10px] font-black text-neon-green uppercase tracking-[0.3em] flex items-center gap-3">
                    <span className="w-8 h-px bg-neon-green/30" />
                    Parâmetros Gerais
                </h3>
                
                <form onSubmit={handleSave} className="space-y-8">
                    <div className="space-y-3">
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Identidade do Workspace</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="w-full bg-black/40 border border-white/5 text-sm p-5 sharp-edge text-white focus:outline-none focus:border-neon-green/50 transition-all placeholder:text-slate-800 font-bold uppercase tracking-widest shadow-inner"
                                placeholder="NOME DO WORKSPACE"
                            />
                            <div className="absolute top-0 right-0 h-full flex items-center pr-5 pointer-events-none">
                                <span className="text-[10px] text-slate-800 font-black">ID: {workspace.id.split('-')[0]}</span>
                            </div>
                        </div>
                    </div>
                    
                    <button
                        type="submit"
                        disabled={isSaving || name === workspace.name || !name.trim()}
                        className="group relative bg-neon-green text-black font-black uppercase tracking-[0.2em] py-5 px-10 sharp-edge transition-all hover:bg-neon-green/90 disabled:opacity-30 disabled:hover:bg-neon-green active:scale-[0.98] text-xs overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none" />
                        <span className="relative z-10 flex items-center gap-3">
                            {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                            Commit Updates
                        </span>
                    </button>
                </form>
            </div>

            {/* Danger Zone */}
            <div className="bg-black border border-signal-orange/20 sharp-edge p-10 space-y-8 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-signal-orange/30 to-transparent" />
                
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-signal-orange/10 sharp-edge border border-signal-orange/20">
                        <AlertTriangle className="h-6 w-6 text-signal-orange neon-glow" />
                    </div>
                    <div>
                        <h3 className="text-[10px] font-black text-signal-orange uppercase tracking-[0.3em]">Protocolo de Exclusão</h3>
                        <p className="text-slate-600 text-[9px] font-black uppercase tracking-widest mt-1">Zona de risco crítico. Ações irreversíveis.</p>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 p-8 bg-white/[0.02] border border-white/5 sharp-edge group-hover:bg-white/[0.04] transition-all">
                    <div className="space-y-2">
                        <h4 className="font-black text-white text-[11px] uppercase tracking-widest">Purgar Workspace</h4>
                        <p className="text-slate-500 text-[10px] font-medium leading-relaxed max-w-md">
                            A execução deste protocolo removerá permanentemente todo o histórico, colunas, cards e dados integrados. <span className="text-signal-orange">Nenhuma recuperação será possível.</span>
                        </p>
                    </div>
                    <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="bg-signal-orange/10 hover:bg-signal-orange text-signal-orange hover:text-black border border-signal-orange/20 font-black py-4 px-8 sharp-edge transition-all shrink-0 text-[10px] uppercase tracking-widest active:scale-[0.98]"
                    >
                        Executar Purga
                    </button>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {showDeleteConfirm && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="bg-carbon border border-signal-orange/30 w-full max-w-md sharp-edge overflow-hidden shadow-[0_0_50px_rgba(255,85,0,0.15)] relative"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-signal-orange shadow-[0_0_15px_rgba(255,85,0,0.5)]" />
                            
                            <div className="p-10 text-center">
                                <div className="w-20 h-20 bg-signal-orange/10 sharp-edge flex items-center justify-center mx-auto mb-8 border border-signal-orange/20">
                                    <Trash2 className="h-10 w-10 text-signal-orange" />
                                </div>

                                <div className="space-y-4 mb-10">
                                    <h3 className="text-2xl font-black text-white font-outfit uppercase tracking-tighter">Confirmar Purga</h3>
                                    <p className="text-slate-500 text-[11px] font-black uppercase tracking-widest leading-relaxed">
                                        Para autorizar a destruição de <span className="text-white">"{workspace.name}"</span>, digite o nome exato abaixo:
                                    </p>
                                </div>

                                <input
                                    type="text"
                                    value={deleteInput}
                                    onChange={(e) => setDeleteInput(e.target.value)}
                                    placeholder={workspace.name.toUpperCase()}
                                    className="w-full bg-black/40 border border-white/5 text-sm p-5 sharp-edge text-white focus:outline-none focus:border-signal-orange transition-all mb-8 text-center font-black uppercase tracking-[0.3em] placeholder:text-slate-900"
                                />

                                <div className="flex flex-col gap-4">
                                    <button
                                        onClick={handleDelete}
                                        disabled={deleteInput !== workspace.name || isDeleting}
                                        className="w-full bg-signal-orange text-black font-black py-5 sharp-edge shadow-xl hover:bg-signal-orange/90 disabled:opacity-30 transition-all flex items-center justify-center gap-3 text-[10px] uppercase tracking-widest"
                                    >
                                        {isDeleting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Confirmar Protocolo de Exclusão"}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowDeleteConfirm(false)
                                            setDeleteInput("")
                                        }}
                                        disabled={isDeleting}
                                        className="w-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white font-black py-5 sharp-edge transition-all text-[10px] uppercase tracking-widest"
                                    >
                                        Abortar
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
