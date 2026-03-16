import { useState, useEffect } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { User, Phone, Calendar, GripVertical, Eye, EyeOff, Plus, Trash2, Edit2, X, Loader2, ChevronRight, ArrowRight, MoreVertical } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { updateCard, deleteCard } from "@/app/actions/card"
import { toast } from "sonner"

export function KanbanCard({
    card,
    workspaceId,
    globalCustomFields,
    onUpdate,
    onDelete
}: {
    card: any,
    workspaceId: string,
    globalCustomFields: string[],
    onUpdate: (card: any) => void,
    onDelete: (id: string) => void
}) {
    const [showPhone, setShowPhone] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [showMenu, setShowMenu] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [editCustomFields, setEditCustomFields] = useState<{ key: string, value: string }[]>([])

    // Ao abrir o modal de edição, preencher os campos customizados
    useEffect(() => {
        if (isEditing) {
            const currentData = card.custom_data_jsonb || {}

            // Garantir que todas as chaves globais apareçam
            const allKeys = Array.from(new Set([
                ...globalCustomFields,
                ...Object.keys(currentData)
            ]))

            const fields = allKeys.map(key => ({
                key,
                value: currentData[key] ? String(currentData[key]) : ""
            }))

            setEditCustomFields(fields)
        } else {
            setEditCustomFields([])
        }
    }, [isEditing, card.custom_data_jsonb, globalCustomFields])

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({
        id: card.id,
        data: {
            type: "Card",
            card,
        },
    })

    const style = {
        transition,
        transform: CSS.Translate.toString(transform),
    }

    const handleDelete = async () => {
        setIsDeleting(true)
        const result = await deleteCard(workspaceId, card.id)
        if (result.success) {
            onDelete(card.id)
            toast.success("Card excluído")
        } else {
            toast.error("Erro ao excluir")
            setIsDeleting(false)
        }
        setShowDeleteConfirm(false)
    }

    const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsSaving(true)
        const formData = new FormData(e.currentTarget)

        // Mapear campos customizados do estado para objeto
        const customData: Record<string, string> = {}
        editCustomFields.forEach(f => {
            if (f.key) customData[f.key] = f.value
        })

        const cardData = {
            contact_name: formData.get("name"),
            contact_phone: formData.get("phone"),
            due_date: formData.get("due_date"),
            custom_data: customData
        }

        const result = await updateCard(workspaceId, card.id, cardData)
        if (result.data) {
            onUpdate(result.data)
            setIsEditing(false)
            toast.success("Card atualizado")
        } else {
            toast.error("Erro ao atualizar")
        }
        setIsSaving(false)
    }

    const maskPhone = (phone: string) => {
        if (!phone) return ""
        if (showPhone) return phone
        return phone.replace(/(\d{2}) (\d{1})(\d{4})-(\d{4})/, "$1 $2****-$4")
    }

    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className="bg-slate-900/50 border border-indigo-500/50 p-4 rounded-2xl h-[120px] opacity-50 ring-2 ring-indigo-500/20"
            />
        )
    }

    return (
        <>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -2, scale: 1.01 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                ref={setNodeRef}
                style={style}
                className={`bg-carbon border border-white/5 p-5 sharp-edge shadow-2xl hover:border-neon-green/30 transition-all group relative cursor-grab active:cursor-grabbing hover:shadow-neon-green/5 ${isDeleting ? 'opacity-50 grayscale' : ''}`}
            >
                {/* Botão de Menu */}
                <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            setIsEditing(true)
                        }}
                        className="p-1.5 hover:bg-white/5 sharp-edge text-slate-500 hover:text-white transition-colors"
                    >
                        <Edit2 className="h-3 w-3" />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            setShowDeleteConfirm(true)
                        }}
                        className="p-1.5 hover:bg-signal-orange/20 sharp-edge text-slate-500 hover:text-signal-orange transition-colors"
                    >
                        {isDeleting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                    </button>
                    <div
                        {...attributes}
                        {...listeners}
                        className="p-1.5 hover:bg-white/5 sharp-edge cursor-grab active:cursor-grabbing"
                    >
                        <GripVertical className="h-3 w-3 text-slate-600" />
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex items-start gap-3 pr-12">
                        <div className="mt-0.5 bg-neon-green/10 p-2 sharp-edge border border-neon-green/20">
                            <User className="h-4 w-4 text-neon-green" />
                        </div>
                        <h3 className="text-xs font-black text-white font-outfit uppercase tracking-tighter truncate mt-1 leading-none">
                            {card.contact_name}
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                        <div className="flex items-center justify-between group/phone bg-black/40 px-3 py-2 sharp-edge border border-white/5">
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                                <Phone className="h-3 w-3 text-neon-green/70" />
                                <span className="font-mono tracking-widest">{maskPhone(card.contact_phone)}</span>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setShowPhone(!showPhone)
                                }}
                                className="text-slate-600 hover:text-neon-green p-1 opacity-0 group-hover:opacity-100 transition-all"
                            >
                                {showPhone ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                            </button>
                        </div>

                        {card.due_date && (
                            <div className="flex items-center gap-2 text-[9px] text-signal-orange font-black uppercase tracking-widest px-3 py-1 bg-signal-orange/5 sharp-edge border border-signal-orange/10 w-fit">
                                <Calendar className="h-3 w-3" />
                                {new Date(card.due_date).toLocaleDateString('pt-BR')}
                            </div>
                        )}
                    </div>                    {/* Campos Customizados - Radical Tags */}
                    {card.custom_data_jsonb && Object.keys(card.custom_data_jsonb).length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-3 border-t border-white/5 mt-3">
                            {Object.entries(card.custom_data_jsonb).map(([key, value]: [string, any]) => (
                                <div key={key} className="bg-black/40 px-2.5 py-1 sharp-edge text-[9px] text-neon-green/80 border border-white/5 font-black uppercase tracking-widest flex items-center gap-1.5">
                                    <span className="text-slate-600">{key}:</span>
                                    {value}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Modal de Edição */}
            <AnimatePresence>
                {isEditing && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-carbon border border-white/10 w-full max-w-md sharp-edge overflow-hidden shadow-2xl"
                        >
                            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-black/40">
                                <h3 className="text-lg font-black text-white font-outfit uppercase tracking-tighter">Modificar Lead</h3>
                                <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-white/5 sharp-edge transition-colors">
                                    <X className="h-5 w-5 text-slate-500" />
                                </button>
                            </div>

                             <form onSubmit={handleUpdate} className="p-8 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-neon-green uppercase tracking-[0.2em] ml-1">Assinatura</label>
                                    <input
                                        name="name"
                                        defaultValue={card.contact_name}
                                        required
                                        className="w-full bg-black/40 border border-white/5 text-white p-4 sharp-edge focus:border-neon-green/50 outline-none transition-all placeholder:text-slate-700 text-xs font-black uppercase tracking-widest"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-neon-green uppercase tracking-[0.2em] ml-1">Vetores de Contato</label>
                                    <input
                                        name="phone"
                                        defaultValue={card.contact_phone}
                                        required
                                        className="w-full bg-black/40 border border-white/5 text-white p-4 sharp-edge focus:border-neon-green/50 outline-none transition-all placeholder:text-slate-700 text-xs font-black uppercase tracking-widest"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-neon-green uppercase tracking-[0.2em] ml-1">Cronograma</label>
                                    <input
                                        name="due_date"
                                        type="date"
                                        defaultValue={card.due_date ? new Date(card.due_date).toISOString().split('T')[0] : ""}
                                        className="w-full bg-black/40 border border-white/5 text-white p-4 sharp-edge focus:border-neon-green/50 outline-none transition-all color-scheme-dark text-xs font-black uppercase tracking-widest"
                                    />
                                </div>

                                <div className="space-y-4 pt-2">
                                    <div className="flex items-center justify-between px-1">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Metadados Dinâmicos</label>
                                        <button
                                            type="button"
                                            onClick={() => setEditCustomFields([...editCustomFields, { key: "", value: "" }])}
                                            className="text-[10px] text-neon-green hover:underline font-black uppercase tracking-widest"
                                        >
                                            + Inserir
                                        </button>
                                    </div>

                                    <div className="space-y-2 max-h-[150px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-800">
                                        <AnimatePresence mode="popLayout">
                                            {editCustomFields.map((field, index) => (
                                                <motion.div
                                                    key={index}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, scale: 0.9 }}
                                                    className="flex gap-2 group/field"
                                                >
                                                    <input
                                                        placeholder="CHAVE"
                                                        value={field.key}
                                                        onChange={(e) => {
                                                            const newFields = [...editCustomFields]
                                                            newFields[index].key = e.target.value
                                                            setEditCustomFields(newFields)
                                                        }}
                                                        className="w-1/3 bg-black/40 border border-white/5 text-[9px] font-black uppercase p-2.5 sharp-edge text-white outline-none focus:border-neon-green/30"
                                                    />
                                                    <ArrowRight className="h-3 w-3 text-slate-700 self-center shrink-0" />
                                                    <input
                                                        placeholder="VALOR"
                                                        value={field.value}
                                                        onChange={(e) => {
                                                            const newFields = [...editCustomFields]
                                                            newFields[index].value = e.target.value
                                                            setEditCustomFields(newFields)
                                                        }}
                                                        className="flex-1 bg-black/40 border border-white/5 text-[9px] font-black uppercase p-2.5 sharp-edge text-white outline-none focus:border-neon-green/30"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setEditCustomFields(editCustomFields.filter((_, i) => i !== index))}
                                                        className="p-2 text-slate-600 hover:text-rose-500 transition-colors"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                        {editCustomFields.length === 0 && (
                                            <p className="text-center py-4 text-[10px] text-slate-600 italic">Nenhum campo personalizado definido.</p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3 pt-6 border-t border-white/5">
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="w-full bg-neon-green text-black font-black uppercase tracking-widest py-4 sharp-edge hover:bg-neon-green/90 transition-all flex items-center justify-center gap-2 text-xs shadow-lg shadow-neon-green/10"
                                    >
                                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Efetivar Alterações"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(false)}
                                        className="w-full bg-white/5 text-slate-400 font-black uppercase tracking-widest py-4 sharp-edge hover:text-white transition-all text-xs"
                                    >
                                        Abortar
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal de Confirmação de Exclusão */}
            <AnimatePresence>
                {showDeleteConfirm && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-carbon border border-white/5 w-full max-w-sm sharp-edge overflow-hidden shadow-2xl p-10 text-center"
                        >
                            <div className="w-20 h-20 bg-signal-orange/10 sharp-edge flex items-center justify-center mx-auto mb-8 border border-signal-orange/20">
                                <Trash2 className="h-10 w-10 text-signal-orange" />
                            </div>

                            <h3 className="text-xl font-black text-white font-outfit uppercase tracking-tighter mb-2">Expurgar Lead?</h3>
                            <p className="text-slate-400 text-[11px] font-bold uppercase tracking-tight mb-8 leading-relaxed">
                                Esta unit será deletada permanentemente dos registros de <b>{card.contact_name}</b>.
                            </p>

                            <div className="flex flex-col gap-4">
                                <button
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="w-full bg-signal-orange text-black font-black uppercase tracking-widest py-4 sharp-edge shadow-lg transition-all flex items-center justify-center gap-2 text-xs"
                                >
                                    {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirmar Expurgo"}
                                </button>
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    disabled={isDeleting}
                                    className="w-full bg-white/5 text-slate-400 hover:text-white font-black uppercase tracking-widest py-4 sharp-edge transition-all text-xs"
                                >
                                    Abortar
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    )
}
