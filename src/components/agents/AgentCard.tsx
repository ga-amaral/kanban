'use client'

import { useState } from 'react'
import { Bot, Edit2, Trash2, Loader2, Sparkles, Server, Cpu, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { deleteAgent } from '@/app/actions/agent'
import { toast } from 'sonner'

export function AgentCard({
    agent,
    userIsAdmin,
    onEdit,
    onDelete
}: {
    agent: any,
    userIsAdmin: boolean,
    onEdit: (agent: any) => void,
    onDelete: (id: string) => void
}) {
    const [isDeleting, setIsDeleting] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

    const handleDelete = async () => {
        setIsDeleting(true)
        try {
            const result = await deleteAgent(agent.id)
            if (result.success) {
                onDelete(agent.id)
                toast.success('Agente excluído com sucesso')
            }
        } catch (error) {
            toast.error('Erro ao excluir agente')
        } finally {
            setIsDeleting(false)
            setShowDeleteConfirm(false)
        }
    }

    return (
        <>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -4 }}
                className="bg-carbon border border-white/5 p-7 sharp-edge hover:border-neon-green/30 transition-all group relative overflow-hidden animate-spring"
            >
                {/* Efeito Glow no fundo */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-neon-green/5 blur-[80px] group-hover:bg-neon-green/10 transition-all duration-500" />
                
                <div className="relative z-10 flex flex-col h-full">
                    <div className="flex items-start justify-between mb-6">
                        <div className="bg-neon-green/10 p-3 sharp-edge border border-neon-green/20">
                            <Bot className="h-6 w-6 text-neon-green neon-glow" />
                        </div>
                        
                        {userIsAdmin && (
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Link
                                    href={`/agents/${agent.id}/chat`}
                                    className="p-2 hover:bg-neon-green/10 sharp-edge text-slate-400 hover:text-neon-green transition-colors"
                                    title="Conversar com Agente"
                                >
                                    <MessageSquare className="h-4.5 w-4.5" />
                                </Link>
                                <button
                                    onClick={() => onEdit(agent)}
                                    className="p-2 hover:bg-white/5 sharp-edge text-slate-400 hover:text-white transition-colors"
                                >
                                    <Edit2 className="h-4.5 w-4.5" />
                                </button>
                                <button
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="p-2 hover:bg-signal-orange/10 sharp-edge text-slate-400 hover:text-signal-orange transition-colors"
                                >
                                    <Trash2 className="h-4.5 w-4.5" />
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="space-y-3 mb-6">
                        <h3 className="text-lg font-black text-white font-outfit uppercase tracking-tighter truncate">
                            {agent.name}
                        </h3>
                        <p className="text-slate-500 text-[11px] font-bold uppercase tracking-tight leading-relaxed line-clamp-2 min-h-[32px]">
                            {agent.description || 'Sem descrição definida.'}
                        </p>
                    </div>

                    <div className="mt-auto pt-5 border-t border-white/5 grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-black uppercase tracking-widest">
                            <Cpu className="h-3.5 w-3.5 text-neon-green" />
                            <span className="truncate">{agent.model_name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-black uppercase tracking-widest">
                            <Server className="h-3.5 w-3.5 text-neon-green" />
                            <span className="truncate">{agent.provider}</span>
                        </div>
                    </div>

                    {agent.system_prompt && (
                        <div className="mt-5 bg-black/40 p-4 sharp-edge border border-white/5 group/prompt">
                            <div className="flex items-center gap-2 mb-2 text-[10px] font-black text-neon-green uppercase tracking-[0.2em]">
                                <Sparkles className="h-3 w-3" />
                                Prompt Base
                            </div>
                            <p className="text-[10px] text-slate-500 line-clamp-2 italic font-medium leading-relaxed">
                                "{agent.system_prompt}"
                            </p>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Modal de Confirmação de Exclusão */}
            <AnimatePresence>
                {showDeleteConfirm && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-carbon border border-white/5 w-full max-w-sm sharp-edge overflow-hidden shadow-2xl p-10 text-center"
                        >
                            <div className="w-20 h-20 bg-signal-orange/10 sharp-edge flex items-center justify-center mx-auto mb-8 border border-signal-orange/20">
                                <Trash2 className="h-10 w-10 text-signal-orange" />
                            </div>

                            <h3 className="text-xl font-bold text-white font-outfit mb-2">Excluir Agente?</h3>
                            <p className="text-slate-400 text-sm mb-8">
                                Esta ação removerá permanentemente o agente <b>{agent.name}</b>. Tem certeza?
                            </p>

                            <div className="flex flex-col gap-4">
                                <button
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="w-full bg-signal-orange text-black font-black uppercase tracking-widest py-4 sharp-edge shadow-lg transition-all flex items-center justify-center gap-2 text-xs"
                                >
                                    {isDeleting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Sim, Excluir'}
                                </button>
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    disabled={isDeleting}
                                    className="w-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white font-black uppercase tracking-widest py-4 sharp-edge transition-all text-xs"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    )
}
