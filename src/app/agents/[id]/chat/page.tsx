'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Bot, Send, Paperclip, ArrowLeft, Loader2, Sparkles, User, FileText, Image as ImageIcon, X } from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { getMessages, sendMessage, createConversation, uploadFile } from '@/app/actions/chat'
import { toast } from 'sonner'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function AgentChatPage() {
    const params = useParams()
    const router = useRouter()
    const agentId = params.id as string
    
    const [messages, setMessages] = useState<any[]>([])
    const [inputValue, setInputValue] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    const [isSending, setIsSending] = useState(false)
    const [conversationId, setConversationId] = useState<string | null>(null)
    const [attachments, setAttachments] = useState<File[]>([])
    
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (agentId) {
            initChat()
        }
    }, [agentId])

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    const initChat = async () => {
        setIsLoading(true)
        try {
            const newConv = await createConversation(agentId) as any
            setConversationId(newConv.id)
            setMessages([])
        } catch (error: any) {
            console.error('Chat error:', error)
            toast.error('Erro ao iniciar chat: ' + error.message)
        } finally {
            setIsLoading(false)
        }
    }

    const handleSend = async () => {
        console.log('Botão enviar clicado. Input:', !!inputValue.trim(), 'Anexos:', attachments.length)
        
        if (!inputValue.trim() && attachments.length === 0) return
        
        if (!conversationId) {
            console.error('Erro: conversationId está nulo')
            toast.error('Erro: Chat não inicializado corretamente. Tente recarregar.')
            return
        }

        if (isSending) {
            console.warn('Já existe um envio em progresso...')
            return
        }

        const currentInput = inputValue
        const currentFiles = [...attachments]
        
        setIsSending(true)
        setInputValue('')
        setAttachments([])

        try {
            console.log('Iniciando processo de envio...')
            // 1. Upload real dos arquivos
            let uploadedAttachments: any[] = []
            if (currentFiles.length > 0) {
                console.log('Fazendo upload de', currentFiles.length, 'arquivos...')
                uploadedAttachments = await Promise.all(
                    currentFiles.map(async (file) => {
                        const formData = new FormData()
                        formData.append('file', file)
                        return uploadFile(formData)
                    })
                )
                console.log('Upload concluído.')
            }

            // 2. Otimismo na UI
            const tempUserMsg = {
                id: 'temp-' + Date.now().toString(),
                role: 'user',
                content: currentInput,
                attachments: uploadedAttachments,
                created_at: new Date().toISOString()
            }
            
            setMessages((prev: any[]) => [...prev, tempUserMsg])
            console.log('Mensagem de usuário adicionada à UI (otimista).')

            // 3. Enviar mensagem com anexos
            console.log('Chamando sendMessage no servidor...')
            const result = await sendMessage(conversationId, currentInput, uploadedAttachments)
            
            if (result && result.assistantMessage) {
                console.log('Resposta recebida do servidor.')
                setMessages((prev: any[]) => [...prev, result.assistantMessage])
            } else {
                console.warn('SendMessage retornou sem assistantMessage:', result)
            }
        } catch (error: any) {
            console.error('Erro ao enviar mensagem:', error)
            toast.error('Falha ao enviar: ' + (error.message || 'Erro desconhecido'))
            // Se houver erro, podemos restaurar o input para o usuário não perder o que escreveu?
            // Mas limpamos antes. Talvez seja melhor não limpar se falhar?
            // Mas o paradigma otimista limpa antes.
        } finally {
            setIsSending(false)
            console.log('Processo de envio finalizado.')
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files)
            setAttachments((prev: File[]) => [...prev, ...files])
        }
    }

    const removeAttachment = (index: number) => {
        setAttachments((prev: File[]) => prev.filter((_, i) => i !== index))
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-transparent flex items-center justify-center">
                <div className="text-center space-y-4">
                    <Loader2 className="h-10 w-10 text-neon-green animate-spin mx-auto" />
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">Iniciando conexão segura...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-transparent text-white flex flex-col font-inter selection:bg-neon-green/30">
            {/* Header - Radical Style */}
            <header className="p-6 border-b border-white/5 bg-carbon sticky top-0 z-50">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link href="/agents" className="p-2 hover:bg-white/5 sharp-edge transition-colors text-slate-400 hover:text-white group">
                            <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                        </Link>
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 bg-neon-green/10 sharp-edge flex items-center justify-center border border-neon-green/20">
                                <Bot className="h-6 w-6 text-neon-green neon-glow" />
                            </div>
                            <div>
                                <h1 className="text-lg font-black font-outfit uppercase tracking-tighter leading-none">Chat com Agente</h1>
                                <p className="text-[10px] text-neon-green font-black uppercase tracking-widest mt-1.5 flex items-center gap-1.5">
                                    <span className="h-1.5 w-1.5 bg-neon-green rounded-full animate-pulse" /> Online
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Chat Messages */}
            <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-6 space-y-8 scroll-smooth"
            >
                <div className="max-w-4xl mx-auto space-y-8">
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
                            <div className="bg-black/40 p-8 sharp-edge border border-white/5 animate-spring">
                                <Sparkles className="h-12 w-12 text-neon-green neon-glow" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black font-outfit uppercase tracking-tighter">Como posso ajudar hoje?</h2>
                                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-3 max-w-xs">
                                    Envie uma mensagem ou anexe arquivos para começar.
                                </p>
                            </div>
                        </div>
                    )}

                    {messages.map((msg, i) => (
                        <motion.div
                            key={msg.id || i}
                            initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                        >
                            <div className={`h-8 w-8 sharp-edge flex items-center justify-center flex-shrink-0 border ${
                                msg.role === 'user' ? 'bg-white/5 border-white/10 text-slate-500' : 'bg-neon-green/10 text-neon-green border-neon-green/20 neon-glow'
                            }`}>
                                {msg.role === 'user' ? <User className="h-4.5 w-4.5" /> : <Bot className="h-4.5 w-4.5" />}
                            </div>
                            <div className={`space-y-2 max-w-[85%] flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                <div className={`p-5 sharp-edge text-sm leading-relaxed shadow-2xl relative group ${
                                    msg.role === 'user' 
                                        ? 'bg-neon-green text-black font-bold border-l-4 border-black/20' 
                                        : 'bg-carbon border border-white/5 text-slate-300 border-l-4 border-neon-green'
                                }`}>
                                    <div className={`prose prose-sm max-w-none ${msg.role === 'user' ? 'prose-sm prose-p:text-black prose-headings:text-black prose-strong:text-black' : 'prose-invert text-slate-300'}`}>
                                        <ReactMarkdown 
                                            remarkPlugins={[remarkGfm]}
                                            components={{
                                                p: ({node, ...props}: any) => <p className="mb-2 last:mb-0" {...props} />,
                                                h1: ({node, ...props}: any) => <h1 className="font-black" {...props} />,
                                                h2: ({node, ...props}: any) => <h2 className="font-black" {...props} />,
                                                ul: ({node, ...props}: any) => <ul className="marker:text-neon-green" {...props} />,
                                                ol: ({node, ...props}: any) => <ol className="marker:text-neon-green" {...props} />,
                                                code: ({node, ...props}: any) => (
                                                    <code className="bg-black/40 px-1.5 py-0.5 sharp-edge text-neon-green font-mono text-[11px] before:content-none after:content-none" {...props} />
                                                ),
                                                pre: ({node, ...props}: any) => (
                                                    <pre className="bg-black/60 p-5 sharp-edge border border-white/5 my-4 overflow-x-auto font-mono text-[11px] !leading-normal" {...props} />
                                                ),
                                                table: ({node, ...props}: any) => (
                                                    <div className="overflow-x-auto my-4 sharp-edge border border-white/10">
                                                        <table className="w-full text-left text-xs m-0" {...props} />
                                                    </div>
                                                ),
                                                thead: ({node, ...props}: any) => <thead className="bg-black/40 text-slate-500 uppercase font-black" {...props} />,
                                                th: ({node, ...props}: any) => <th className="px-5 py-3 border-none" {...props} />,
                                                td: ({node, ...props}: any) => <td className="px-5 py-3 border-t border-white/5" {...props} />,
                                            }}
                                        >
                                            {msg.content}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                                
                                {/* Anexos */}
                                {msg.attachments && msg.attachments.length > 0 && (
                                    <div className="flex flex-wrap gap-3 mt-4">
                                        {msg.attachments.map((file: any, idx: number) => (
                                            <div key={idx} className="group relative">
                                                {file.type.startsWith('image/') ? (
                                                    <div className="relative h-24 w-24 sharp-edge overflow-hidden border border-white/10 group-hover:border-neon-green/50 transition-colors">
                                                        <img src={file.url} alt={file.name} className="h-full w-full object-cover" />
                                                    </div>
                                                ) : (
                                                    <div className="bg-carbon border border-white/5 p-3 sharp-edge flex items-center gap-3 text-[10px] text-slate-500 font-black uppercase tracking-widest group-hover:border-neon-green/50 transition-colors">
                                                        <FileText className="h-4 w-4 text-neon-green" />
                                                        <span className="truncate max-w-[150px]">{file.name}</span>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                    
                    {isSending && (
                        <div className="flex gap-4">
                            <div className="h-8 w-8 sharp-edge bg-neon-green/10 text-neon-green border border-neon-green/20 flex items-center justify-center animate-pulse">
                                <Bot className="h-4.5 w-4.5" />
                            </div>
                            <div className="bg-carbon border border-white/5 p-5 sharp-edge border-l-4 border-neon-green">
                                <div className="flex gap-1.5">
                                    <span className="w-1.5 h-1.5 bg-neon-green/50 rounded-full animate-bounce" />
                                    <span className="w-1.5 h-1.5 bg-neon-green/50 rounded-full animate-bounce delay-75" />
                                    <span className="w-1.5 h-1.5 bg-neon-green/50 rounded-full animate-bounce delay-150" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Input Area - Radical Redesign */}
            <div className="p-8 border-t border-white/5 bg-carbon/80 backdrop-blur-xl">
                <div className="max-w-4xl mx-auto space-y-4">
                    {/* Preview de Anexos */}
                    <AnimatePresence>
                        {attachments.length > 0 && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="flex flex-wrap gap-2 pb-2"
                            >
                                {attachments.map((file, i) => (
                                    <div key={i} className="group relative bg-black/40 border border-white/5 p-3 pr-10 sharp-edge flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-500 shadow-xl">
                                        {file.type.startsWith('image/') ? <ImageIcon className="h-4 w-4 text-neon-green" /> : <FileText className="h-4 w-4 text-slate-600" />}
                                        <span className="truncate max-w-[150px]">{file.name}</span>
                                        <button 
                                            onClick={() => removeAttachment(i)}
                                            className="absolute right-3 p-1 hover:text-signal-orange transition-colors"
                                        >
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="relative group">
                        <textarea
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault()
                                    handleSend()
                                }
                            }}
                            placeholder="Escreva sua mensagem..."
                            rows={1}
                            className="w-full bg-black/40 border border-white/5 text-white pl-6 pr-36 py-5 sharp-edge focus:border-neon-green/50 outline-none transition-all placeholder:text-slate-800 text-sm resize-none overflow-hidden max-h-[200px] font-medium"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                            <label className="p-3.5 hover:bg-white/5 sharp-edge text-slate-600 hover:text-white transition-all cursor-pointer group">
                                <input type="file" multiple className="hidden" onChange={handleFileChange} />
                                <Paperclip className="h-5.5 w-5.5 group-hover:rotate-12 transition-transform" />
                            </label>
                            <button
                                onClick={handleSend}
                                disabled={isSending || (!inputValue.trim() && attachments.length === 0)}
                                className="p-3.5 bg-neon-green text-black sharp-edge hover:bg-neon-green/90 transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 group relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none" />
                                <Send className="h-5.5 w-5.5 relative z-10" />
                            </button>
                        </div>
                    </div>
                    <p className="text-[10px] text-center text-slate-600 uppercase tracking-widest">
                        Pressione Enter para enviar • Shift + Enter para nova linha
                    </p>
                </div>
            </div>
        </div>
    )
}
