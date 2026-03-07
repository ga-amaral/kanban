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
        <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 py-8">
            <div>
                <h2 className="text-2xl font-bold text-white font-outfit">Configurações do Workspace</h2>
                <p className="text-slate-400 text-sm mt-1">Gerencie os detalhes e a permanência deste workspace.</p>
            </div>

            {/* General Settings */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 space-y-6">
                <h3 className="text-lg font-semibold text-white">Informações Gerais</h3>
                <form onSubmit={handleSave} className="space-y-4 max-w-xl">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Nome do Workspace</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full bg-slate-950 border border-slate-800 text-sm p-3 rounded-xl text-white focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isSaving || name === workspace.name || !name.trim()}
                        className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white font-bold py-2.5 px-6 rounded-xl transition-all flex items-center gap-2 text-sm"
                    >
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Salvar Alterações
                    </button>
                </form>
            </div>

            {/* Danger Zone */}
            <div className="bg-rose-950/20 border border-rose-900/50 rounded-3xl p-8 space-y-6">
                <div className="flex items-center gap-3 text-rose-500">
                    <AlertTriangle className="h-6 w-6 relative top-[-1px]" />
                    <h3 className="text-lg font-semibold">Zona de Risco</h3>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-950/50 border border-rose-900/30 rounded-2xl">
                    <div>
                        <h4 className="font-bold text-white text-sm mb-1">Excluir este workspace</h4>
                        <p className="text-slate-400 text-xs">A exclusão removerá permanentemente todas as colunas, cards e dados. Esta ação não pode ser desfeita.</p>
                    </div>
                    <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 font-bold py-2 px-4 rounded-xl transition-all shrink-0 text-sm"
                    >
                        Excluir Workspace
                    </button>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {showDeleteConfirm && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl p-8"
                        >
                            <div className="w-16 h-16 bg-rose-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-rose-500/20">
                                <Trash2 className="h-8 w-8 text-rose-500" />
                            </div>

                            <div className="text-center mb-6">
                                <h3 className="text-xl font-bold text-white font-outfit mb-2">Excluir "{workspace.name}"?</h3>
                                <p className="text-slate-400 text-sm">
                                    Esta ação é irreversível. Para confirmar a exclusão, digite <b>{workspace.name}</b> abaixo:
                                </p>
                            </div>

                            <input
                                type="text"
                                value={deleteInput}
                                onChange={(e) => setDeleteInput(e.target.value)}
                                placeholder={workspace.name}
                                className="w-full bg-slate-950 border border-slate-800 text-sm p-3 rounded-xl text-white focus:outline-none focus:border-rose-500 transition-colors mb-6 text-center placeholder:opacity-30"
                            />

                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={handleDelete}
                                    disabled={deleteInput !== workspace.name || isDeleting}
                                    className="w-full bg-rose-600 hover:bg-rose-500 disabled:opacity-50 disabled:hover:bg-rose-600 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-rose-900/20 transition-all flex items-center justify-center gap-2"
                                >
                                    {isDeleting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Sim, Excluir Definitivamente"}
                                </button>
                                <button
                                    onClick={() => {
                                        setShowDeleteConfirm(false)
                                        setDeleteInput("")
                                    }}
                                    disabled={isDeleting}
                                    className="w-full bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 font-bold py-3.5 rounded-2xl transition-all"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
