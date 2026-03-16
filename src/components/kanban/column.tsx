"use client"

import { useState } from "react"
import { useSortable, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { KanbanCard } from "./card"
import { createCard } from "@/app/actions/card"
import { toast } from "sonner"
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

        try {
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
            
            if (result?.error) {
                toast.error(`Erro ao criar card: ${result.error}`)
            } else if (result?.data) {
                onCardCreate(result.data)
                setIsAddingCard(false)
                setCustomFields([])
                toast.success("Card criado com sucesso!")
            }
        } catch (error: any) {
            toast.error("Erro inesperado ao criar card.")
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const columnColor = column.color || "#6366f1"

    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className="w-80 shrink-0 border-2 border-neon-green/30 bg-carbon/50 sharp-edge opacity-50 shadow-2xl animate-pulse"
            />
        )
    }

    return (
        <div ref={setNodeRef} style={style} className="w-80 shrink-0 flex flex-col max-h-full">
            <div className="flex items-center justify-between mb-4 px-2 group relative">
                <div className="flex items-center gap-4">
                    <div
                        {...attributes}
                        {...listeners}
                        className="p-1.5 cursor-grab active:cursor-grabbing text-slate-600 hover:text-white transition-colors hover:bg-white/5 sharp-edge"
                    >
                        <GripHorizontal className="h-4 w-4" />
                    </div>
                    <div
                        className="w-2.5 h-2.5 sharp-edge shadow-lg"
                        style={{ backgroundColor: columnColor, boxShadow: `0 0 10px ${columnColor}CC` }}
                    />
                    <h2 className="text-[11px] font-black text-white font-outfit uppercase tracking-tighter truncate max-w-[140px] leading-none">{column.title}</h2>
                    <span className="bg-black/40 text-neon-green text-[10px] px-2.5 py-1 sharp-edge border border-white/5 font-black">
                        {cards.length}
                    </span>
                </div>
                <div className="relative">
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className="text-slate-600 hover:text-white transition-colors p-1.5 hover:bg-white/5 sharp-edge"
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
                                className="absolute top-full right-0 mt-2 w-48 bg-carbon border border-white/10 sharp-edge shadow-2xl p-2.5 z-50 overflow-hidden"
                            >
                                <div className="mb-3">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-2 mb-3">Cromatismo</p>
                                    <div className="grid grid-cols-4 gap-2 px-1">
                                        {COLORS.map(color => (
                                            <button
                                                key={color}
                                                onClick={() => {
                                                    onColumnUpdate(column.id, { color })
                                                    setShowMenu(false)
                                                }}
                                                className="w-full aspect-square sharp-edge border-2 transition-transform hover:scale-105"
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
                                    className="w-full flex items-center justify-center gap-2 px-3 py-3 hover:bg-signal-orange/10 text-signal-orange sharp-edge transition-colors text-[10px] font-black uppercase tracking-widest border border-signal-orange/20"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    Expurgar Coluna
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

                    <form onSubmit={handleAddCard} className="bg-carbon border border-neon-green/30 p-5 sharp-edge space-y-5 shadow-2xl animate-spring">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-neon-green uppercase tracking-[0.2em] ml-1">Efetivar Lead</label>
                                <input name="name" placeholder="NOME DO CONTATO" required className="w-full bg-black/40 border border-white/5 text-xs p-4 sharp-edge text-white focus:outline-none focus:border-neon-green/50 transition-colors placeholder:text-slate-700 font-black uppercase tracking-widest" />
                            </div>
                            <PhoneInput name="phone" required placeholder="TELEFONE" />
                            <input name="due_date" type="date" className="w-full bg-black/40 border border-white/5 text-xs p-4 sharp-edge text-white focus:outline-none focus:border-neon-green/50 transition-colors color-scheme-dark font-black uppercase tracking-widest" />

                            <div className="space-y-3 pt-4 border-t border-white/5">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Metadados</p>
                                {customFields.map((field, index) => (
                                    <div key={index} className="flex gap-2">
                                        <input
                                            placeholder="CHAVE"
                                            value={field.key}
                                            onChange={(e) => {
                                                const newFields = [...customFields]
                                                newFields[index].key = e.target.value
                                                setCustomFields(newFields)
                                            }}
                                            className="w-1/2 bg-black/40 border border-white/5 text-[9px] font-black uppercase tracking-widest p-2 sharp-edge text-white focus:border-neon-green/30 outline-none"
                                        />
                                        <input
                                            placeholder="VALOR"
                                            value={field.value}
                                            onChange={(e) => {
                                                const newFields = [...customFields]
                                                newFields[index].value = e.target.value
                                                setCustomFields(newFields)
                                            }}
                                            className="w-1/2 bg-black/40 border border-white/5 text-[9px] font-black uppercase tracking-widest p-2 sharp-edge text-white focus:border-neon-green/30 outline-none"
                                        />
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => setCustomFields([...customFields, { key: "", value: "" }])}
                                    className="text-[9px] text-neon-green hover:underline font-black uppercase tracking-[0.2em] transition-all"
                                >
                                    + Inserir Dado
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 pt-4 border-t border-white/5">
                            <button type="submit" disabled={loading} className="w-full bg-neon-green text-black text-[10px] font-black uppercase tracking-widest py-3 sharp-edge hover:bg-neon-green/90 transition-all flex justify-center items-center gap-2">
                                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Efetivar Registro <Plus className="h-3.5 w-3.5" /></>}
                            </button>
                            <button type="button" onClick={() => setIsAddingCard(false)} className="w-full py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors sharp-edge bg-white/5">
                                Abortar
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
                        className="w-full py-4 bg-black/20 border border-dashed border-white/10 hover:border-neon-green/30 hover:bg-neon-green/5 transition-all sharp-edge flex items-center justify-center gap-2 text-slate-600 hover:text-neon-green text-[10px] font-black uppercase tracking-widest animate-sparkle"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        Injetar Card
                    </button>
                )}
            </div>

            {/* Modal de Exclusão de Coluna - Radical Style */}
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

                            <h3 className="text-xl font-black text-white font-outfit uppercase tracking-tighter mb-2">Expurgar Coluna?</h3>
                            <p className="text-slate-400 text-[11px] font-bold uppercase tracking-tight mb-8 leading-relaxed">
                                Esta operação é irreversível. Todos os <b>{cards.length}</b> registros associados serão deletados.
                            </p>

                            <div className="flex flex-col gap-4">
                                <button
                                    onClick={() => {
                                        onColumnDelete(column.id)
                                        setShowDeleteConfirm(false)
                                    }}
                                    className="w-full bg-signal-orange text-black font-black uppercase tracking-widest py-4 sharp-edge shadow-lg transition-all flex items-center justify-center gap-2 text-xs"
                                >
                                    Confirmar Expurgo
                                </button>
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="w-full bg-white/5 text-slate-400 hover:text-white font-black uppercase tracking-widest py-4 sharp-edge transition-all text-xs"
                                >
                                    Abortar
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
