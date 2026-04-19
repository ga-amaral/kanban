"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Copy, Play, Database, User, CreditCard, Folder, Bot, Link2, Settings, Loader2 } from "lucide-react"

type Category = "workspace" | "column" | "card" | "auth" | "agent" | "automation" | "webhook" | "admin"

interface Endpoint {
    name: string
    method: "GET" | "POST" | "PUT" | "DELETE"
    apiPath: string
    params?: string[]
    bodyFields?: string[]
    description: string
}

const endpoints: Record<Category, Endpoint[]> = {
    workspace: [
        { name: "getWorkspaces", method: "GET", apiPath: "/api/workspace", description: "Listar workspaces do usuário" },
        { name: "createWorkspace", method: "POST", apiPath: "/api/workspace", bodyFields: ["name"], description: "Criar workspace" },
        { name: "updateWorkspace", method: "PUT", apiPath: "/api/workspace", bodyFields: ["workspaceId", "name"], description: "Atualizar workspace" },
        { name: "deleteWorkspace", method: "DELETE", apiPath: "/api/workspace", params: ["workspaceId"], description: "Deletar workspace" },
    ],
    column: [
        { name: "getColumns", method: "GET", apiPath: "/api/column", params: ["workspaceId"], description: "Listar colunas" },
        { name: "createColumn", method: "POST", apiPath: "/api/column", bodyFields: ["workspaceId", "title", "order"], description: "Criar coluna" },
    ],
    card: [
        { name: "getCards", method: "GET", apiPath: "/api/card", params: ["columnId"], description: "Listar cards por coluna" },
        { name: "getCardsByWorkspace", method: "GET", apiPath: "/api/card", params: ["workspaceId"], description: "Listar todos cards do workspace" },
        { name: "createCard", method: "POST", apiPath: "/api/card", bodyFields: ["workspace_id", "column_id", "title", "contact_name", "contact_phone", "due_date"], description: "Criar card" },
        { name: "moveCard", method: "PUT", apiPath: "/api/card", bodyFields: ["action", "cardId", "column_id"], description: "Mover card para outra coluna" },
        { name: "updateCard", method: "PUT", apiPath: "/api/card", bodyFields: ["cardId", "title", "contact_name", "contact_phone", "due_date"], description: "Atualizar card" },
        { name: "deleteCard", method: "DELETE", apiPath: "/api/card", params: ["cardId"], description: "Deletar card" },
    ],
    auth: [
        { name: "signIn", method: "POST", apiPath: "/api/auth", bodyFields: ["email", "password"], description: "Login" },
        { name: "signUp", method: "POST", apiPath: "/api/auth", bodyFields: ["email", "password", "name"], description: "Cadastro" },
    ],
    agent: [
        { name: "getAgents", method: "GET", apiPath: "/api/agent", params: ["workspaceId"], description: "Listar agentes" },
        { name: "createAgent", method: "POST", apiPath: "/api/agent", bodyFields: ["workspace_id", "name", "system_prompt"], description: "Criar agente" },
    ],
    automation: [
        { name: "getAutomations", method: "GET", apiPath: "/api/automation", params: ["workspaceId"], description: "Listar automações" },
        { name: "createAutomation", method: "POST", apiPath: "/api/automation", bodyFields: ["workspace_id", "name", "trigger_config", "action_config"], description: "Criar automação" },
    ],
    webhook: [
        { name: "testWebhook", method: "POST", apiPath: "/api/webhook", bodyFields: ["url", "payload"], description: "Testar webhook" },
    ],
    admin: [
        { name: "getUsers", method: "GET", apiPath: "/api/admin", description: "Listar usuários (admin)" },
    ],
}

const categoryInfo: Record<Category, { icon: any; label: string; color: string }> = {
    workspace: { icon: Folder, label: "Workspace", color: "text-blue-400" },
    column: { icon: Database, label: "Coluna", color: "text-purple-400" },
    card: { icon: CreditCard, label: "Card", color: "text-green-400" },
    auth: { icon: User, label: "Auth", color: "text-yellow-400" },
    agent: { icon: Bot, label: "Agente AI", color: "text-pink-400" },
    automation: { icon: Settings, label: "Automação", color: "text-orange-400" },
    webhook: { icon: Link2, label: "Webhook", color: "text-cyan-400" },
    admin: { icon: User, label: "Admin", color: "text-red-400" },
}

