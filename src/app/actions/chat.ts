'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { OpenAI } from 'openai'
// pdf-parse será importado dinamicamente para evitar conflitos de build

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
})

/**
 * Faz o upload de um arquivo para o Supabase Storage.
 */
export async function uploadFile(formData: FormData) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Não autorizado')

    const file = formData.get('file') as File
    if (!file) throw new Error('Nenhum arquivo enviado')

    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
    const filePath = `${user.id}/${fileName}`

    const { data, error } = await supabase.storage
        .from('chat-attachments')
        .upload(filePath, file)

    if (error) {
        console.error('Erro no upload Storage:', error)
        throw new Error('Falha ao subir arquivo')
    }

    const { data: { publicUrl } } = supabase.storage
        .from('chat-attachments')
        .getPublicUrl(filePath)

    return { url: publicUrl, name: file.name, type: file.type, path: filePath }
}

/**
 * Inicia uma nova conversa com um agente.
 */
export async function createConversation(agentId: string) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Não autorizado')

    const { data: conversation, error } = await supabase
        .from('conversations')
        .insert({
            agent_id: agentId,
            user_id: user.id,
            title: 'Nova Conversa'
        } as any)
        .select()
        .single()

    if (error) {
        console.error('Erro ao criar conversa:', error)
        throw new Error('Falha ao iniciar conversa')
    }

    revalidatePath('/agents')
    return conversation
}

/**
 * Busca o histórico de mensagens de uma conversa.
 */
export async function getMessages(conversationId: string) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Não autorizado')

    const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

    if (error) {
        console.error('Erro ao buscar mensagens:', error)
        throw new Error('Falha ao buscar histórico')
    }

    return data
}

/**
 * Envia uma mensagem e solicita resposta real do agente via OpenAI.
 */
