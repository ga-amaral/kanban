"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { Tables } from "@/types/database"

/**
 * Gabriel Amaral (https://instagram.com/sougabrielamaral)
 * Server actions para gerenciamento de cards
 */

type CardRow = Tables<"cards">

// Cria um novo card
export async function createCard(workspaceId: string, columnId: string, cardData: Partial<CardRow>) {
    const supabase = createClient()
    const { data, error } = await supabase
        .from("cards")
        .insert({
            column_id: columnId,
            workspace_id: workspaceId,
            title: cardData.title || cardData.client_name || '',
            client_name: cardData.client_name || '',
            phone: cardData.phone || '',
            deadline_date: cardData.deadline_date || null,
            order_index: cardData.order_index || 0,
            description: cardData.description || ""
        })
        .select()
        .single()

    if (error) return { error: error.message }

    revalidatePath(`/workspace/${workspaceId}`)
    return { data }
}

// Lista cards de uma coluna
export async function getCards(columnId: string) {
    const supabase = createClient()
    const { data, error } = await supabase
        .from("cards")
        .select("*")
        .eq("column_id", columnId)
        .order("order_index", { ascending: true })

    if (error) return []
    return data
}

// Lista cards de um workspace
export async function getCardsByWorkspace(workspaceId: string) {
    const supabase = createClient()
    const { data, error } = await supabase
        .from("cards")
        .select("*")
        .eq("workspace_id", workspaceId)
        .order("order_index", { ascending: true })

    if (error) return []
    return data
}

// Resolve valor de campo interno para payload de automação
const resolveInternalValue = (card: CardRow, columnTitle: string, internalKey: string) => {
    if (internalKey === 'client_name') return card.client_name
    if (internalKey === 'phone') return card.phone
    if (internalKey === 'deadline_date') return card.deadline_date
    if (internalKey === 'column_title') return columnTitle
    if (internalKey === 'title') return card.title

    return (card as Record<string, unknown>)[internalKey] || ""
}

// Move card para outra coluna e dispara automações
export async function moveCard(workspaceId: string, cardId: string, columnId: string, newOrderIndex?: number) {
    const supabase = createClient()

    const { data: oldCard } = await supabase
        .from("cards")
        .select("*")
        .eq("id", cardId)
        .single()

    if (oldCard) {
        const updatePayload: { column_id: string; order_index?: number } = { column_id: columnId }
        if (typeof newOrderIndex === 'number') {
            updatePayload.order_index = newOrderIndex
        }

        const { error } = await supabase
            .from("cards")
            .update(updatePayload)
            .eq("id", cardId)

        if (error) return { error: error.message }

        // Disparar automações se mudou de coluna
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
                    const trigger = automation.trigger_config as Record<string, string>
                    const config = automation.action_config as Record<string, unknown>

                    const matchesTo = trigger.to_column_id === columnId
                    const matchesFrom = !trigger.from_column_id || trigger.from_column_id === oldCard.column_id

                    if (trigger.type === 'column_move' && matchesTo && matchesFrom) {
                        const payload: Record<string, unknown> = {}
                        const mappings = (config.mappings as Array<{ external: string; internal: string }>) || []
                        mappings.forEach((m) => {
                            payload[m.external] = resolveInternalValue(oldCard, column?.title || "", m.internal)
                        })

                        await fetch(config.url as string, {
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

// Atualiza dados de um card
export async function updateCard(workspaceId: string, cardId: string, updateData: Partial<CardRow>) {
    console.log(`[CardAction:Update] Iniciando atualização do card ${cardId}`, updateData)
    
    const supabase = createClient()
    const { data: updatedCard, error } = await supabase
        .from("cards")
        .update({
            title: updateData.title,
            client_name: updateData.client_name,
            phone: updateData.phone,
            deadline_date: updateData.deadline_date || null,
            description: updateData.description,
            urgency_level: updateData.urgency_level,
            custom_data_jsonb: updateData.custom_data_jsonb ?? undefined,
        })
        .eq("id", cardId)
        .select()
        .single()

    if (error) {
        console.error(`[CardAction:Update] ERRO ao atualizar card ${cardId}:`, {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint
        })
        return { error: error.message }
    }

    console.log(`[CardAction:Update] Sucesso ao atualizar card ${cardId}`)
    revalidatePath(`/workspace/${workspaceId}`)
    return { data: updatedCard }
}

// Deleta um card
export async function deleteCard(workspaceId: string, id: string) {
    const supabase = createClient()
    const { error } = await supabase
        .from("cards")
        .delete()
        .eq("id", id)

    if (error) return { error: error.message }
    revalidatePath(`/workspace/${workspaceId}`)
    return { success: true }
}

// Importação em lote de cards
export async function bulkCreateCards(workspaceId: string, cards: Array<Partial<CardRow> & { column_id: string }>) {
    const supabase = createClient()
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

// Move cards em lote para outra coluna
export async function bulkMoveCards(workspaceId: string, cardIds: string[], toColumnId: string) {
    const supabase = createClient()
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
                    const trigger = auto.trigger_config as Record<string, string>
                    if (trigger.type === "column_move" && trigger.to_column_id === toColumnId) {
                        try {
                            const config = auto.action_config as Record<string, unknown>
                            const mappings = (config.mappings as Array<{ external: string; internal: string }>) || []
                            const payload = mappings.reduce((acc: Record<string, unknown>, m) => {
                                acc[m.external] = resolveInternalValue(card, column?.title || "", m.internal)
                                return acc
                            }, {})

                            await fetch(config.url as string, {
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

// Deleta cards em lote
export async function bulkDeleteCards(workspaceId: string, cardIds: string[]) {
    const supabase = createClient()
    const { error } = await supabase
        .from("cards")
        .delete()
        .in("id", cardIds)

    if (error) return { error: error.message }
    revalidatePath(`/workspace/${workspaceId}`)
    return { success: true }
}
