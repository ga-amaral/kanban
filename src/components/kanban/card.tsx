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
                className={`bg-slate-900 border border-slate-800/50 p-4 rounded-2xl shadow-lg hover:border-slate-700 transition-all group relative cursor-grab active:cursor-grabbing hover:shadow-indigo-500/10 ${isDeleting ? 'opacity-50 grayscale' : ''}`}
            >
                {/* Botão de Menu */}
                <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            setIsEditing(true)
                        }}
                        className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-white transition-colors"
                    >
                        <Edit2 className="h-3 w-3" />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            setShowDeleteConfirm(true)
                        }}
                        className="p-1.5 hover:bg-rose-500/20 rounded-lg text-slate-500 hover:text-rose-400 transition-colors"
                    >
                        {isDeleting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                    </button>
                    <div
                        {...attributes}
                        {...listeners}
                        className="p-1.5 hover:bg-slate-800 rounded-lg cursor-grab active:cursor-grabbing"
                    >
                        <GripVertical className="h-3 w-3 text-slate-600" />
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex items-start gap-2 pr-12">
                        <div className="mt-0.5 bg-indigo-500/10 p-1.5 rounded-lg">
                            <User className="h-3.5 w-3.5 text-indigo-400" />
                        </div>
                        <h3 className="text-sm font-semibold text-white leading-tight mt-1 truncate">
                            {card.contact_name}
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                        <div className="flex items-center justify-between group/phone">
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                                <Phone className="h-3 w-3 text-emerald-500/70" />
                                <span className="font-mono">{maskPhone(card.contact_phone)}</span>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setShowPhone(!showPhone)
                                }}
                                className="text-slate-600 hover:text-indigo-400 p-1 opacity-0 group-hover:opacity-100 transition-all"
                            >
                                {showPhone ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                            </button>
                        </div>

                        {card.due_date && (
                            <div className="flex items-center gap-1.5 text-[10px] text-rose-400 font-medium">
                                <Calendar className="h-3 w-3" />
                                {new Date(card.due_date).toLocaleDateString('pt-BR')}
                            </div>
                        )}
                    </div>

                    {/* Campos Customizados */}
                    {card.custom_data_jsonb && Object.keys(card.custom_data_jsonb).length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1 border-t border-slate-800/50 mt-2">
                            {Object.entries(card.custom_data_jsonb).map(([key, value]: [string, any]) => (
                                <div key={key} className="bg-slate-800/50 px-2 py-0.5 rounded text-[9px] text-indigo-300 border border-slate-700">
                                    <span className="text-slate-500 mr-1">{key}:</span>
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
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl"
                        >
                            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-white/[0.02]">
                                <h3 className="text-lg font-bold text-white font-outfit">Editar Card</h3>
                                <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-slate-800 rounded-xl transition-colors">
                                    <X className="h-5 w-5 text-slate-500" />
                                </button>
                            </div>

                            <form onSubmit={handleUpdate} className="p-6 space-y-5">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Nome do Contato</label>
                                    <input
                                        name="name"
                                        defaultValue={card.contact_name}
                                        required
                                        className="w-full bg-slate-950 border border-slate-800 text-white p-3.5 rounded-2xl focus:border-indigo-500 outline-none transition-all placeholder:text-slate-700 text-sm"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Telefone</label>
                                    <input
                                        name="phone"
                                        defaultValue={card.contact_phone}
                                        required
                                        className="w-full bg-slate-950 border border-slate-800 text-white p-3.5 rounded-2xl focus:border-indigo-500 outline-none transition-all placeholder:text-slate-700 text-sm"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Data de Entrega</label>
                                    <input
                                        name="due_date"
                                        type="date"
                                        defaultValue={card.due_date ? new Date(card.due_date).toISOString().split('T')[0] : ""}
                                        className="w-full bg-slate-950 border border-slate-800 text-white p-3.5 rounded-2xl focus:border-indigo-500 outline-none transition-all color-scheme-dark text-sm"
                                    />
                                </div>

                                <div className="space-y-3 pt-2">
                                    <div className="flex items-center justify-between px-1">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Campos Personalizados</label>
                                        <button
                                            type="button"
                                            onClick={() => setEditCustomFields([...editCustomFields, { key: "", value: "" }])}
                                            className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold uppercase"
                                        >
                                            + Adicionar
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
                                                        placeholder="Chave"
                                                        value={field.key}
                                                        onChange={(e) => {
                                                            const newFields = [...editCustomFields]
                                                            newFields[index].key = e.target.value
                                                            setEditCustomFields(newFields)
                                                        }}
                                                        className="w-1/3 bg-slate-950 border border-slate-800 text-[11px] p-2.5 rounded-xl text-white outline-none focus:border-indigo-500/50"
                                                    />
                                                    <ArrowRight className="h-3 w-3 text-slate-700 self-center shrink-0" />
                                                    <input
                                                        placeholder="Valor"
                                                        value={field.value}
                                                        onChange={(e) => {
                                                            const newFields = [...editCustomFields]
                                                            newFields[index].value = e.target.value
                                                            setEditCustomFields(newFields)
                                                        }}
                                                        className="flex-1 bg-slate-950 border border-slate-800 text-[11px] p-2.5 rounded-xl text-white outline-none focus:border-indigo-500/50"
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

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="flex-1 bg-white text-black font-bold py-3.5 rounded-2xl hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
                                    >
                                        {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : "Salvar Alterações"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(false)}
                                        className="px-6 bg-slate-800 text-white font-bold py-3.5 rounded-2xl hover:bg-slate-700 transition-all"
                                    >
                                        Cancelar
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
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl p-8 text-center"
                        >
                            <div className="w-16 h-16 bg-rose-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-rose-500/20">
                                <Trash2 className="h-8 w-8 text-rose-500" />
                            </div>

                            <h3 className="text-xl font-bold text-white font-outfit mb-2">Excluir Cartão?</h3>
                            <p className="text-slate-400 text-sm mb-8">
                                Esta ação não pode ser desfeita. Tem certeza que deseja remover o cartão de <b>{card.contact_name}</b>?
                            </p>

                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-rose-900/20 transition-all flex items-center justify-center gap-2"
                                >
                                    {isDeleting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Sim, Excluir Agora"}
                                </button>
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    disabled={isDeleting}
                                    className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-4 rounded-2xl transition-all"
                                >
                                    Não, Manter Cartão
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    )
}
