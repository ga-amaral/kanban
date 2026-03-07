"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Search, Filter, MoreHorizontal, User, Phone,
    Calendar, Tag, ChevronDown, CheckSquare, Square,
    Trash2, ArrowRight, X, Loader2
} from "lucide-react"
import { bulkMoveCards, bulkDeleteCards } from "@/app/actions/card"
import { toast } from "sonner"

export function ListView({
    workspaceId,
    columns,
    cards,
    onCardsUpdate,
    onCardsDelete
}: {
    workspaceId: string,
    columns: any[],
    cards: any[],
    onCardsUpdate: (updatedCards: any[]) => void,
    onCardsDelete: (cardIds: string[]) => void
}) {
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    const [search, setSearch] = useState("")
    const [isProcessing, setIsProcessing] = useState(false)
    const [showBulkMove, setShowBulkMove] = useState(false)

    const filteredCards = cards.filter(c =>
        c.contact_name.toLowerCase().includes(search.toLowerCase()) ||
        c.contact_phone.includes(search)
    )

    const toggleSelect = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        )
    }

    const toggleSelectAll = () => {
        if (selectedIds.length === filteredCards.length) {
            setSelectedIds([])
        } else {
            setSelectedIds(filteredCards.map(c => c.id))
        }
    }

    const handleBulkDelete = async () => {
        if (!confirm(`Deseja realmente excluir ${selectedIds.length} cards?`)) return

        setIsProcessing(true)
        const result = await bulkDeleteCards(workspaceId, selectedIds)
        if (result.success) {
            toast.success(`${selectedIds.length} cards excluídos.`)
            onCardsDelete(selectedIds)
            setSelectedIds([])
        } else {
            toast.error("Erro ao excluir cards.")
        }
        setIsProcessing(false)
    }

    const handleBulkMove = async (toColumnId: string) => {
        setIsProcessing(true)
        const result = await bulkMoveCards(workspaceId, selectedIds, toColumnId)
        if (result.data) {
            toast.success(`${selectedIds.length} cards movidos.`)
            onCardsUpdate(result.data)
            setSelectedIds([])
            setShowBulkMove(false)
        } else {
            toast.error("Erro ao mover cards.")
        }
        setIsProcessing(false)
    }

    return (
        <div className="space-y-6 relative pb-32">
            {/* Header / Search */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:max-w-md group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                    <input
                        placeholder="Buscar contatos, telefones..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-slate-900/50 border border-slate-800 text-white pl-12 pr-4 py-3 rounded-2xl focus:border-indigo-500 transition-all outline-none"
                    />
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="text-xs text-slate-500 font-medium px-4 py-2 bg-slate-900/50 border border-slate-800 rounded-xl">
                        {filteredCards.length} de {cards.length} cards
                    </div>
                </div>
            </div>

            {/* List Table */}
            <div className="bg-slate-950/40 border border-slate-800 rounded-[32px] overflow-hidden shadow-2xl">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-white/[0.02] border-b border-slate-800">
                            <th className="p-5 text-left w-12">
                                <button onClick={toggleSelectAll} className="text-slate-500 hover:text-indigo-400 transition-colors">
                                    {selectedIds.length === filteredCards.length && filteredCards.length > 0 ? (
                                        <CheckSquare className="h-5 w-5 text-indigo-500" />
                                    ) : (
                                        <Square className="h-5 w-5" />
                                    )}
                                </button>
                            </th>
                            <th className="p-5 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">Contato</th>
                            <th className="p-5 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">Telefone</th>
                            <th className="p-5 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">Coluna</th>
                            <th className="p-5 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">Entrega</th>
                            <th className="p-5 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                        {filteredCards.map((card) => {
                            const column = columns.find(c => c.id === card.column_id)
                            const isSelected = selectedIds.includes(card.id)

                            return (
                                <motion.tr
                                    key={card.id}
                                    layout
                                    className={`group transition-colors ${isSelected ? 'bg-indigo-500/5' : 'hover:bg-white/[0.01]'}`}
                                >
                                    <td className="p-5">
                                        <button onClick={() => toggleSelect(card.id)} className="text-slate-600 hover:text-indigo-400 transition-colors">
                                            {isSelected ? <CheckSquare className="h-4 w-4 text-indigo-500" /> : <Square className="h-4 w-4" />}
                                        </button>
                                    </td>
                                    <td className="p-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-slate-800 rounded-xl flex items-center justify-center font-bold text-slate-400 text-xs">
                                                {card.contact_name[0]}
                                            </div>
                                            <span className="text-sm font-bold text-white font-outfit">{card.contact_name}</span>
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <div className="flex items-center gap-2 text-slate-400 text-xs">
                                            <Phone className="h-3 w-3" />
                                            {card.contact_phone}
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <div className="inline-flex items-center gap-1.5 bg-slate-800/50 border border-slate-700 px-3 py-1 rounded-full text-[10px] text-slate-300 font-medium capitalize">
                                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                            {column?.title || "S/ Coluna"}
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <div className="flex items-center gap-2 text-slate-400 text-xs">
                                            <Calendar className="h-3 w-3" />
                                            {card.due_date ? new Date(card.due_date).toLocaleDateString() : "-"}
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-500 transition-colors">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </button>
                                    </td>
                                </motion.tr>
                            )
                        })}
                        {filteredCards.length === 0 && (
                            <tr>
                                <td colSpan={6} className="p-20 text-center">
                                    <p className="text-slate-500 text-sm italic">Nenhum card encontrado para esta busca.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Floating Action Bar */}
            <AnimatePresence>
                {selectedIds.length > 0 && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] bg-slate-900 border border-indigo-500/30 p-4 rounded-[40px] shadow-2xl flex items-center gap-6 backdrop-blur-xl"
                    >
                        <div className="flex items-center gap-3 px-2 border-r border-slate-800 mr-2">
                            <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-600/20">
                                {selectedIds.length}
                            </div>
                            <span className="text-sm text-slate-300 font-medium">Cards Selecionados</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <button
                                    onClick={() => setShowBulkMove(!showBulkMove)}
                                    className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-indigo-400 font-bold px-6 py-3 rounded-2xl transition-all text-sm border border-slate-700"
                                >
                                    <ArrowRight className="h-4 w-4" />
                                    Mover para...
                                </button>

                                {showBulkMove && (
                                    <div className="absolute bottom-full mb-3 left-0 w-64 bg-slate-900 border border-slate-800 rounded-[24px] shadow-2xl p-2 overflow-hidden animate-in fade-in slide-in-from-bottom-2">
                                        {columns.map(col => (
                                            <button
                                                key={col.id}
                                                onClick={() => handleBulkMove(col.id)}
                                                className="w-full text-left px-4 py-3 hover:bg-indigo-500/10 hover:text-indigo-400 rounded-xl text-xs text-slate-400 font-bold transition-colors flex items-center justify-between group"
                                            >
                                                {col.title}
                                                <ChevronDown className="h-3 w-3 -rotate-90 opacity-0 group-hover:opacity-100 transition-all" />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={handleBulkDelete}
                                className="flex items-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 font-bold px-6 py-3 rounded-2xl transition-all text-sm border border-rose-500/20"
                            >
                                <Trash2 className="h-4 w-4" />
                                Excluir Todos
                            </button>

                            <button
                                onClick={() => setSelectedIds([])}
                                className="p-3 text-slate-500 hover:text-white transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {isProcessing && (
                            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm rounded-[40px] flex items-center justify-center gap-4">
                                <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
                                <span className="text-white font-bold text-sm">Processando...</span>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
