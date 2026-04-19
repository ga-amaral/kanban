"use server"

// Log de erros centralizado para debugging
export async function logError(context: string, error: unknown) {
    const err = error instanceof Error ? error : { message: String(error), stack: undefined }

    const logEntry = {
        context,
        message: err.message,
        stack: err.stack,
        timestamp: new Date().toISOString(),
    }

    console.error(`[LOG ERROR][${context}]:`, logEntry)

    return logEntry
}