export async function sendMessage(conversationId: string, content: string, attachments: any[] = []) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Não autorizado')

    // 1. Salvar mensagem do usuário
    console.log('Salvando mensagem do usuário no BD...')
    const { data: userMessage, error: userError } = await supabase
        .from('messages')
        .insert({
            conversation_id: conversationId,
            role: 'user',
            content,
            attachments
        } as any)
        .select()
        .single()

    if (userError) {
        console.error('Erro ao salvar mensagem do usuário:', userError)
        throw new Error('Erro ao enviar mensagem para o banco de dados')
    }
    console.log('Mensagem do usuário salva com sucesso.')

    // 2. Buscar informações do agente e histórico para contexto
    const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .select('agent_id, ai_agents(system_prompt, model_name, provider)')
        .eq('id', conversationId)
        .single()

    if (convError || !conversation) throw new Error('Conversa não encontrada')

    const agent = (conversation as any)?.ai_agents
    
    // Buscar histórico para contexto (filtramos os últimos para não estourar tokens)
    const { data: history } = await supabase
        .from('messages')
        .select('role, content, attachments')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false })
        .limit(10)

    const reversedHistory = [...(history || [])].reverse()

    // 3. Chamada real para OpenAI com suporte a Visão e PDF
    try {
        // Mapeamento de modelos customizados para modelos reais da API
        let modelToUse = agent?.model_name || 'gpt-4o'
        if (modelToUse === 'gpt-5-nano') modelToUse = 'o1-mini'
        if (modelToUse === 'claude-3-5-sonnet') modelToUse = 'gpt-4o'
        if (modelToUse === 'gemini-1.5-pro') modelToUse = 'gpt-4o'

        // Verificar anexos
        const hasImages = attachments && attachments.some((att: any) => att.type.startsWith('image/'))
        const pdfAttachments = attachments && attachments.filter((att: any) => att.type === 'application/pdf')
        
        // Se houver imagens e o modelo for o1-mini (que não suporta visão), fazemos fallback para gpt-4o-mini
        if (hasImages && modelToUse === 'o1-mini') {
            modelToUse = 'gpt-4o-mini'
            console.log('Fallback Vision: o1-mini não suporta visão, usando gpt-4o-mini')
        }

        const isO1 = modelToUse.includes('o1')
        const systemRole = isO1 ? 'developer' : 'system'

        const apiMessages: any[] = [
            { role: systemRole, content: agent?.system_prompt || 'Você é um assistente útil.' }
        ]

        // Construir histórico para a API
        reversedHistory.forEach((m: any) => {
            if (m.role === 'assistant' && m.content === 'Não consegui gerar uma resposta.') return
            apiMessages.push({ role: m.role, content: m.content })
        })

        // Adicionar a mensagem atual
        let fullTextContent = content
        
        // Processar PDFs (Extração de texto)
        if (pdfAttachments && pdfAttachments.length > 0) {
            console.log(`Processando ${pdfAttachments.length} PDFs...`)
            for (const pdfAtt of pdfAttachments) {
                try {
                    console.log('Extraindo texto do PDF:', pdfAtt.name, 'Path:', pdfAtt.path)
                    
                    let buffer: Buffer
                    if (pdfAtt.path) {
                        const { data, error: downloadError } = await supabase.storage
                            .from('chat-attachments')
                            .download(pdfAtt.path)
                        
                        if (downloadError) throw new Error(`Erro no download do Storage: ${downloadError.message}`)
                        const arrayBuffer = await data.arrayBuffer()
                        if (arrayBuffer.byteLength === 0) throw new Error('O arquivo baixado está vazio.')
                        buffer = Buffer.from(arrayBuffer)
                    } else {
                        const res = await fetch(pdfAtt.url)
                        if (!res.ok) throw new Error(`Falha no fetch: ${res.statusText}`)
                        const arrayBuffer = await res.arrayBuffer()
                        if (arrayBuffer.byteLength === 0) throw new Error('O arquivo retornado pelo fetch está vazio.')
                        buffer = Buffer.from(arrayBuffer)
                    }
                    
                    // Carregamento dinâmico da fork que é mais estável no Next.js
                    const pdfParserModule = require('pdf-parse-fork')
                    const pdfParser = pdfParserModule.default || pdfParserModule
                    
                    const pdfData = await pdfParser(buffer)
                    
                    if (pdfData && pdfData.text) {
                        const extractedText = pdfData.text.trim()
                        console.log(`Texto extraído (${extractedText.length} caps): ${pdfAtt.name}`)
                        
                        if (extractedText.length > 0) {
                            fullTextContent += `\n\n--- CONTEÚDO DO PDF (${pdfAtt.name}) ---\n${extractedText}\n--- FIM DO PDF ---`
                        } else {
                            fullTextContent += `\n\n[O arquivo "${pdfAtt.name}" não contém texto extraível. Pode ser uma imagem escaneada.]`
                        }
                    } else {
                        throw new Error('O parser de PDF não retornou dados de texto.')
                    }
                } catch (pdfError: any) {
                    console.error('Erro ao ler PDF:', pdfError)
                    fullTextContent += `\n\n[ERRO NA LEITURA DO PDF "${pdfAtt.name}": ${pdfError.message || 'Erro no processamento'}]`
                }
            }
        }

        // Construir o conteúdo final da mensagem (Multimodal ou apenas Texto)
        const currentMessageContent: any[] = [{ type: 'text', text: fullTextContent }]
        
        // Processar imagens (Vision) - Imagens SEMPRE forçam formato de array
        let isMultimodal = false
        if (attachments && attachments.length > 0) {
            for (const att of attachments) {
                if (att.type.startsWith('image/')) {
                    isMultimodal = true
                    currentMessageContent.push({
                        type: 'image_url',
                        image_url: { url: att.url }
                    })
                }
            }
        }

        // Se for apenas texto (sem imagens), alguns modelos preferem string pura em 'content'
        // Mas o OpenAI SDK lida bem com [{type: 'text', text: '...'}] na maioria dos casos.
        // Vamos manter o array se houver imagens, ou simplificar se não houver.
        const finalContent = isMultimodal ? currentMessageContent : fullTextContent

        apiMessages.push({ role: 'user', content: finalContent })

        console.log('Enviando para OpenAI:', { model: modelToUse, messagesCount: apiMessages.length })

        const response = await openai.chat.completions.create({
            model: modelToUse,
            messages: apiMessages,
            max_completion_tokens: isO1 ? 1000 : undefined,
            max_tokens: isO1 ? undefined : 1000
        } as any)

        console.log('Resposta da OpenAI:', JSON.stringify(response.choices[0], null, 2))

        const aiResponseContent = response.choices[0].message.content || 'Não consegui gerar uma resposta.'

        // 4. Salvar resposta do assistente
        const { data: assistantMessage, error: assistantError } = await supabase
            .from('messages')
            .insert({
                conversation_id: conversationId,
                role: 'assistant',
                content: aiResponseContent
            } as any)
            .select()
            .single()

        if (assistantError) throw new Error('Erro ao salvar resposta da IA')

        revalidatePath(`/agents/${(conversation as any).agent_id}/chat`)
        return { userMessage, assistantMessage }

    } catch (apiError: any) {
        console.error('OpenAI API Error:', apiError)
        throw new Error('Falha na comunicação com a IA: ' + (apiError.message || 'Erro desconhecido'))
    }
}
