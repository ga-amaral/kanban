"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, X, FileText, ArrowRight, Check, Loader2, AlertCircle } from "lucide-react"
import { bulkCreateCards } from "@/app/actions/card"
import { toast } from "sonner"

export function CSVImporter({
    workspaceId,
    columnId,
    onImportComplete,
    onClose
}: {
    workspaceId: string,
    columnId: string,
    onImportComplete: (cards: any[]) => void,
    onClose: () => void
}) {
    const [step, setStep] = useState<"upload" | "mapping" | "importing">("upload")
    const [file, setFile] = useState<File | null>(null)
    const [headers, setHeaders] = useState<string[]>([])
    const [previewData, setPreviewData] = useState<any[]>([])
    const [mapping, setMapping] = useState<Record<string, string>>({
        contact_name: "",
        contact_phone: "",
        due_date: ""
    })
    const [isProcessing, setIsProcessing] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0]
        if (!selectedFile) return

        if (!selectedFile.name.endsWith(".csv")) {
            toast.error("Por favor, selecione um arquivo CSV.")
            return
        }

        const reader = new FileReader()
        reader.onload = (event) => {
            const text = event.target?.result as string
            const lines = text.split("\n").map(l => l.trim()).filter(l => l)
            if (lines.length < 2) {
                toast.error("O arquivo deve conter cabeçalho e pelo menos uma linha de dados.")
                return
            }

            const rawHeaders = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ''))
            const rawData = lines.slice(1).map(line => {
                const values = line.split(",").map(v => v.trim().replace(/^"|"$/g, ''))
                return rawHeaders.reduce((acc, header, i) => {
                    acc[header] = values[i]
                    return acc
                }, {} as any)
            })

            setFile(selectedFile)
            setHeaders(rawHeaders)
            setPreviewData(rawData)
            autoMap(rawHeaders)
            setStep("mapping")
        }
        reader.readAsText(selectedFile)
    }

    const autoMap = (headerList: string[]) => {
        const newMapping = { ...mapping }
        headerList.forEach(h => {
            const lh = h.toLowerCase()
            if (lh.includes("nome") || lh.includes("name") || lh.includes("contato")) newMapping.contact_name = h
            if (lh.includes("tel") || lh.includes("cel") || lh.includes("phone")) newMapping.contact_phone = h
            if (lh.includes("data") || lh.includes("due") || lh.includes("entrega")) newMapping.due_date = h
        })
        setMapping(newMapping)
    }

    const handleImport = async () => {
        if (!mapping.contact_name) {
            toast.error("O campo 'Nome do Contato' é obrigatório.")
            return
        }

        setIsProcessing(true)
        setStep("importing")

        const cardsToCreate = previewData.map(row => {
            const customData: Record<string, any> = {}
            headers.forEach(h => {
                if (h !== mapping.contact_name && h !== mapping.contact_phone && h !== mapping.due_date) {
                    customData[h] = row[h]
                }
            })

            return {
                column_id: columnId,
                contact_name: row[mapping.contact_name] || "Sem Nome",
                contact_phone: row[mapping.contact_phone] || "",
                due_date: row[mapping.due_date] || null,
                custom_data_jsonb: customData,
                position: 0
            }
        })

        const result = await bulkCreateCards(workspaceId, cardsToCreate)
        if (result.data) {
            toast.success(`${result.data.length} cards importados com sucesso!`)
            onImportComplete(result.data)
            onClose()
        } else {
            toast.error("Erro ao importar cards.")
            setStep("mapping")
        }
        setIsProcessing(false)
    }

    const downloadTemplate = () => {
        const headers = "Nome,Telefone,Data Entrega,Observacao\n"
        const example = "João Silva,11999999999,2026-12-31,Cliente VIP\n"
        const blob = new Blob([headers + example], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement("a")
        const url = URL.createObjectURL(blob)
        link.setAttribute("href", url)
        link.setAttribute("download", "modelo_kanban.csv")
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-[40px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
                <div className="p-8 border-b border-slate-800 flex items-center justify-between bg-white/[0.02]">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                            <Upload className="h-6 w-6 text-indigo-400" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white font-outfit">Importador de CSV</h3>
                            <p className="text-slate-400 text-xs">Transforme arquivos em cards instantaneamente.</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl transition-colors">
                        <X className="h-6 w-6 text-slate-500" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8">
                    {step === "upload" && (
                        <div className="space-y-6">
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-slate-800 hover:border-indigo-500/50 rounded-[32px] p-16 text-center cursor-pointer transition-all bg-slate-950/30 group"
                            >
                                <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".csv" className="hidden" />
                                <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                                    <FileText className="h-10 w-10 text-slate-500 group-hover:text-indigo-400" />
                                </div>
                                <h4 className="text-lg font-bold text-white mb-2">Selecione ou Arraste o CSV</h4>
                                <p className="text-slate-500 text-sm max-w-xs mx-auto">Certifique-se que a primeira linha contém os nomes das colunas.</p>
                            </div>

                            <div className="bg-slate-950/50 border border-slate-800 p-6 rounded-3xl flex items-center justify-between">
                                <div className="space-y-1">
                                    <h5 className="text-sm font-bold text-white">Não tem um arquivo pronto?</h5>
                                    <p className="text-xs text-slate-500">Baixe nosso modelo para garantir a melhor importação.</p>
                                </div>
                                <button
                                    onClick={downloadTemplate}
                                    className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all border border-slate-700 shadow-lg"
                                >
                                    Baixar Modelo .CSV
                                </button>
                            </div>
                        </div>
                    )}

                    {step === "mapping" && (
                        <div className="space-y-8">
                            <div className="bg-indigo-500/5 border border-indigo-500/10 p-6 rounded-3xl flex items-start gap-4">
                                <AlertCircle className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
                                <div className="text-sm text-indigo-200/80 leading-relaxed">
                                    Encontramos <b>{previewData.length}</b> registros no arquivo <b>{file?.name}</b>. Por favor, confirme o mapeamento das colunas abaixo.
                                </div>
                            </div>

                            <div className="grid gap-4">
                                {[
                                    { key: "contact_name", label: "Nome do Contato", required: true },
                                    { key: "contact_phone", label: "Telefone / WhatsApp", required: false },
                                    { key: "due_date", label: "Data de Entrega", required: false }
                                ].map(field => (
                                    <div key={field.key} className="flex items-center gap-4 bg-slate-950/50 border border-slate-800 p-4 rounded-2xl">
                                        <div className="flex-1">
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Campo do Sistema</span>
                                            <div className="text-white font-bold flex items-center gap-2">
                                                {field.label}
                                                {field.required && <span className="text-rose-500">*</span>}
                                            </div>
                                        </div>
                                        <ArrowRight className="h-4 w-4 text-slate-700" />
                                        <div className="flex-1">
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Coluna no CSV</span>
                                            <select
                                                value={mapping[field.key]}
                                                onChange={(e) => setMapping({ ...mapping, [field.key]: e.target.value })}
                                                className="w-full bg-slate-900 border border-slate-800 text-white px-3 py-2 rounded-xl text-xs outline-none focus:border-indigo-500/50"
                                            >
                                                <option value="">Ignorar este campo</option>
                                                {headers.map(h => <option key={h} value={h}>{h}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-4 border-t border-slate-800">
                                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Campos Adicionais</h4>
                                <p className="text-xs text-slate-400 mb-4">Todas as outras colunas serão salvas como informações adicionais do card.</p>
                                <div className="flex flex-wrap gap-2">
                                    {headers.filter(h => !Object.values(mapping).includes(h)).map(h => (
                                        <div key={h} className="bg-slate-800/50 border border-slate-700 px-3 py-1.5 rounded-full text-[10px] text-slate-300">
                                            {h}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {step === "importing" && (
                        <div className="py-20 text-center space-y-6">
                            <div className="relative w-24 h-24 mx-auto">
                                <Loader2 className="w-full h-full text-indigo-500 animate-spin" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Upload className="h-8 w-8 text-indigo-400" />
                                </div>
                            </div>
                            <div>
                                <h4 className="text-xl font-bold text-white mb-2">Importando Dados...</h4>
                                <p className="text-slate-500 text-sm">Estamos criando seus cards e configurando os gatilhos.</p>
                            </div>
                        </div>
                    )}
                </div>

                {step === "mapping" && (
                    <div className="p-8 border-t border-slate-800 bg-white/[0.02] flex gap-4">
                        <button
                            onClick={() => setStep("upload")}
                            className="flex-1 bg-slate-800 border border-slate-700 text-white font-bold py-4 rounded-2xl hover:bg-slate-700 transition-all"
                        >
                            Trocar Arquivo
                        </button>
                        <button
                            onClick={handleImport}
                            disabled={isProcessing}
                            className="flex-[2] bg-indigo-600 text-white font-bold py-4 rounded-2xl shadow-xl shadow-indigo-500/20 hover:bg-indigo-500 transition-all flex items-center justify-center gap-2"
                        >
                            <Check className="h-5 w-5" />
                            Iniciar Importação
                        </button>
                    </div>
                )}
            </motion.div>
        </div>
    )
}
