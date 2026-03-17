"use client"

import React, { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Command, Bot, LayoutGrid, X, ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

const ACTIONS = [
    { id: "dash", title: "Ir para Dashboard", href: "/", icon: LayoutGrid, category: "Navegação" },
    { id: "agents", title: "Ver Agentes IA", href: "/agents", icon: Bot, category: "Navegação" },
    { id: "new-agent", title: "Criar Novo Agente", href: "/agents/new", icon: Bot, category: "Ações" },
]

export function CommandPalette() {
    const [isOpen, setIsOpen] = useState(false)
    const [search, setSearch] = useState("")
    const [selectedIndex, setSelectedIndex] = useState(0)
    const router = useRouter()

    const filteredActions = ACTIONS.filter(action => 
        action.title.toLowerCase().includes(search.toLowerCase()) ||
        action.category.toLowerCase().includes(search.toLowerCase())
    )

    const handleSelect = useCallback((href: string) => {
        router.push(href)
        setIsOpen(false)
        setSearch("")
    }, [router])

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault()
                setIsOpen(prev => !prev)
            }
            if (e.key === "Escape") setIsOpen(false)
            
            if (isOpen) {
                if (e.key === "ArrowDown") {
                    e.preventDefault()
                    setSelectedIndex(prev => (prev + 1) % filteredActions.length)
                }
                if (e.key === "ArrowUp") {
                    e.preventDefault()
                    setSelectedIndex(prev => (prev - 1 + filteredActions.length) % filteredActions.length)
                }
                if (e.key === "Enter" && filteredActions[selectedIndex]) {
                    e.preventDefault()
                    handleSelect(filteredActions[selectedIndex].href)
                }
            }
        }

        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [isOpen, filteredActions, selectedIndex, handleSelect])

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] px-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 bg-black/80 backdrop-blur-md"
                    />
                    
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        className="relative w-full max-w-xl glass sharp-edge overflow-hidden shadow-2xl border border-white/10"
                    >
                        <div className="flex items-center px-4 py-4 border-b border-white/5 bg-white/5">
                            <Search className="h-4 w-4 text-slate-500 mr-3" />
                            <input
                                autoFocus
                                placeholder="Pressione para buscar..."
                                className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder:text-slate-600 font-bold uppercase tracking-widest"
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value)
                                    setSelectedIndex(0)
                                }}
                            />
                            <div className="flex items-center gap-1 px-2 py-1 bg-black/40 border border-white/10 sharp-edge">
                                <span className="text-[10px] text-slate-500 font-black">ESC</span>
                            </div>
                        </div>

                        <div className="max-h-[60vh] overflow-y-auto p-2 scrollbar-hide">
                            {filteredActions.length > 0 ? (
                                <div className="space-y-1">
                                    {filteredActions.map((action, index) => {
                                        const Icon = action.icon
                                        const isSelected = index === selectedIndex
                                        return (
                                            <button
                                                key={action.id}
                                                onClick={() => handleSelect(action.href)}
                                                onMouseEnter={() => setSelectedIndex(index)}
                                                className={cn(
                                                    "w-full flex items-center justify-between p-3 sharp-edge transition-all group",
                                                    isSelected ? "bg-neon-green text-black" : "text-slate-400 hover:bg-white/5 hover:text-white"
                                                )}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Icon className={cn("h-4 w-4", isSelected ? "text-black" : "text-neon-green")} />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">{action.title}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className={cn("text-[8px] font-black uppercase tracking-widest px-2 py-0.5 sharp-edge border", 
                                                        isSelected ? "border-black/20 text-black/60" : "border-white/5 text-slate-600"
                                                    )}>
                                                        {action.category}
                                                    </span>
                                                    {isSelected && <ChevronRight className="h-3 w-3" />}
                                                </div>
                                            </button>
                                        )
                                    })}
                                </div>
                            ) : (
                                <div className="py-12 text-center">
                                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Nenhum rastro encontrado...</p>
                                </div>
                            )}
                        </div>

                        <div className="px-4 py-3 bg-white/5 border-t border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1.5">
                                    <kbd className="px-1.5 py-0.5 bg-black/40 border border-white/10 sharp-edge text-[8px] text-slate-500 font-black">↑↓</kbd>
                                    <span className="text-[8px] text-slate-600 font-black uppercase tracking-widest">Navegar</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <kbd className="px-1.5 py-0.5 bg-black/40 border border-white/10 sharp-edge text-[8px] text-slate-500 font-black">ENTER</kbd>
                                    <span className="text-[8px] text-slate-600 font-black uppercase tracking-widest">Selecionar</span>
                                </div>
                            </div>
                            <span className="text-[8px] text-neon-green/40 font-black uppercase tracking-[0.2em]">AutoKanban Engine v2.1</span>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
