"use client"

import { useState } from "react"
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
import { createColumn } from "@/app/actions/column"
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
    const handleCardCreate = (newCard: any) => {
        setCards(prev => [newCard, ...prev])
    }

    const handleBulkCreate = (newCards: any[]) => {
        setCards(prev => [...newCards, ...prev])
        setImportingTo(null)
    }

    const handleCardUpdate = (updatedCard: any) => {
        setCards(prev => prev.map(c => c.id === updatedCard.id ? updatedCard : c))
    }

    const handleBulkUpdate = (updatedCards: any[]) => {
        setCards(prev => {
            const updatedIds = new Set(updatedCards.map(c => c.id))
            return [...updatedCards, ...prev.filter(c => !updatedIds.has(c.id))]
        })
    }

    const handleCardDelete = (cardId: string) => {
        setCards(prev => prev.filter(c => c.id !== cardId))
    }

    const handleBulkDelete = (cardIds: string[]) => {
        const idsToRemove = new Set(cardIds)
        setCards(prev => prev.filter(c => !idsToRemove.has(c.id)))
    }

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

    // --- Handlers de Drag & Drop ---
    const handleDragStart = (event: DragStartEvent) => {
        if (event.active.data.current?.type === "Card") {
            setActiveCard(event.active.data.current.card)
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

    const handleDragEnd = async (event: DragEndEvent) => {
        setActiveCard(null)
        const { active, over } = event
        if (!over) return
        const cardId = active.id as string
        const card = cards.find(c => c.id === cardId)
        if (card) {
            try {
                await moveCard(workspaceId, cardId, card.column_id)
            } catch (error) {
                toast.error("Erro ao sincronizar posição.")
            }
        }
    }

    return (
        <div className="flex flex-col h-full w-full space-y-6">
            <Toaster position="top-right" theme="dark" richColors />

            {/* Sub-Header: Refresh & Multi-View Switcher */}
            <div className="px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-4 border-b border-white/5 bg-white/[0.02] backdrop-blur-sm shadow-xl">
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleRefresh}
                        className="flex items-center gap-2 text-[10px] font-bold text-slate-400 hover:text-white transition-all uppercase tracking-widest bg-slate-900 shadow-inner px-4 py-2 rounded-2xl border border-slate-800"
                    >
                        <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                        Sincronizar
                    </button>
                    <div className="h-4 w-px bg-slate-800" />
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                        {cards.length} Cards
                    </span>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800">
                        <button
                            onClick={() => setView("kanban")}
                            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-[11px] font-bold uppercase transition-all ${view === "kanban" ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            <LayoutGrid className="h-3.5 w-3.5" />
                            Kanban
                        </button>
                        <button
                            onClick={() => setView("list")}
                            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-[11px] font-bold uppercase transition-all ${view === "list" ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            <List className="h-3.5 w-3.5" />
                            Lista
                        </button>
                    </div>

                    <button
                        onClick={() => setImportingTo(columns[0]?.id)}
                        className="flex items-center gap-2 bg-white text-black px-5 py-2 rounded-2xl transition-all shadow-xl hover:bg-slate-100 text-[11px] font-bold uppercase"
                    >
                        <Upload className="h-3.5 w-3.5" />
                        Importar CSV
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 px-8 overflow-hidden">
                {view === "kanban" ? (
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCorners}
                        onDragStart={handleDragStart}
                        onDragOver={handleDragOver}
                        onDragEnd={handleDragEnd}
                    >
                        <div className="flex h-full overflow-x-auto gap-6 pb-8 scrollbar-hide">
                            <SortableContext items={columns.map(c => c.id)} strategy={horizontalListSortingStrategy}>
                                <LayoutGroup>
                                    {columns.map((column) => (
                                        <KanbanColumn
                                            key={column.id}
                                            column={column}
                                            cards={cards.filter(c => c.column_id === column.id)}
                                            workspaceId={workspaceId}
                                            onCardCreate={handleCardCreate}
                                            onCardUpdate={handleCardUpdate}
                                            onCardDelete={handleCardDelete}
                                        />
                                    ))}
                                </LayoutGroup>
                            </SortableContext>

                            {/* Add Column Button */}
                            <motion.div layout className="w-80 shrink-0">
                                {isAddingColumn ? (
                                    <div className="bg-slate-900/40 border-2 border-indigo-500/30 p-4 rounded-3xl space-y-3">
                                        <input
                                            autoFocus
                                            placeholder="Título da coluna..."
                                            className="w-full bg-slate-950 border border-slate-800 text-white p-3 rounded-2xl outline-none focus:border-indigo-500 text-sm"
                                            value={newColumnTitle}
                                            onChange={(e) => setNewColumnTitle(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleCreateColumn()}
                                        />
                                        <div className="flex gap-2">
                                            <button onClick={handleCreateColumn} className="flex-1 bg-indigo-600 text-white font-bold py-2 rounded-xl text-xs">Adicionar</button>
                                            <button onClick={() => setIsAddingColumn(false)} className="px-4 bg-slate-800 text-white font-bold py-2 rounded-xl text-xs">Cancelar</button>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setIsAddingColumn(true)}
                                        className="w-full h-40 bg-slate-900/10 border-2 border-dashed border-slate-800/50 hover:border-indigo-500/30 rounded-3xl flex flex-col items-center justify-center gap-2 text-slate-500 hover:text-indigo-400 transition-all group"
                                    >
                                        <Plus className="h-6 w-6" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Nova Coluna</span>
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
                                        onUpdate={handleCardUpdate}
                                        onDelete={handleCardDelete}
                                    />
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
