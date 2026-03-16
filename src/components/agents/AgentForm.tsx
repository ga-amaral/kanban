'use client'

import { useState } from 'react'
import { X, Loader2, Bot, Sparkles, Server, Cpu, AlignLeft } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createAgent, updateAgent } from '@/app/actions/agent'
import { toast } from 'sonner'

const agentSchema = z.object({
    name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
    description: z.string().min(0),
    system_prompt: z.string().min(10, 'Prompt deve ter pelo menos 10 caracteres'),
    model_name: z.string().min(1, 'Modelo é obrigatório'),
    provider: z.string().min(1, 'Provedor é obrigatório')
})

type AgentFormData = z.infer<typeof agentSchema>

export function AgentForm({
    agent,
    onClose,
    onSuccess
}: {
    agent?: any,
    onClose: () => void,
    onSuccess: (agent: any) => void
}) {
    const [isSaving, setIsSaving] = useState(false)

    const { register, handleSubmit, formState: { errors } } = useForm<AgentFormData>({
        resolver: zodResolver(agentSchema),
        defaultValues: {
            name: agent?.name || '',
            description: agent?.description || '',
            system_prompt: agent?.system_prompt || '',
            model_name: agent?.model_name || 'gpt-4o',
            provider: agent?.provider || 'openai'
        }
    })

    const onSubmit = async (data: AgentFormData) => {
        setIsSaving(true)
        try {
            let result
            if (agent) {
                result = await updateAgent(agent.id, data)
                toast.success('Agente atualizado com sucesso')
            } else {
                result = await createAgent(data)
                toast.success('Agente criado com sucesso')
            }
            onSuccess(result)
            onClose()
        } catch (error: any) {
            toast.error(error.message || 'Erro ao salvar agente')
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-carbon border border-white/5 w-full max-w-2xl sharp-edge overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-spring"
            >
                <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                    <div className="flex items-center gap-4">
                        <div className="bg-neon-green/10 p-2.5 sharp-edge">
                            <Bot className="h-6 w-6 text-neon-green neon-glow" />
                        </div>
                        <h3 className="text-xl font-black text-white font-outfit uppercase tracking-tighter">
                            {agent ? 'Editar Agente' : 'Novo Agente Personalizado'}
                        </h3>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 sharp-edge transition-colors group">
                        <X className="h-5 w-5 text-slate-500 group-hover:text-white" />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Nome do Agente */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                <Bot className="h-3 w-3" /> Nome do Agente
                            </label>
                            <input
                                {...register('name')}
                                placeholder="Ex: Assistente de Vendas"
                                className="w-full bg-black/40 border border-white/5 text-white p-4 sharp-edge focus:border-neon-green/50 outline-none transition-all placeholder:text-slate-800 text-sm font-bold"
                            />
                            {errors.name && <p className="text-signal-orange text-[10px] ml-1 uppercase font-black tracking-widest">{errors.name.message}</p>}
                        </div>

                        {/* Descrição Curta */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                <AlignLeft className="h-3 w-3" /> Descrição Curta
                            </label>
                            <input
                                {...register('description')}
                                placeholder="Breve resumo do que este agente faz"
                                className="w-full bg-black/40 border border-white/5 text-white p-4 sharp-edge focus:border-neon-green/50 outline-none transition-all placeholder:text-slate-800 text-sm font-bold"
                            />
                        </div>
                    </div>

                    {/* Modelo e Provider */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                <Cpu className="h-3 w-3" /> Modelo de IA
                            </label>
                            <select
                                {...register('model_name')}
                                className="w-full bg-black/40 border border-white/5 text-white p-4 sharp-edge focus:border-neon-green/50 outline-none transition-all text-sm appearance-none font-bold"
                            >
                                <option value="gpt-4o" className="bg-carbon text-white">GPT-4o (Completo)</option>
                                <option value="gpt-4o-mini" className="bg-carbon text-white">GPT-4o Mini (Rápido)</option>
                                <option value="gpt-5-nano" className="bg-carbon text-white">GPT-5 Nano</option>
                                <option value="claude-3-5-sonnet" className="bg-carbon text-white">Claude 3.5 Sonnet</option>
                                <option value="gemini-1.5-pro" className="bg-carbon text-white">Gemini 1.5 Pro</option>
                            </select>
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                <Server className="h-3 w-3" /> Provedor
                            </label>
                            <select
                                {...register('provider')}
                                className="w-full bg-black/40 border border-white/5 text-white p-4 sharp-edge focus:border-neon-green/50 outline-none transition-all text-sm appearance-none font-bold"
                            >
                                <option value="openai" className="bg-carbon text-white">OpenAI</option>
                                <option value="anthropic" className="bg-carbon text-white">Anthropic</option>
                                <option value="google" className="bg-carbon text-white">Google</option>
                            </select>
                        </div>
                    </div>

                    {/* System Prompt */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                            <Sparkles className="h-3 w-3" /> Prompt de Sistema (Personalidade/Regras)
                        </label>
                        <textarea
                            {...register('system_prompt')}
                            rows={6}
                            placeholder="Defina como o agente deve agir, que tom usar e quais os limites de conhecimento..."
                            className="w-full bg-black/40 border border-white/5 text-white p-5 sharp-edge focus:border-neon-green/50 outline-none transition-all placeholder:text-slate-800 text-sm resize-none font-medium leading-relaxed"
                        />
                        {errors.system_prompt && <p className="text-signal-orange text-[10px] ml-1 uppercase font-black tracking-widest">{errors.system_prompt.message}</p>}
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="flex-1 bg-neon-green text-black font-black uppercase tracking-widest py-4 sharp-edge hover:bg-neon-green/90 transition-all flex items-center justify-center gap-2 text-xs relative overflow-hidden group active:scale-[0.98]"
                        >
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none" />
                            <span className="relative z-10 flex items-center gap-2">
                                {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : (agent ? 'Salvar Alterações' : 'Criar Agente')}
                            </span>
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-8 bg-white/5 text-slate-400 hover:text-white font-black uppercase tracking-widest py-4 sharp-edge hover:bg-white/10 transition-all text-xs"
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    )
}
