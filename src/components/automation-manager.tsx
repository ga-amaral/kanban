"use client"

import { useState, useEffect } from "react"
import { getAutomations, createAutomation, deleteAutomation, toggleAutomation, updateAutomation } from "@/app/actions/automation"
import { toast } from "sonner"
import {
    Zap, Plus, Trash2, Power, Globe,
    ArrowRight, Settings2, Loader2, X,
    ChevronRight, Workflow
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

function InternalFieldSelector({
    value,
    onChange
}: {
    value: string,
    onChange: (val: string) => void
}) {
    const [isCustom, setIsCustom] = useState(!["contact_name", "contact_phone", "due_date", "column_title"].includes(value) && value !== "")

    if (isCustom) {
        return (
            <div className="flex-1 relative animate-in fade-in slide-in-from-left-2 duration-200">
                <input
                    autoFocus
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Chave no card..."
                    className="w-full bg-black/40 border border-neon-green/30 text-white px-3 py-2 sharp-edge text-[10px] outline-none shadow-inner"
                />
                <button
                    type="button"
                    onClick={() => {
                        setIsCustom(false)
                        onChange("contact_name")
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] text-neon-green font-black uppercase tracking-tight hover:text-white transition-colors"
                >
                    Voltar
                </button>
            </div>
        )
    }

    return (
        <select
            value={value}
            onChange={(e) => {
                if (e.target.value === "custom") {
                    setIsCustom(true)
                    onChange("")
                } else {
                    onChange(e.target.value)
                }
            }}
            className="flex-1 bg-black/40 border border-white/5 text-white px-3 py-2 sharp-edge text-[10px] outline-none appearance-none cursor-pointer hover:border-white/20 transition-all font-bold uppercase tracking-widest"
        >
            <option value="contact_name">Nome</option>
            <option value="contact_phone">Telefone</option>
            <option value="due_date">Data Entrega</option>
            <option value="column_title">Título Coluna</option>
            <option value="custom">✎ Campo Personalizado...</option>
        </select>
    )
}

export function AutomationManager({
    workspaceId,
    columns
}: {
    workspaceId: string,
    columns: any[]
}) {
    const [automations, setAutomations] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isAdding, setIsAdding] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)

    // Form State
    const [newName, setNewName] = useState("")
    const [triggerType, setTriggerType] = useState("column_move")
    const [fromColumn, setFromColumn] = useState("any")
    const [toColumn, setToColumn] = useState("")
    const [webhookUrl, setWebhookUrl] = useState("")
    const [mappings, setMappings] = useState([{ internal: "contact_name", external: "name" }])

    useEffect(() => {
        loadAutomations()
    }, [workspaceId])

    const loadAutomations = async () => {
        const data = await getAutomations(workspaceId)
        setAutomations(data)
        setIsLoading(false)
    }

    const handleEdit = (automation: any) => {
        setEditingId(automation.id)
        setNewName(automation.name)
        setTriggerType(automation.trigger_config.type)
        setFromColumn(automation.trigger_config.from_column_id || "any")
        setToColumn(automation.trigger_config.to_column_id)
        setWebhookUrl(automation.action_config.url)
        setMappings(automation.action_config.mappings || [])
        setIsAdding(true)
    }

    const resetForm = () => {
        setIsAdding(false)
        setEditingId(null)
        setNewName("")
        setTriggerType("column_move")
        setFromColumn("any")
        setToColumn("")
        setWebhookUrl("")
        setMappings([{ internal: "contact_name", external: "name" }])
    }

    const handleAddRule = () => {
        setMappings([...mappings, { internal: "contact_name", external: "" }])
    }

    const handleRemoveRule = (index: number) => {
        setMappings(mappings.filter((_, i) => i !== index))
    }

    const handleMappingChange = (index: number, field: "internal" | "external", value: string) => {
        const newMappings = [...mappings]
        newMappings[index][field] = value
        setMappings(newMappings)
    }

    const handleSave = async () => {
        if (!newName || !webhookUrl || !toColumn) {
            toast.error("Preencha todos os campos obrigatórios.")
            return
        }

        setIsSaving(true)
        const trigger = {
            type: triggerType,
            from_column_id: fromColumn === "any" ? null : fromColumn,
            to_column_id: toColumn
        }
        const action = {
            type: "webhook",
            url: webhookUrl,
            mappings
        }

        let result;
        if (editingId) {
            result = await updateAutomation(workspaceId, editingId, newName, trigger, action)
        } else {
            result = await createAutomation(workspaceId, newName, trigger, action)
        }

        if (result.error) {
            toast.error("Erro ao salvar: " + result.error)
        } else {
            toast.success(editingId ? "Automação atualizada!" : "Automação criada!")
            resetForm()
            loadAutomations()
        }
        setIsSaving(false)
    }

    const handleDelete = async (id: string) => {
        const result = await deleteAutomation(workspaceId, id)
        if (result.error) toast.error("Erro ao excluir")
        else {
            toast.success("Excluído")
            loadAutomations()
        }
    }

    const handleToggle = async (id: string, current: boolean) => {
        const result = await toggleAutomation(workspaceId, id, !current)
        if (result.error) toast.error("Erro ao alterar status")
        else loadAutomations()
    }

    if (isLoading) return (
        <div className="flex items-center justify-center p-20">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        </div>
    )

    return (
        <div className="space-y-10 max-w-5xl mx-auto py-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-white font-outfit uppercase tracking-tighter">Automações</h2>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-2">Gerencie fluxos de trabalho e webhooks do seu workspace.</p>
                </div>
                <button
                    onClick={() => setIsAdding(true)}
                    className="flex items-center gap-2 bg-neon-green text-black px-6 py-3 sharp-edge transition-all hover:bg-neon-green/90 group active:scale-[0.98]"
                >
                    <Plus className="h-4 w-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Nova Automação</span>
                </button>
            </div>

            <div className="grid gap-4">
                <AnimatePresence mode="popLayout">
                    {automations.length === 0 && !isAdding && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-slate-900/40 border border-slate-800 rounded-[32px] p-12 text-center"
                        >
                            <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/5">
                                <Zap className="h-8 w-8 text-slate-500" />
                            </div>
                            <h3 className="text-white font-bold mb-2">Sem automações ativas</h3>
                            <p className="text-slate-500 text-sm max-w-xs mx-auto">Crie regras para disparar webhooks quando cards mudarem de posição.</p>
                        </motion.div>
                    )}

                    {isAdding && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-carbon border border-white/10 sharp-edge p-10 shadow-2xl relative overflow-hidden group mb-8"
                        >
                            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-neon-green/30 to-transparent" />
                            <button onClick={() => setIsAdding(false)} className="absolute top-6 right-6 p-2 hover:bg-white/5 sharp-edge transition-colors group">
                                <X className="h-5 w-5 text-slate-500 group-hover:text-white" />
                            </button>

                            <div className="flex items-center gap-4 mb-10">
                                <div className="p-3 bg-neon-green/10 sharp-edge border border-neon-green/20">
                                    <Workflow className="h-6 w-6 text-neon-green neon-glow" />
                                </div>
                                <h3 className="text-xl font-black text-white font-outfit uppercase tracking-tighter">
                                    {editingId ? "Editar Automação" : "Configurar Automação"}
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Nome da Regra</label>
                                        <input
                                            value={newName}
                                            onChange={(e) => setNewName(e.target.value)}
                                            placeholder="Ex: Enviar para o n8n no Primeiro Contato"
                                            className="w-full bg-black/40 border border-white/5 text-white p-5 sharp-edge focus:border-neon-green/50 outline-none transition-all placeholder:text-slate-800 text-sm font-bold"
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-neon-green uppercase tracking-[0.2em] ml-1">Gatilho (Trigger)</label>
                                        <div className="bg-black/20 border border-white/5 p-8 sharp-edge space-y-6">
                                            <div className="flex items-center gap-3">
                                                <Zap className="h-4 w-4 text-amber-500" />
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ao mover card...</span>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <div className="flex-1 space-y-2">
                                                    <span className="text-[9px] text-slate-600 font-bold uppercase ml-1 tracking-widest">De</span>
                                                    <select
                                                        value={fromColumn}
                                                        onChange={(e) => setFromColumn(e.target.value)}
                                                        className="w-full bg-black/40 border border-white/5 text-white px-4 py-3 sharp-edge text-[11px] outline-none appearance-none font-bold uppercase tracking-widest"
                                                    >
                                                        <option value="any">Qualquer Coluna</option>
                                                        {columns.map(c => <option key={c.id} value={c.id} className="bg-carbon">{c.title}</option>)}
                                                    </select>
                                                </div>
                                                <ChevronRight className="h-4 w-4 text-slate-700 mt-6" />
                                                <div className="flex-1 space-y-2">
                                                    <span className="text-[9px] text-slate-600 font-bold uppercase ml-1 tracking-widest">Para</span>
                                                    <select
                                                        value={toColumn}
                                                        onChange={(e) => setToColumn(e.target.value)}
                                                        className="w-full bg-black/40 border border-neon-green/30 text-white px-4 py-3 sharp-edge text-[11px] outline-none appearance-none font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(57,255,20,0.05)]"
                                                    >
                                                        <option value="">Selecione...</option>
                                                        {columns.map(c => <option key={c.id} value={c.id} className="bg-carbon">{c.title}</option>)}
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] ml-1">Ação (Response)</label>
                                        <div className="bg-black/20 border border-white/5 p-8 sharp-edge space-y-6">
                                            <div className="flex items-center gap-3">
                                                <Globe className="h-4 w-4 text-emerald-500" />
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Disparar Webhook</span>
                                            </div>

                                            <input
                                                value={webhookUrl}
                                                onChange={(e) => setWebhookUrl(e.target.value)}
                                                placeholder="https://webhook.site/..."
                                                className="w-full bg-black/40 border border-white/5 text-white px-5 py-4 sharp-edge text-xs outline-none focus:border-emerald-500/50 transition-all font-mono shadow-inner"
                                            />

                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between px-1">
                                                    <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Mapeamento JSON</span>
                                                    <button onClick={handleAddRule} className="text-[9px] text-neon-green hover:text-white font-black uppercase tracking-widest transition-colors flex items-center gap-1.5">
                                                        <Plus className="h-3 w-3" /> Adicionar Campo
                                                    </button>
                                                </div>

                                                <div className="space-y-2 max-h-[160px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10">
                                                    {mappings.map((mapping, index) => (
                                                        <div key={index} className="flex gap-2 group/item">
                                                            <InternalFieldSelector
                                                                value={mapping.internal}
                                                                onChange={(val) => handleMappingChange(index, "internal", val)}
                                                            />
                                                            <ArrowRight className="h-3 w-3 text-slate-700 self-center" />
                                                            <input
                                                                placeholder="Chave JSON"
                                                                value={mapping.external}
                                                                onChange={(e) => handleMappingChange(index, "external", e.target.value)}
                                                                className="flex-1 bg-black/40 border border-white/5 text-white px-3 py-2 sharp-edge text-[10px] outline-none focus:border-neon-green/30 transition-all font-bold uppercase tracking-widest shadow-inner placeholder:text-slate-800"
                                                            />
                                                            <button
                                                                onClick={() => handleRemoveRule(index)}
                                                                className="p-2 opacity-0 group-hover/item:opacity-100 hover:text-signal-orange transition-all"
                                                            >
                                                                <Trash2 className="h-3 w-3" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className="w-full bg-neon-green text-black font-black uppercase tracking-widest py-5 sharp-edge shadow-xl hover:bg-neon-green/90 transition-all flex items-center justify-center gap-3 text-xs relative overflow-hidden group active:scale-[0.98]"
                                    >
                                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none" />
                                        <span className="relative z-10 flex items-center gap-2">
                                            {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : (editingId ? "Salvar Alterações" : "Ativar Automação")}
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {automations.map((automation) => (
                        <motion.div
                            key={automation.id}
                            layout
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`group bg-carbon border ${automation.is_active ? 'border-neon-green/20' : 'border-white/5 opacity-40'} sharp-edge p-6 flex flex-col md:flex-row items-center justify-between gap-6 transition-all hover:bg-black/30 animate-spring`}
                        >
                            <div className="flex items-center gap-6 flex-1 w-full">
                                <div className={`p-4 sharp-edge border ${automation.is_active ? 'bg-neon-green/10 border-neon-green/20 text-neon-green neon-glow' : 'bg-white/5 border-white/5 text-slate-700'}`}>
                                    <Workflow className="h-6 w-6" />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="font-black text-white font-outfit uppercase tracking-tighter">{automation.name}</h4>
                                    <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-600">
                                        <div className="flex items-center gap-2">
                                            <Zap className="h-3 w-3 text-amber-500" />
                                            <span>Mover para {columns.find(c => c.id === (automation.trigger_config as any).to_column_id)?.title || "..."}</span>
                                        </div>
                                        <div className="h-1 w-1 bg-white/10 rounded-full" />
                                        <div className="flex items-center gap-2">
                                            <Globe className="h-3 w-3 text-neon-green" />
                                            <span className="truncate max-w-[150px]">{new URL((automation.action_config as any).url).hostname}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => handleToggle(automation.id, automation.is_active)}
                                    className={`p-2.5 sharp-edge border transition-all ${automation.is_active ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20' : 'bg-white/5 border-white/5 text-slate-500 hover:text-white hover:bg-white/10'}`}
                                    title={automation.is_active ? "Desativar" : "Ativar"}
                                >
                                    <Power className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={() => handleEdit(automation)}
                                    className="p-2.5 bg-white/5 border border-white/5 text-slate-500 hover:text-white hover:bg-white/10 sharp-edge transition-all"
                                    title="Editar"
                                >
                                    <Settings2 className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={() => handleDelete(automation.id)}
                                    className="p-2.5 bg-signal-orange/10 border border-signal-orange/20 text-signal-orange hover:bg-signal-orange/20 sharp-edge transition-all"
                                    title="Excluir"
                                >
                                    <Trash2 className="h-5 w-5" />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    )
}
