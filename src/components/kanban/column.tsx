"use client"

import { useState } from "react"
import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { KanbanCard } from "./card"
import { createCard } from "@/app/actions/card"
import { Plus, MoreHorizontal, Loader2 } from "lucide-react"
import { PhoneInput } from "../phone-input"

export function KanbanColumn({
    column,
    cards,
    workspaceId,
    globalCustomFields,
    onCardCreate,
    onCardUpdate,
    onCardDelete
}: {
    column: any,
    cards: any[],
    workspaceId: string,
    globalCustomFields: string[],
    onCardCreate: (card: any) => void,
    onCardUpdate: (card: any) => void,
    onCardDelete: (id: string) => void
}) {
    const [isAddingCard, setIsAddingCard] = useState(false)
    const [loading, setLoading] = useState(false)
    const [customFields, setCustomFields] = useState<{ key: string, value: string }[]>([])

    const { setNodeRef } = useDroppable({
        id: column.id,
        data: {
            type: "Column",
            column,
        },
    })

    const handleAddCard = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.currentTarget)

        // Processar campos customizados
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

    return (
        <div className="w-80 shrink-0 flex flex-col max-h-full">
            <div className="flex items-center justify-between mb-4 px-2">
                <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
                    <h2 className="text-sm font-bold text-slate-200 uppercase tracking-widest">{column.title}</h2>
                    <span className="bg-slate-900 text-slate-500 text-[10px] px-2 py-0.5 rounded-full border border-slate-800">
                        {cards.length}
                    </span>
                </div>
                <button className="text-slate-500 hover:text-white transition-colors p-1 hover:bg-slate-900 rounded-md">
                    <MoreHorizontal className="h-4 w-4" />
                </button>
            </div>

            <div
                ref={setNodeRef}
                className="flex-1 overflow-y-auto pr-2 space-y-3 min-h-[150px]"
            >
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
                    <form onSubmit={handleAddCard} className="bg-slate-900 border border-indigo-500/30 p-4 rounded-2xl space-y-4">
                        <div className="space-y-3">
                            <input name="name" placeholder="Nome" required className="w-full bg-slate-950 border border-slate-800 text-sm p-2.5 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                            <PhoneInput name="phone" required placeholder="Telefone" />
                            <input name="due_date" type="date" className="w-full bg-slate-950 border border-slate-800 text-sm p-2.5 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 color-scheme-dark" />

                            <div className="space-y-2">
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

                        <div className="flex gap-2 pt-2 border-t border-slate-800">
                            <button type="submit" disabled={loading} className="flex-1 bg-white text-slate-950 text-xs font-bold py-2 rounded-lg hover:bg-slate-200 transition-all">
                                {loading ? <Loader2 className="h-3 w-3 animate-spin mx-auto" /> : "Salvar Card"}
                            </button>
                            <button type="button" onClick={() => setIsAddingCard(false)} className="px-3 text-xs text-slate-400">
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
                        className="w-full py-3 bg-slate-900/20 border border-dashed border-slate-800 hover:border-slate-700 rounded-2xl flex items-center justify-center gap-2 text-slate-500 text-xs"
                    >
                        <Plus className="h-3 w-3" />
                        Adicionar Card
                    </button>
                )}
            </div>
        </div>
    )
}
