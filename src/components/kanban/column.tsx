"use client"

import { useState } from "react"
import { useSortable, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { KanbanCard } from "./card"
import { createCard } from "@/app/actions/card"
import { Plus, MoreHorizontal, Loader2, GripHorizontal, Palette, Trash2, X } from "lucide-react"
import { PhoneInput } from "../phone-input"
import { AnimatePresence, motion } from "framer-motion"

const COLORS = [
    "#6366f1", "#ec4899", "#14b8a6", "#f59e0b",
    "#8b5cf6", "#ef4444", "#10b981", "#3b82f6"
]

export function KanbanColumn({
    column,
    cards,
    workspaceId,
    globalCustomFields,
    onCardCreate,
    onCardUpdate,
    onCardDelete,
    onColumnUpdate,
    onColumnDelete
}: {
    column: any,
    cards: any[],
    workspaceId: string,
    globalCustomFields: string[],
    onCardCreate: (card: any) => void,
    onCardUpdate: (card: any) => void,
    onCardDelete: (id: string) => void,
    onColumnUpdate: (columnId: string, data: any) => void,
    onColumnDelete: (columnId: string) => void
}) {
    const [isAddingCard, setIsAddingCard] = useState(false)
    const [loading, setLoading] = useState(false)
    const [customFields, setCustomFields] = useState<{ key: string, value: string }[]>([])

    // UI states para exclusão e cores
    const [showMenu, setShowMenu] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

    // Modificado para useSortable para podermos arrastar a coluna toda
    const {
        setNodeRef,
        attributes,
        listeners,
        transform,
        transition,
        isDragging
    } = useSortable({
        id: column.id,
        data: {
            type: "Column",
            column,
        },
    })

    const style = {
        transition,
        transform: CSS.Translate.toString(transform),
    }

    const handleAddCard = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.currentTarget)

        const customData: Record<string, string> = {}
        customFields.forEach(field => {
            if (field.key) customData[field.key] = field.value
        })

        const cardData = {
            contact_name: formData.get("name"),
            contact_phone: formData.get("phone"),
            due_date: formData.get("due_date"),
            custom_data: customData
        }

        const result = await createCard(workspaceId, column.id, cardData)
        if (result.data) {
            onCardCreate(result.data)
            setIsAddingCard(false)
            setCustomFields([])
        }
        setLoading(false)
    }

    const columnColor = column.color || "#6366f1"

    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className="w-80 shrink-0 border-2 border-indigo-500/50 bg-slate-900/50 rounded-2xl opacity-50"
            />
        )
    }

    return (
        <div ref={setNodeRef} style={style} className="w-80 shrink-0 flex flex-col max-h-full">
            <div className="flex items-center justify-between mb-4 px-2 group relative">
                <div className="flex items-center gap-3">
                    <div
                        {...attributes}
                        {...listeners}
                        className="p-1 cursor-grab active:cursor-grabbing text-slate-600 hover:text-white transition-colors hover:bg-slate-800 rounded-md"
                    >
                        <GripHorizontal className="h-4 w-4" />
                    </div>
                    <div
                        className="w-2 h-2 rounded-full shadow-lg"
                        style={{ backgroundColor: columnColor, boxShadow: `0 0 10px ${columnColor}80` }}
                    />
                    <h2 className="text-sm font-bold text-slate-200 uppercase tracking-widest">{column.title}</h2>
                    <span className="bg-slate-900 text-slate-500 text-[10px] px-2 py-0.5 rounded-full border border-slate-800">
                        {cards.length}
                    </span>
                </div>
                <div className="relative">
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className="text-slate-500 hover:text-white transition-colors p-1 hover:bg-slate-900 rounded-md"
                    >
                        <MoreHorizontal className="h-4 w-4" />
                    </button>

                    {/* Dropdown Menu */}
                    <AnimatePresence>
                        {showMenu && (
                            <motion.div
                                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                className="absolute top-full right-0 mt-2 w-48 bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl p-2 z-50 overflow-hidden"
                            >
                                <div className="mb-2">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2 mb-2">Cores</p>
                                    <div className="flex flex-wrap gap-1 px-1">
                                        {COLORS.map(color => (
                                            <button
                                                key={color}
                                                onClick={() => {
                                                    onColumnUpdate(column.id, { color })
                                                    setShowMenu(false)
                                                }}
                                                className="w-6 h-6 rounded-full border-2 transition-transform hover:scale-110"
                                                style={{
                                                    backgroundColor: color,
                                                    borderColor: columnColor === color ? 'white' : 'transparent'
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <div className="h-px bg-slate-800 my-2" />
                                <button
                                    onClick={() => {
                                        setShowDeleteConfirm(true)
                                        setShowMenu(false)
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-rose-500/10 text-rose-400 rounded-xl transition-colors text-xs font-bold"
                                >
                                    <Trash2 className="h-3 w-3" />
                                    Excluir Coluna
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-3 min-h-[150px]">
                <SortableContext items={cards.map(c => c.id)} strategy={verticalListSortingStrategy}>
                    {cards.map((card) => (
                        <KanbanCard
                            key={card.id}
                            card={card}
                            workspaceId={workspaceId}
                            globalCustomFields={globalCustomFields}
                            onUpdate={onCardUpdate}
                            onDelete={onCardDelete}
                        />
                    ))}
                </SortableContext>

                {isAddingCard && (
                    <form onSubmit={handleAddCard} className="bg-slate-900 border border-indigo-500/30 p-4 rounded-2xl space-y-4 shadow-xl">
                        <div className="space-y-3">
                            <input name="name" placeholder="Nome do Contato" required className="w-full bg-slate-950 border border-slate-800 text-sm p-3 rounded-xl text-white focus:outline-none focus:border-indigo-500 transition-colors" />
                            <PhoneInput name="phone" required placeholder="Telefone" />
                            <input name="due_date" type="date" className="w-full bg-slate-950 border border-slate-800 text-sm p-3 rounded-xl text-white focus:outline-none focus:border-indigo-500 transition-colors color-scheme-dark" />

                            <div className="space-y-2 pt-2 border-t border-slate-800/50">
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Campos Adicionais</p>
                                {customFields.map((field, index) => (
                                    <div key={index} className="flex gap-2">
                                        <input
                                            placeholder="Chave"
                                            value={field.key}
                                            onChange={(e) => {
                                                const newFields = [...customFields]
                                                newFields[index].key = e.target.value
                                                setCustomFields(newFields)
                                            }}
                                            className="w-1/2 bg-slate-950 border border-slate-800 text-[10px] p-2 rounded-lg text-white"
                                        />
                                        <input
                                            placeholder="Valor"
                                            value={field.value}
                                            onChange={(e) => {
                                                const newFields = [...customFields]
                                                newFields[index].value = e.target.value
                                                setCustomFields(newFields)
                                            }}
                                            className="w-1/2 bg-slate-950 border border-slate-800 text-[10px] p-2 rounded-lg text-white"
                                        />
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => setCustomFields([...customFields, { key: "", value: "" }])}
                                    className="text-[10px] text-indigo-400 hover:text-indigo-300 font-medium"
                                >
                                    + Adicionar Campo
                                </button>
                            </div>
                        </div>

                        <div className="flex gap-2 pt-2 border-t border-slate-800/50">
                            <button type="submit" disabled={loading} className="flex-1 bg-white text-slate-950 text-xs font-bold py-2 rounded-xl hover:bg-slate-200 transition-all flex justify-center items-center">
                                {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Salvar"}
                            </button>
                            <button type="button" onClick={() => setIsAddingCard(false)} className="px-3 text-xs font-medium text-slate-400 hover:text-white transition-colors">
                                Cancelar
                            </button>
                        </div>
                    </form>
                )}

                {!isAddingCard && (
                    <button
                        onClick={() => {
                            setCustomFields(globalCustomFields.map(key => ({ key, value: "" })))
                            setIsAddingCard(true)
                        }}
                        className="w-full py-3 bg-slate-900/20 border border-dashed border-slate-800 hover:border-slate-700 hover:bg-slate-900/50 transition-colors rounded-2xl flex items-center justify-center gap-2 text-slate-500 text-xs"
                    >
                        <Plus className="h-3 w-3" />
                        Adicionar Card
                    </button>
                )}
            </div>

            {/* Modal de Exclusão de Coluna */}
            <AnimatePresence>
                {showDeleteConfirm && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl p-8 text-center"
                        >
                            <div className="w-16 h-16 bg-rose-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-rose-500/20">
                                <Trash2 className="h-8 w-8 text-rose-500" />
                            </div>

                            <h3 className="text-xl font-bold text-white font-outfit mb-2">Excluir Coluna?</h3>
                            <p className="text-slate-400 text-sm mb-8">
                                Esta ação não pode ser desfeita. Todos os cards pertencentes a esta coluna ({cards.length} cards) serão <b>permanentemente</b> apagados.
                            </p>

                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={() => {
                                        onColumnDelete(column.id)
                                        setShowDeleteConfirm(false)
                                    }}
                                    className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-rose-900/20 transition-all flex items-center justify-center gap-2"
                                >
                                    Sim, Excluir Coluna
                                </button>
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-4 rounded-2xl transition-all"
                                >
                                    Não, Cancelar
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
