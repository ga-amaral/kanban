"use server"

import { createClient } from "@/lib/supabase/server"

export async function logError(context: string, error: any) {
    const supabase = createClient()

    const logEntry = {
        context,
        message: error.message || String(error),
        stack: error.stack,
        timestamp: new Date().toISOString(),
    }

    console.error(`[LOG ERROR][${context}]:`, logEntry)

    // Opcional: Salvar em uma tabela de logs se necessário
    // await supabase.from('system_logs').insert([logEntry])

    return logEntry
}