export default function ApiTestPage() {
    const [category, setCategory] = useState<Category>("card")
    const [endpoint, setEndpoint] = useState<Endpoint | null>(null)
    const [params, setParams] = useState<Record<string, string>>({})
    const [body, setBody] = useState<Record<string, string>>({})
    const [baseUrl, setBaseUrl] = useState("")
    const [loading, setLoading] = useState(false)
    const [response, setResponse] = useState<{ status: number; data: any } | null>(null)

    useEffect(() => {
        if (typeof window !== "undefined") {
            setBaseUrl(window.location.origin)
        }
    }, [])

    const generateCurl = () => {
        if (!endpoint || !baseUrl) return ""

        const queryParams = new URLSearchParams(params).toString()
        let url = `${baseUrl}${endpoint.apiPath}`
        
        if (endpoint.method === "GET" && queryParams) {
            url += `?${queryParams}`
        }

        let curl = `curl -X ${endpoint.method} "${url}"`

        if (endpoint.method !== "GET" && endpoint.method !== "DELETE") {
            curl += ` \\\n  -H "Content-Type: application/json"`
        }

        const bodyObj = { ...body }
        if (endpoint.params) {
            endpoint.params.forEach(p => {
                if (params[p]) bodyObj[p] = params[p]
            })
        }

        if (Object.keys(bodyObj).length > 0 && (endpoint.method === "POST" || endpoint.method === "PUT")) {
            curl += ` \\\n  -d '${JSON.stringify(bodyObj)}'`
        }

        return curl
    }

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generateCurl())
        toast.success("cURL copiado!")
    }

    const handleEndpointSelect = (ep: Endpoint) => {
        setEndpoint(ep)
        setParams({})
        setBody({})
        setResponse(null)
    }

    const handleFieldChange = (field: string, value: string, isParam: boolean) => {
        if (isParam) {
            setParams({ ...params, [field]: value })
        } else {
            setBody({ ...body, [field]: value })
        }
    }

    const executeAction = async () => {
        if (!endpoint || !baseUrl) {
            toast.error("Configure a URL base primeiro")
            return
        }

        setLoading(true)
        setResponse(null)

        try {
            const queryParams = new URLSearchParams(params).toString()
            let url = `${baseUrl}${endpoint.apiPath}`
            
            if (endpoint.method === "GET" && queryParams) {
                url += `?${queryParams}`
            }

            const fetchOptions: RequestInit = {
                method: endpoint.method,
                headers: {
                    "Content-Type": "application/json",
                },
            }

            const bodyObj = { ...body }
            if (endpoint.params) {
                endpoint.params.forEach(p => {
                    if (params[p]) bodyObj[p] = params[p]
                })
            }

            if (bodyObj && (endpoint.method === "POST" || endpoint.method === "PUT")) {
                fetchOptions.body = JSON.stringify(bodyObj)
            }

            const res = await fetch(url, fetchOptions)
            let data
            const contentType = res.headers.get("content-type")
            if (contentType?.includes("application/json")) {
                data = await res.json()
            } else {
                data = await res.text()
            }

            setResponse({ status: res.status, data })
            toast.success(`Requisição executada (${res.status})`)
        } catch (error: any) {
            setResponse({ status: 0, data: { error: error.message } })
            toast.error("Erro ao executar requisição")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-transparent text-slate-200 font-sans selection:bg-neon-green/30 p-6 md:p-12">
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-white font-outfit uppercase tracking-tighter">
                            API Test Console
                        </h1>
                        <p className="text-slate-500 text-xs font-black uppercase tracking-[0.2em] mt-2">
                            Selecione uma ação para testar ou gerar o cURL
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                            URL:
                        </label>
                        <input
                            type="text"
                            value={baseUrl}
                            onChange={(e) => setBaseUrl(e.target.value)}
                            className="bg-black/40 border border-white/5 text-xs p-2 sharp-edge text-white focus:outline-none focus:border-neon-green/50 w-60"
                            placeholder="http://localhost:3000"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
                    {(Object.keys(categoryInfo) as Category[]).map((cat) => {
                        const info = categoryInfo[cat]
                        const Icon = info.icon
                        return (
                            <button
                                key={cat}
                                onClick={() => {
                                    setCategory(cat)
                                    setEndpoint(null)
                                    setResponse(null)
                                }}
                                className={`p-4 sharp-edge border transition-all ${
                                    category === cat
                                        ? "bg-neon-green/10 border-neon-green/50"
                                        : "bg-carbon border-white/5 hover:border-white/20"
                                }`}
                            >
                                <Icon className={`h-5 w-5 mx-auto mb-2 ${info.color}`} />
                                <span className="text-[10px] font-black uppercase tracking-widest block">
                                    {info.label}
                                </span>
                            </button>
                        )
                    })}
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-carbon border border-white/5 sharp-edge overflow-hidden shadow-2xl">
                        <div className="p-4 border-b border-white/5 bg-black/20">
                            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                                Endpoints
                            </h2>
                        </div>
                        <div className="divide-y divide-white/5 max-h-[400px] overflow-y-auto">
                            {endpoints[category].map((ep) => (
                                <button
                                    key={ep.name}
                                    onClick={() => handleEndpointSelect(ep)}
                                    className={`w-full p-4 text-left hover:bg-white/5 transition-colors ${
                                        endpoint?.name === ep.name ? "bg-neon-green/10" : ""
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span
                                            className={`text-[10px] font-black px-2 py-1 sharp-edge ${
                                                ep.method === "GET"
                                                    ? "bg-blue-500/20 text-blue-400"
                                                    : ep.method === "POST"
                                                    ? "bg-green-500/20 text-green-400"
                                                    : ep.method === "PUT"
                                                    ? "bg-yellow-500/20 text-yellow-400"
                                                    : "bg-red-500/20 text-red-400"
                                            }`}
                                        >
                                            {ep.method}
                                        </span>
                                        <span className="text-xs font-black text-white uppercase">
                                            {ep.name}
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-slate-500 mt-2">{ep.description}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-6">
                        {endpoint && (
                            <>
                                <div className="bg-carbon border border-white/5 sharp-edge overflow-hidden shadow-2xl">
                                    <div className="p-4 border-b border-white/5 bg-black/20">
                                        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                                            Parâmetros e Body
                                        </h2>
                                    </div>
                                    <div className="p-4 space-y-4">
                                        {endpoint.params?.map((param) => (
                                            <div key={`param-${param}`}>
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-2">
                                                    {param} (query)
                                                </label>
                                                <input
                                                    type="text"
                                                    value={params[param] || ""}
                                                    onChange={(e) => handleFieldChange(param, e.target.value, true)}
                                                    className="w-full bg-black/40 border border-white/5 text-xs p-3 sharp-edge text-white focus:outline-none focus:border-neon-green/50 font-mono"
                                                    placeholder={`Digite ${param}...`}
                                                />
                                            </div>
                                        ))}
                                        {endpoint.bodyFields?.map((field) => (
                                            <div key={`body-${field}`}>
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-2">
                                                    {field} (body)
                                                </label>
                                                <input
                                                    type="text"
                                                    value={body[field] || ""}
                                                    onChange={(e) => handleFieldChange(field, e.target.value, false)}
                                                    className="w-full bg-black/40 border border-white/5 text-xs p-3 sharp-edge text-white focus:outline-none focus:border-neon-green/50 font-mono"
                                                    placeholder={`Digite ${field}...`}
                                                />
                                            </div>
                                        ))}
                                        {(!endpoint.params?.length && !endpoint.bodyFields?.length) && (
                                            <p className="text-[10px] text-slate-500">Esta ação não requer parâmetros</p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={executeAction}
                                        disabled={loading}
                                        className="flex-1 bg-neon-green text-black py-3 sharp-edge font-black uppercase tracking-widest text-xs hover:bg-neon-green/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {loading ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Play className="h-4 w-4" />
                                        )}
                                        Testar API
                                    </button>
                                    <button
                                        onClick={copyToClipboard}
                                        className="bg-carbon border border-white/20 text-white py-3 px-6 sharp-edge font-black uppercase tracking-widest text-xs hover:border-neon-green/50 transition-colors flex items-center gap-2"
                                    >
                                        <Copy className="h-4 w-4" />
                                        Copiar cURL
                                    </button>
                                </div>

                                {response && (
                                    <div className="bg-carbon border border-white/5 sharp-edge overflow-hidden shadow-2xl">
                                        <div className="p-4 border-b border-white/5 bg-black/20 flex items-center justify-between">
                                            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                                                Resposta
                                            </h2>
                                            <span className={`text-[10px] font-black px-2 py-1 sharp-edge ${
                                                response.status >= 200 && response.status < 300
                                                    ? "bg-green-500/20 text-green-400"
                                                    : "bg-red-500/20 text-red-400"
                                            }`}>
                                                Status: {response.status}
                                            </span>
                                        </div>
                                        <div className="p-4">
                                            <pre className="text-xs font-mono text-slate-300 whitespace-pre-wrap break-all bg-black/40 p-4 sharp-edge max-h-60 overflow-y-auto">
                                                {typeof response.data === "string" 
                                                    ? response.data 
                                                    : JSON.stringify(response.data, null, 2)}
                                            </pre>
                                        </div>
                                    </div>
                                )}

                                <div className="bg-carbon border border-white/5 sharp-edge overflow-hidden shadow-2xl">
                                    <div className="p-4 border-b border-white/5 bg-black/20">
                                        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                                            cURL Gerado
                                        </h2>
                                    </div>
                                    <div className="p-4">
                                        <pre className="text-xs font-mono text-neon-green whitespace-pre-wrap break-all bg-black/40 p-4 sharp-edge">
                                            {generateCurl()}
                                        </pre>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}