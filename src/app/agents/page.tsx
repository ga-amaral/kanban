'use client'

import { useState, useEffect } from 'react'
import { Plus, Bot, ArrowLeft, Loader2, Sparkles, Search } from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { getAgents, isAdmin } from '@/app/actions/agent'
import { AgentCard } from '@/components/agents/AgentCard'
import { AgentForm } from '@/components/agents/AgentForm'
import { toast } from 'sonner'

export default function AgentsPage() {
    const [agents, setAgents] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [userIsAdmin, setUserIsAdmin] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [showForm, setShowForm] = useState(false)
    const [selectedAgent, setSelectedAgent] = useState<any | null>(null)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        setIsLoading(true)
        try {
            const [agentsData, adminStatus] = await Promise.all([
                getAgents(),
                isAdmin()
            ])
            setAgents(agentsData)
            setUserIsAdmin(adminStatus)
        } catch (error) {
            toast.error('Erro ao carregar dados')
        } finally {
            setIsLoading(false)
        }
    }

    const filteredAgents = agents.filter(agent => 
        agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleEditAgent = (agent: any) => {
        setSelectedAgent(agent)
        setShowForm(true)
    }

    const handleDeleteAgent = (id: string) => {
        setAgents(prev => prev.filter(a => a.id !== id))
    }

    const handleFormSuccess = (agent: any) => {
        if (selectedAgent) {
            setAgents(prev => prev.map(a => a.id === agent.id ? agent : a))
        } else {
            setAgents(prev => [agent, ...prev])
        }
    }

    return (
        <div className="min-h-screen bg-transparent text-slate-200 selection:bg-neon-green/30">
            {/* Header / Nav - Radical Style */}
            <header className="sticky top-0 z-50 bg-carbon border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link 
                            href="/"
                            className="p-2.5 hover:bg-white/5 sharp-edge text-slate-400 hover:text-white transition-all border border-transparent hover:border-white/5 group"
                        >
                            <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                        </Link>
                        <div className="flex items-center gap-4">
                            <div className="bg-neon-green/10 p-2.5 sharp-edge">
                                <Bot className="h-6 w-6 text-neon-green neon-glow" />
                            </div>
                            <div>
                                <h1 className="text-xl font-black text-white font-outfit uppercase tracking-tighter">Agentes de IA</h1>
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">Personalização de Inteligência</p>
                            </div>
                        </div>
                    </div>

                    {userIsAdmin && (
                        <button
                            onClick={() => {
                                setSelectedAgent(null)
                                setShowForm(true)
                            }}
                            className="bg-neon-green text-black font-black uppercase tracking-widest px-8 py-3 sharp-edge hover:bg-neon-green/90 transition-all flex items-center gap-2 relative overflow-hidden group active:scale-[0.98]"
                        >
                             <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none" />
                             <span className="relative z-10 flex items-center gap-2">
                                <Plus className="h-4 w-4" />
                                Criar Novo Agente
                             </span>
                        </button>
                    )}
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-12">
                {/* Search and Stats */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-16">
                    <div className="relative w-full md:max-w-md group">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-slate-600 group-focus-within:text-neon-green transition-colors" />
                        </div>
                        <input
                            type="text"
                            placeholder="Buscar agentes por nome ou descrição..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-black/40 border border-white/5 text-white pl-12 pr-4 py-4 sharp-edge focus:border-neon-green/50 outline-none transition-all placeholder:text-slate-700 text-sm font-bold"
                        />
                    </div>
                    
                    <div className="flex items-center gap-10">
                        <div className="text-right">
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-1">Total de Agentes</p>
                            <p className="text-3xl font-black text-white font-outfit uppercase tracking-tighter">{agents.length}</p>
                        </div>
                        <div className="h-10 w-px bg-white/5" />
                        <div className="text-right">
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-1">Status</p>
                            <div className="flex items-center gap-2 text-neon-green font-black uppercase tracking-widest text-[10px]">
                                <div className="h-2 w-2 bg-neon-green animate-pulse" />
                                Operacional
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-32 space-y-4">
                        <Loader2 className="h-10 w-10 text-neon-green animate-spin" />
                        <p className="text-slate-500 font-black uppercase tracking-[0.2em] text-[10px] animate-pulse">Iniciando redes neurais...</p>
                    </div>
                ) : filteredAgents.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredAgents.map(agent => (
                            <AgentCard
                                key={agent.id}
                                agent={agent}
                                userIsAdmin={userIsAdmin}
                                onEdit={handleEditAgent}
                                onDelete={handleDeleteAgent}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="bg-carbon border border-dashed border-white/10 sharp-edge py-32 flex flex-col items-center justify-center text-center animate-spring">
                        <div className="bg-black/40 p-6 sharp-edge mb-6">
                            <Sparkles className="h-10 w-10 text-slate-800" />
                        </div>
                        <h3 className="text-xl font-black text-white mb-2 font-outfit uppercase tracking-tighter">Nenhum agente encontrado</h3>
                        <p className="text-slate-500 max-w-xs mx-auto text-[10px] font-black uppercase tracking-[0.2em]">
                            {searchTerm ? 'Tente mudar o termo da busca.' : 'Comece criando seu primeiro agente personalizado para automação.'}
                        </p>
                        {searchTerm && (
                            <button 
                                onClick={() => setSearchTerm('')}
                                className="mt-6 text-neon-green hover:text-neon-green/80 font-black text-[10px] uppercase tracking-[0.2em]"
                            >
                                Limpar busca
                            </button>
                        )}
                    </div>
                )}
            </main>

            {/* Form Modal */}
            <AnimatePresence>
                {showForm && (
                    <AgentForm
                        agent={selectedAgent}
                        onClose={() => setShowForm(false)}
                        onSuccess={handleFormSuccess}
                    />
                )}
            </AnimatePresence>
        </div>
    )
}
