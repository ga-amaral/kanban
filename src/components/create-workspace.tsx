"use client"

import { useState } from "react"
import { createWorkspace } from "@/app/actions/workspace"
import { Plus, Loader2 } from "lucide-react"

export function CreateWorkspace() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const formData = new FormData(e.currentTarget)
        const result = await createWorkspace(formData)

        if (result?.error) {
            setError(typeof result.error === 'string' ? result.error : "Erro de validação")
        } else {
            (e.target as HTMLFormElement).reset()
        }
        setLoading(false)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 stagger-reveal">
            <div className="relative group">
                <Plus className="absolute left-3 top-3.5 h-4 w-4 text-slate-600 group-focus-within:text-neon-green transition-colors" />
                <input
                    name="name"
                    placeholder="Nome do novo Workspace"
                    required
                    className="w-full bg-black/40 border border-white/5 text-white pl-10 pr-4 py-3 sharp-edge focus:outline-none focus:border-neon-green/50 transition-all font-bold placeholder:text-slate-700 text-sm"
                />
            </div>
            {error && <p className="text-[10px] uppercase font-black tracking-widest text-signal-orange">{error}</p>}
            <button
                disabled={loading}
                className="w-full bg-neon-green hover:bg-neon-green/90 text-black font-black uppercase tracking-widest py-3 sharp-edge transition-all flex items-center justify-center gap-2 text-xs relative overflow-hidden group active:scale-[0.98]"
            >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none" />
                <span className="relative z-10 flex items-center gap-2">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Criar Workspace"}
                </span>
            </button>
        </form>
    )
}
