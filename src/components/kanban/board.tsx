"use client"

import { useState, useMemo, useCallback } from "react"
import {
    DndContext,
    DragOverlay,
    PointerSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragOverEvent,
    DragEndEvent,
    defaultDropAnimationSideEffects,
    closestCorners
} from "@dnd-kit/core"
import { arrayMove, SortableContext, horizontalListSortingStrategy } from "@dnd-kit/sortable"
import { KanbanColumn } from "./column"
import { KanbanCard } from "./card"
import { ListView } from "./list-view"
import { CSVImporter } from "./csv-importer"
import { moveCard } from "@/app/actions/card"
import { createColumn, updateColumnOrder, updateColumn, deleteColumn } from "@/app/actions/column"
import { toast, Toaster } from "sonner"
import { refreshWorkspace } from "@/app/actions/workspace"
import { RefreshCw, Plus, LayoutGrid, List, Upload } from "lucide-react"
import { motion, LayoutGroup, AnimatePresence } from "framer-motion"

export function KanbanBoard({
    workspaceId,
    initialColumns,
    initialCards
}: {
    workspaceId: string,
    initialColumns: any[],
    initialCards: any[]
}) {
    const [columns, setColumns] = useState(initialColumns)
    const [cards, setCards] = useState(initialCards)
    const [activeCard, setActiveCard] = useState<any | null>(null)
    const [activeColumn, setActiveColumn] = useState<any | null>(null)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [view, setView] = useState<"kanban" | "list">("kanban")
    const [importingTo, setImportingTo] = useState<string | null>(null)
    const [isAddingColumn, setIsAddingColumn] = useState(false)
    const [newColumnTitle, setNewColumnTitle] = useState("")

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        })
    )

    // --- Callbacks de Estado ---
    const handleCardCreate = useCallback((newCard: any) => {
        setCards(prev => [newCard, ...prev])
    }, [])

    const handleBulkCreate = useCallback((newCards: any[]) => {
        setCards(prev => [...newCards, ...prev])
        setImportingTo(null)
    }, [])

    const handleCardUpdate = useCallback((updatedCard: any) => {
        setCards(prev => prev.map(c => c.id === updatedCard.id ? updatedCard : c))
    }, [])

    const handleBulkUpdate = useCallback((updatedCards: any[]) => {
        setCards(prev => {
            const updatedIds = new Set(updatedCards.map(c => c.id))
            return [...updatedCards, ...prev.filter(c => !updatedIds.has(c.id))]
        })
    }, [])

    const handleCardDelete = useCallback((cardId: string) => {
        setCards(prev => prev.filter(c => c.id !== cardId))
    }, [])

    const handleBulkDelete = useCallback((cardIds: string[]) => {
        const idsToRemove = new Set(cardIds)
        setCards(prev => prev.filter(c => !idsToRemove.has(c.id)))
    }, [])

    // --- Handlers de Ações ---
    const handleRefresh = async () => {
        setIsRefreshing(true)
        const promise = refreshWorkspace(workspaceId)
        toast.promise(promise, {
            loading: "Atualizando dados...",
            success: "Dados sincronizados com sucesso!",
            error: "Erro ao sincronizar dados."
        })
        await promise
        setIsRefreshing(false)
    }

    const handleCreateColumn = async () => {
        if (!newColumnTitle.trim()) return
        setIsAddingColumn(false)
        try {
            const order = columns.length
            const result = await createColumn(workspaceId, newColumnTitle, order)
            if (result.error) throw new Error(result.error)
            setColumns([...columns, result.data])
            setNewColumnTitle("")
            toast.success("Coluna criada!")
        } catch (error) {
            toast.error("Erro ao criar coluna.")
        }
    }

    const handleColumnUpdate = useCallback(async (columnId: string, data: any) => {
        setColumns(prev => prev.map(c => c.id === columnId ? { ...c, ...data } : c))

        try {
            await updateColumn(workspaceId, columnId, data)
        } catch (error) {
            toast.error("Erro ao atualizar coluna.")
        }
    }, [workspaceId])

    const handleColumnDelete = useCallback(async (columnId: string) => {
        setColumns(prev => prev.filter(c => c.id !== columnId))
        setCards(prev => prev.filter(c => c.column_id !== columnId))

        try {
            await deleteColumn(workspaceId, columnId)
            toast.success("Coluna excluída!")
        } catch (error) {
            toast.error("Erro ao excluir coluna.")
        }
    }, [workspaceId])

    // --- Handlers de Drag & Drop ---
    const handleDragStart = (event: DragStartEvent) => {
        if (event.active.data.current?.type === "Card") {
            setActiveCard(event.active.data.current.card)
        } else if (event.active.data.current?.type === "Column") {
            setActiveColumn(event.active.data.current.column)
        }
    }

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event
        if (!over) return
        const activeId = active.id
        const overId = over.id
        if (activeId === overId) return

        const isActiveACard = active.data.current?.type === "Card"
        const isOverACard = over.data.current?.type === "Card"

        if (isActiveACard && isOverACard) {
            setCards((prevCards) => {
                const activeIndex = prevCards.findIndex((c) => c.id === activeId)
                const overIndex = prevCards.findIndex((c) => c.id === overId)
                if (prevCards[activeIndex].column_id !== prevCards[overIndex].column_id) {
                    const newCards = [...prevCards]
                    newCards[activeIndex] = { ...newCards[activeIndex], column_id: prevCards[overIndex].column_id }
                    return arrayMove(newCards, activeIndex, overIndex)
                }
                return arrayMove(prevCards, activeIndex, overIndex)
            })
        }

        const isOverAColumn = over.data.current?.type === "Column"
        if (isActiveACard && isOverAColumn) {
            setCards((prevCards) => {
                const activeIndex = prevCards.findIndex((c) => c.id === activeId)
                const newCards = [...prevCards]
                newCards[activeIndex] = { ...newCards[activeIndex], column_id: overId as string }
                return arrayMove(newCards, activeIndex, activeIndex)
            })
        }
    }

    const handleDragEnd = useCallback(async (event: DragEndEvent) => {
        setActiveCard(null)
        setActiveColumn(null)
        const { active, over } = event
        if (!over) return

        if (active.data.current?.type === "Column") {
            const activeId = active.id
            const overId = over.id
            if (activeId !== overId) {
                const activeIndex = columns.findIndex(c => c.id === activeId)
                const overIndex = columns.findIndex(c => c.id === overId)
                const newColumns = arrayMove(columns, activeIndex, overIndex)

                setColumns(newColumns)

                const orderPayload = newColumns.map((col, index) => ({ id: col.id, order: index }))
                updateColumnOrder(workspaceId, orderPayload).catch(() => {
                    toast.error("Erro ao atualizar ordem das colunas")
                })
            }
            return
        }

        const cardId = active.id as string
        const card = cards.find(c => c.id === cardId)
        if (card) {
            try {
                await moveCard(workspaceId, cardId, card.column_id)
            } catch (error) {
                toast.error("Erro ao sincronizar posição.")
            }
        }
    }, [columns, cards, workspaceId])

    const globalCustomFields = useMemo(() => {
        const keys = new Set<string>()
        cards.forEach(c => {
            if (c.custom_data_jsonb) {
                Object.keys(c.custom_data_jsonb).forEach(k => keys.add(k))
            }
        })
        return Array.from(keys)
    }, [cards])

    return (
        <div className="flex flex-col h-full w-full space-y-6">
            <Toaster position="top-right" theme="dark" richColors />

            {/* Sub-Header: Refresh & Multi-View Switcher - Radical Style */}
            <div className="px-4 md:px-8 py-4 md:py-5 flex flex-col md:flex-row items-center justify-between gap-4 glass z-30 sticky top-0 shadow-2xl">
                <div className="flex items-center gap-5">
                    <button
                        onClick={handleRefresh}
                        className="flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-white transition-all uppercase tracking-[0.2em] bg-black/40 px-5 py-2.5 sharp-edge border border-white/5 hover:border-white/10"
                    >
                        <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                        Sincronizar
                    </button>
                    <div className="h-4 w-[1px] bg-white/5" />
                    <span className="text-[10px] text-neon-green font-black uppercase tracking-[0.2em] flex items-center gap-2">
                        <div className="h-1.5 w-1.5 bg-neon-green rounded-full animate-pulse" />
                        {cards.length} Cards Ativos
                    </span>
                </div>

                <div className="flex items-center gap-5">
                    <div className="flex bg-black/40 p-1 sharp-edge border border-white/5">
                        <button
                            onClick={() => setView("kanban")}
                            className={`flex items-center gap-2 px-6 py-2.5 sharp-edge text-[10px] font-black uppercase tracking-widest transition-all ${view === "kanban" ? 'bg-neon-green text-black shadow-lg shadow-neon-green/20' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            <LayoutGrid className="h-3.5 w-3.5" />
                            Quadro
                        </button>
                        <button
                            onClick={() => setView("list")}
                            className={`flex items-center gap-2 px-6 py-2.5 sharp-edge text-[10px] font-black uppercase tracking-widest transition-all ${view === "list" ? 'bg-neon-green text-black shadow-lg shadow-neon-green/20' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            <List className="h-3.5 w-3.5" />
                            Lista
                        </button>
                    </div>

                    <button
                        onClick={() => setImportingTo(columns[0]?.id)}
                        className="flex items-center gap-2 bg-white text-black px-6 py-2.5 sharp-edge transition-all shadow-xl hover:bg-slate-100 text-[10px] font-black uppercase tracking-widest border border-white/10"
                    >
                        <Upload className="h-3.5 w-3.5" />
                        Importar Dados
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 px-4 md:px-8 overflow-hidden min-h-0">
                {view === "kanban" ? (
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCorners}
                        onDragStart={handleDragStart}
                        onDragOver={handleDragOver}
                        onDragEnd={handleDragEnd}
                    >
                        <div className="flex h-full overflow-x-auto gap-4 md:gap-6 pb-8 scrollbar-hide snap-x snap-mandatory">
                            <SortableContext items={columns.map(c => c.id)} strategy={horizontalListSortingStrategy}>
                                <LayoutGroup>
                                    {columns.map((column) => (
                                        <KanbanColumn
                                            key={column.id}
                                            column={column}
                                            cards={cards.filter(c => c.column_id === column.id)}
                                            workspaceId={workspaceId}
                                            globalCustomFields={globalCustomFields}
                                            onCardCreate={handleCardCreate}
                                            onCardUpdate={handleCardUpdate}
                                            onCardDelete={handleCardDelete}
                                            onColumnUpdate={handleColumnUpdate}
                                            onColumnDelete={handleColumnDelete}
                                        />
                                    ))}
                                </LayoutGroup>
                            </SortableContext>

                            {/* Add Column Button */}
                            <motion.div layout className="w-80 shrink-0">
                                {isAddingColumn ? (
                                    <div className="bg-carbon border border-neon-green/30 p-5 sharp-edge space-y-4 shadow-2xl animate-spring">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-neon-green uppercase tracking-[0.2em] ml-1">Nova Coluna</label>
                                            <input
                                                autoFocus
                                                placeholder="TÍTULO DA COLUNA..."
                                                className="w-full bg-black/40 border border-white/5 text-white p-4 sharp-edge outline-none focus:border-neon-green/50 text-[10px] font-black uppercase tracking-widest"
                                                value={newColumnTitle}
                                                onChange={(e) => setNewColumnTitle(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleCreateColumn()}
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <button onClick={handleCreateColumn} className="w-full bg-neon-green text-black font-black uppercase tracking-widest py-3 sharp-edge text-xs">Criar Coluna</button>
                                            <button onClick={() => setIsAddingColumn(false)} className="w-full bg-white/5 text-slate-400 hover:text-white font-black uppercase tracking-widest py-3 sharp-edge text-xs transition-colors">Cancelar</button>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setIsAddingColumn(true)}
                                        className="w-full h-40 bg-black/20 border-2 border-dashed border-white/5 hover:border-neon-green/20 sharp-edge flex flex-col items-center justify-center gap-3 text-slate-600 hover:text-neon-green transition-all group animate-sparkle"
                                    >
                                        <div className="p-3 bg-white/5 sharp-edge group-hover:bg-neon-green/10 transition-colors">
                                            <Plus className="h-6 w-6" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Criar Nova Coluna</span>
                                    </button>
                                )}
                            </motion.div>
                        </div>

                        <DragOverlay dropAnimation={{
                            sideEffects: defaultDropAnimationSideEffects({
                                styles: { active: { opacity: "0.5" } },
                            }),
                        }}>
                            {activeCard ? (
                                <div className="scale-105 rotate-2">
                                    <KanbanCard
                                        card={activeCard}
                                        workspaceId={workspaceId}
                                        globalCustomFields={globalCustomFields}
                                        onUpdate={handleCardUpdate}
                                        onDelete={handleCardDelete}
                                    />
                                </div>
                            ) : null}
                            {activeColumn ? (
                                <div className="w-80 shrink-0 bg-carbon border border-neon-green/30 p-3 sharp-edge opacity-80">
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="w-2.5 h-2.5 sharp-edge"
                                            style={{ backgroundColor: activeColumn.color || "#6366f1" }}
                                        />
                                        <h2 className="text-xs font-black text-white uppercase">{activeColumn.title}</h2>
                                    </div>
                                </div>
                            ) : null}
                        </DragOverlay>
                    </DndContext>
                ) : (
                    <ListView
                        workspaceId={workspaceId}
                        columns={columns}
                        cards={cards}
                        onCardsUpdate={handleBulkUpdate}
                        onCardsDelete={handleBulkDelete}
                    />
                )}
            </div>

            {/* CSV Import Modal */}
            <AnimatePresence>
                {importingTo && (
                    <CSVImporter
                        workspaceId={workspaceId}
                        columnId={importingTo}
                        onImportComplete={handleBulkCreate}
                        onClose={() => setImportingTo(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    )
}
