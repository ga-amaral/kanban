"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

/**
 * Gabriel Amaral (https://instagram.com/sougabrielamaral)
 * Atualizado para refletir o schema real (client_name, phone, deadline_date)
 */

export async function createCard(workspaceId: string, columnId: string, cardData: any) {
    const supabase = createClient() as any
    const { data, error } = await supabase
        .from("cards")
        .insert([{
            column_id: columnId,
            workspace_id: workspaceId,
            title: cardData.title || cardData.contact_name,
            client_name: cardData.client_name || cardData.contact_name,
            phone: cardData.phone || cardData.contact_phone,
            deadline_date: (cardData.deadline_date || cardData.due_date) || null,
            order_index: cardData.order_index || 0,
            description: cardData.description || ""
        }])
        .select()
        .single()

    if (error) return { error: error.message }
    
    // Mapear para o formato do frontend
    const mappedData = {
        ...data,
        contact_name: data.client_name,
        contact_phone: data.phone,
        due_date: data.deadline_date
    }

    revalidatePath(`/workspace/${workspaceId}`)
    return { data: mappedData }
}

export async function getCards(columnId: string) {
    const supabase = createClient() as any
    const { data, error } = await supabase
        .from("cards")
        .select("*")
        .eq("column_id", columnId)
        .order("order_index", { ascending: true })

    if (error) return []
    
    // Mapear campos do DB para os nomes esperados pelo frontend
    return data.map((card: any) => ({
        ...card,
        contact_name: card.client_name,
        contact_phone: card.phone,
        due_date: card.deadline_date
    }))
}

export async function getCardsByWorkspace(workspaceId: string) {
    const supabase = createClient() as any
    const { data, error } = await supabase
        .from("cards")
        .select("*")
        .eq("workspace_id", workspaceId)
        .order("order_index", { ascending: true })

    if (error) return []
    
    // Mapear campos do DB para os nomes esperados pelo frontend
    return data.map((card: any) => ({
        ...card,
        contact_name: card.client_name,
        contact_phone: card.phone,
        due_date: card.deadline_date
    }))
}

const resolveInternalValue = (card: any, columnTitle: string, internalKey: string) => {
    if (internalKey === 'client_name' || internalKey === 'contact_name') return card.client_name
    if (internalKey === 'phone' || internalKey === 'contact_phone') return card.phone
    if (internalKey === 'deadline_date' || internalKey === 'due_date') return card.deadline_date
    if (internalKey === 'column_title') return columnTitle
    if (internalKey === 'title') return card.title

    return card[internalKey] || ""
}

export async function moveCard(workspaceId: string, cardId: string, columnId: string, newOrderIndex?: number) {
    const supabase = createClient() as any

    // Buscar card atual para verificar se mudou de coluna
    const { data: oldCard } = await supabase
        .from("cards")
        .select("*")
        .eq("id", cardId)
        .single()

    if (oldCard) {
        const updatePayload: any = { column_id: columnId }
        if (typeof newOrderIndex === 'number') {
            updatePayload.order_index = newOrderIndex
        }

        const { error } = await supabase
            .from("cards")
            .update(updatePayload)
            .eq("id", cardId)

        if (error) return { error: error.message }

        // Disparar Automações se mudou de coluna
        if (oldCard.column_id !== columnId) {
            const { data: automations } = await supabase
                .from("automations")
                .select("*")
                .eq("workspace_id", workspaceId)
                .eq("is_active", true)

            if (automations && automations.length > 0) {
                const { data: column } = await supabase
                    .from("columns")
                    .select("title")
                    .eq("id", columnId)
                    .single()

                for (const automation of automations) {
                    const trigger = automation.trigger_config as any
                    const config = automation.action_config as any

                    const matchesTo = trigger.to_column_id === columnId
                    const matchesFrom = !trigger.from_column_id || trigger.from_column_id === oldCard.column_id

                    if (trigger.type === 'column_move' && matchesTo && matchesFrom) {
                        const payload: any = {}
                        if (config.mappings) {
                            config.mappings.forEach((m: any) => {
                                payload[m.external] = resolveInternalValue(oldCard, column?.title || "", m.internal)
                            })
                        }

                        fetch(config.url, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(payload)
                        }).catch(e => console.error(`Automation ${automation.name} failed:`, e))
                    }
                }
            }
        }

        revalidatePath(`/workspace/${workspaceId}`)
        return { success: true }
    }

    return { success: true }
}

export async function updateCard(workspaceId: string, cardId: string, updateData: any) {
    const supabase = createClient() as any
    const { data: updatedCard, error } = await supabase
        .from("cards")
        .update({
            title: updateData.title,
            client_name: updateData.client_name || updateData.contact_name,
            phone: updateData.phone || updateData.contact_phone,
            deadline_date: (updateData.deadline_date || updateData.due_date) || null,
            description: updateData.description,
            urgency_level: updateData.urgency_level
        })
        .eq("id", cardId)
        .select()
        .single()

    if (error) return { error: error.message }

    const mappedData = {
        ...updatedCard,
        contact_name: updatedCard.client_name,
        contact_phone: updatedCard.phone,
        due_date: updatedCard.deadline_date
    }

    revalidatePath(`/workspace/${workspaceId}`)
    return { data: mappedData }
}

export async function deleteCard(workspaceId: string, id: string) {
    const supabase = createClient() as any
    const { error } = await supabase
        .from("cards")
        .delete()
        .eq("id", id)

    if (error) return { error: error.message }
    revalidatePath(`/workspace/${workspaceId}`)
    return { success: true }
}

export async function bulkCreateCards(workspaceId: string, cards: any[]) {
    const supabase = createClient() as any
    const { data, error } = await supabase
        .from("cards")
        .insert(cards.map(c => ({
            ...c,
            workspace_id: workspaceId
        })))
        .select()

    if (error) return { error: error.message }
    revalidatePath(`/workspace/${workspaceId}`)
    return { data }
}

export async function bulkMoveCards(workspaceId: string, cardIds: string[], toColumnId: string) {
    const supabase = createClient() as any
    const { data: moveResult, error } = await supabase
        .from("cards")
        .update({ column_id: toColumnId })
        .in("id", cardIds)
        .select()

    if (error) return { error: error.message }

    const { data: column } = await supabase
        .from("columns")
        .select("title")
        .eq("id", toColumnId)
        .single()

    const { data: automations } = await supabase
        .from("automations")
        .select("*")
        .eq("workspace_id", workspaceId)
        .eq("is_active", true)

    if (automations && automations.length > 0) {
        for (const id of cardIds) {
            const { data: card } = await supabase.from("cards").select("*").eq("id", id).single()
            if (card) {
                for (const auto of automations) {
                    const trigger = auto.trigger_config as any
                    if (trigger.type === "column_move" && trigger.to_column_id === toColumnId) {
                        try {
                            const payload = (auto.action_config as any).mappings.reduce((acc: any, m: any) => {
                                acc[m.external] = resolveInternalValue(card, column?.title || "", m.internal)
                                return acc
                            }, {})

                            await fetch((auto.action_config as any).url, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(payload)
                            })
                        } catch (e) {
                            console.error("Erro ao disparar automação em lote:", e)
                        }
                    }
                }
            }
        }
    }

    revalidatePath(`/workspace/${workspaceId}`)
    return { data: moveResult }
}

export async function bulkDeleteCards(workspaceId: string, cardIds: string[]) {
    const supabase = createClient() as any
    const { error } = await supabase
        .from("cards")
        .delete()
        .in("id", cardIds)

    if (error) return { error: error.message }
    revalidatePath(`/workspace/${workspaceId}`)
    return { success: true }
}
