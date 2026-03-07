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
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative group">
                <Plus className="absolute left-3 top-3.5 h-4 w-4 text-slate-500 group-focus-within:text-indigo-400" />
                <input
                    name="name"
                    placeholder="Nome do novo Workspace"
                    required
                    className="w-full bg-slate-900 border border-slate-800 text-white pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
            </div>
            {error && <p className="text-xs text-rose-500">{error}</p>}
            <button
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 rounded-xl transition-all flex items-center justify-center gap-2"
            >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Criar Workspace"}
            </button>
        </form>
    )
}
