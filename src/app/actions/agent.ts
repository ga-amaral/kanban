"use server"

import { createClient } from '@/lib/supabase/server'
import { TablesInsert, TablesUpdate } from '@/types/database'
import { revalidatePath } from 'next/cache'

// Busca todos os agentes de IA
export async function getAgents() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Não autorizado')

    const { data, error } = await supabase
        .from('ai_agents')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Erro ao buscar agentes:', error)
        throw new Error('Falha ao buscar agentes')
    }

    return data
}

// Verifica se o usuário logado é admin
export async function isAdmin() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    return profile?.role === 'admin'
}

// Cria um novo agente de IA (Apenas Admins)
export async function createAgent(data: Omit<TablesInsert<'ai_agents'>, 'owner_id'>) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Não autorizado')

    const userIsAdmin = await isAdmin()
    if (!userIsAdmin) throw new Error('Apenas administradores podem criar agentes')

    const { data: agent, error } = await supabase
        .from('ai_agents')
        .insert({
            ...data,
            owner_id: user.id
        })
        .select()
        .single()

    if (error) {
        console.error('Erro ao criar agente:', error)
        throw new Error('Falha ao criar agente')
    }

    revalidatePath('/agents')
    return agent
}

// Atualiza um agente de IA existente
export async function updateAgent(id: string, data: TablesUpdate<'ai_agents'>) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Não autorizado')

    const { data: agent, error } = await supabase
        .from('ai_agents')
        .update(data)
        .eq('id', id)
        .select()
        .single()

    if (error) {
        console.error('Erro ao atualizar agente:', error)
        throw new Error('Falha ao atualizar agente')
    }

    revalidatePath('/agents')
    return agent
}

// Exclui um agente de IA
export async function deleteAgent(id: string) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Não autorizado')

    const { error } = await supabase
        .from('ai_agents')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Erro ao excluir agente:', error)
        throw new Error('Falha ao excluir agente')
    }

    revalidatePath('/agents')
    return { success: true }
}
