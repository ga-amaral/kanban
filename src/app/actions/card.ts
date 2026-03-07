"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createCard(workspaceId: string, columnId: string, cardData: any) {
    const supabase = createClient() as any
    const { data, error } = await supabase
        .from("cards")
        .insert([{
            workspace_id: workspaceId,
            column_id: columnId,
            contact_name: cardData.contact_name,
            contact_phone: cardData.contact_phone,
            due_date: cardData.due_date,
            custom_data_jsonb: cardData.custom_data || {}
        }])
        .select()
        .single()

    if (error) return { error: error.message }
    revalidatePath(`/workspace/${workspaceId}`)
    return { data }
}

export async function getCards(workspaceId: string) {
    const supabase = createClient()
    const { data, error } = await supabase
        .from("cards")
        .select("*")
        .eq("workspace_id", workspaceId)

    if (error) return []
    return data
}

const resolveInternalValue = (card: any, columnTitle: string, internalKey: string) => {
    if (internalKey === 'contact_name') return card.contact_name
    if (internalKey === 'contact_phone') return card.contact_phone
    if (internalKey === 'due_date') return card.due_date
    if (internalKey === 'column_title') return columnTitle

    // Se não for um campo padrão, busca no custom_data_jsonb
    return card.custom_data_jsonb?.[internalKey] || ""
}

export async function moveCard(workspaceId: string, cardId: string, columnId: string) {
    const supabase = createClient() as any

    // Buscar card atual para verificar se mudou de coluna
    const { data: oldCard } = await supabase
        .from("cards")
        .select("column_id, contact_name, contact_phone, due_date, custom_data_jsonb")
        .eq("id", cardId)
        .single()

    if (oldCard && oldCard.column_id !== columnId) {
        const { error } = await supabase
            .from("cards")
            .update({ column_id: columnId })
            .eq("id", cardId)

        if (error) return { error: error.message }

        // Disparar Automações (Múltiplas)
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

                // Verificar se o gatilho bate com a movimentação
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

        revalidatePath(`/workspace/${workspaceId}`)
        return { success: true }
    }

    return { success: true }
}

export async function updateCard(workspaceId: string, cardId: string, updateData: any) {
    const supabase = createClient() as any
    const { data, error } = await supabase
        .from("cards")
        .update({
            contact_name: updateData.contact_name,
            contact_phone: updateData.contact_phone,
            due_date: updateData.due_date,
            custom_data_jsonb: updateData.custom_data
        })
        .eq("id", cardId)
        .select()
        .single()

    if (error) return { error: error.message }
    revalidatePath(`/workspace/${workspaceId}`)
    return { data }
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
        // Disparar automações para cada card
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
