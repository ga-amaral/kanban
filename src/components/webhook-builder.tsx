"use client"

import { useState } from "react"
import { testWebhook } from "@/app/actions/webhook"
import { Link, Terminal, Play, Save, Loader2, Info, X } from "lucide-react"
import { toast, Toaster } from "sonner"
import { motion, AnimatePresence } from "framer-motion"

export function WebhookBuilder({ workspaceId, initialConfig }: { workspaceId: string, initialConfig: any }) {
    const [url, setUrl] = useState(initialConfig?.url || "")
    const [mappings, setMappings] = useState<{ internal: string, external: string }[]>(initialConfig?.mappings || [])
    const [loading, setLoading] = useState(false)
    const [testResult, setTestResult] = useState<any>(null)

    const internalFields = ["client_name", "phone", "deadline_date", "column_title"]

    const handleSave = async () => {
        toast.info("Use o gerenciador de automações para configurar webhooks.")
    }

    const handleTest = async () => {
        setLoading(true)
        const payload: any = {}
        mappings.forEach(m => {
            payload[m.external] = "Exemplo de Valor"
        })

        const promise = testWebhook(url, payload)
        toast.promise(promise, {
            loading: "Enviando payload de teste...",
            success: (data) => data.success ? "Teste concluído!" : "O servidor retornou um erro.",
            error: "Falha na conexão com a URL."
        })

        const result = await promise
        setTestResult(result)
        setLoading(false)
    }

    return (
        <div className="bg-slate-900/50 border border-slate-800 rounded-[32px] p-8 space-y-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
            <Toaster position="top-right" theme="dark" richColors />

            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-2xl font-bold text-white font-outfit tracking-tight">Webhook Builder</h3>
                    <p className="text-slate-500 text-sm mt-1">Conecte o AutoKanban com n8n, Make ou suas próprias APIs.</p>
                </div>
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-4 rounded-2xl shadow-lg shadow-indigo-500/20">
                    <Link className="h-6 w-6 text-white" />
                </div>
            </div>

            <div className="space-y-4">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">URL de Destino (POST)</label>
                <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center group-focus-within:border-indigo-500 transition-all">
                        <Terminal className="h-4 w-4 text-slate-500 group-focus-within:text-indigo-400" />
                    </div>
                    <input
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://sua-api.com/webhook"
                        className="w-full bg-slate-950/50 border border-slate-800 text-white pl-16 pr-4 py-4 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-mono text-sm"
                    />
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Mapeamento de Dados</label>
                    <button
                        onClick={() => setMappings([...mappings, { internal: "", external: "" }])}
                        className="text-[10px] bg-slate-900 text-indigo-400 hover:text-white px-3 py-1.5 rounded-full border border-slate-800 hover:bg-slate-800 font-bold uppercase tracking-widest transition-all"
                    >
                        + Adicionar Regra
                    </button>
                </div>

                <div className="space-y-3">
                    <AnimatePresence>
                        {mappings.map((mapping, index) => (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                key={index}
                                className="flex gap-4 items-center p-3 bg-slate-950/30 border border-slate-800/50 rounded-2xl group transition-all hover:border-slate-700"
                            >
                                <div className="flex-1">
                                    <select
                                        value={mapping.internal}
                                        onChange={(e) => {
                                            const next = [...mappings]
                                            next[index].internal = e.target.value
                                            setMappings(next)
                                        }}
                                        className="w-full bg-slate-950 border border-slate-800 text-slate-300 p-3 rounded-xl text-xs outline-none focus:border-indigo-500 transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="">Campo Interno</option>
                                        {internalFields.map(f => <option key={f} value={f}>{f.replace('_', ' ')}</option>)}
                                    </select>
                                </div>
                                <div className="text-slate-700 font-bold">→</div>
                                <div className="flex-1 relative">
                                    <input
                                        placeholder="Chave JSON"
                                        value={mapping.external}
                                        onChange={(e) => {
                                            const next = [...mappings]
                                            next[index].external = e.target.value
                                            setMappings(next)
                                        }}
                                        className="w-full bg-slate-950 border border-slate-800 text-white p-3 rounded-xl text-xs outline-none focus:border-indigo-500 transition-all placeholder:text-slate-700 font-mono"
                                    />
                                </div>
                                <button
                                    onClick={() => setMappings(mappings.filter((_, i) => i !== index))}
                                    className="p-2 text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                                    title="Remover"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {mappings.length === 0 && (
                        <div className="py-12 text-center border-2 border-dashed border-slate-800/50 rounded-[28px] bg-slate-900/10">
                            <p className="text-slate-600 text-xs font-bold uppercase tracking-widest">Nenhum mapeamento regitrado</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex gap-4 pt-4">
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex-1 bg-white hover:bg-slate-200 text-slate-950 font-bold py-4 rounded-2xl transition-all shadow-xl shadow-white/5 flex items-center justify-center gap-2 group"
                >
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5 group-hover:scale-110 transition-transform" />}
                    Salvar Configuração
                </button>
                <button
                    onClick={handleTest}
                    disabled={loading || !url}
                    className="px-8 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl transition-all flex items-center gap-2 border border-slate-700 hover:border-indigo-500/50 group"
                >
                    <Play className={`h-4 w-4 ${loading ? 'animate-pulse' : 'group-hover:translate-x-0.5'} transition-all`} />
                    Testar
                </button>
            </div>

            <AnimatePresence>
                {testResult && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className={`p-6 rounded-2xl border text-xs font-mono overflow-hidden ${testResult.success ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/5 border-rose-500/20 text-rose-400'}`}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <p className="font-bold flex items-center gap-2 uppercase tracking-tighter">
                                <Info className="h-4 w-4" />
                                Resposta do Servidor {testResult.status && `[Status ${testResult.status}]`}
                            </p>
                            <button onClick={() => setTestResult(null)} className="hover:text-white transition-colors">
                                <X className="h-3 w-3" />
                            </button>
                        </div>
                        <pre className="whitespace-pre-wrap break-all bg-black/20 p-4 rounded-xl border border-white/5">
                            {testResult.data || testResult.error}
                        </pre>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
