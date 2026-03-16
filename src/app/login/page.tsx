"use client"

import { useState } from "react"
import { signIn, signUp } from "@/app/actions/auth"
import { Loader2, Mail, Lock, UserPlus, LogIn, Github } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { toast, Toaster } from "sonner"

export default function LoginPage() {
    const [mode, setMode] = useState<"login" | "register">("login")
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.currentTarget)

        try {
            if (mode === "login") {
                const result = await signIn(formData)
                if (result?.error) toast.error(result.error)
            } else {
                const result = await signUp(formData)
                if (result?.error) toast.error(result.error)
                if (result?.success) toast.success(result.success)
            }
        } catch (err) {
            toast.error("Ocorreu um erro inesperado.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center p-4 bg-black overflow-hidden relative">
            <Toaster position="top-center" theme="dark" richColors />

            {/* Efeitos de Fundo Dinâmicos - Radical Style */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-neon-green/5 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-carbon/50 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 brightness-50" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-[440px] z-10"
            >
                <div className="bg-carbon border border-white/5 p-10 sharp-edge shadow-2xl relative overflow-hidden group">
                    {/* Linha de brilho superior */}
                    <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-neon-green/30 to-transparent" />

                    <div className="text-center mb-10">
                        <motion.div
                            layout
                            className="inline-flex items-center justify-center p-5 bg-neon-green/10 sharp-edge mb-8 border border-neon-green/20"
                        >
                            {mode === "login" ? <LogIn className="h-8 w-8 text-neon-green" /> : <UserPlus className="h-8 w-8 text-neon-green" />}
                        </motion.div>
                        <h1 className="text-4xl font-black text-white font-outfit uppercase tracking-tighter mb-2">
                            AutoKanban <span className="text-neon-green">CRM</span>
                        </h1>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">
                            {mode === "login" ? "Acesse sua central de comando radical." : "Inicie sua jornada ultra-produtiva agora."}
                        </p>
                    </div>

                    {/* Switcher de Modo */}
                    <div className="flex p-1 bg-black/40 sharp-edge mb-10 border border-white/5 relative">
                        <motion.div
                            layoutId="activeTab"
                            className="absolute inset-1 bg-neon-green sharp-edge"
                            initial={false}
                            animate={{ x: mode === "login" ? 0 : "100%" }}
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            style={{ width: 'calc(50% - 4px)' }}
                        />
                        <button
                            onClick={() => setMode("login")}
                            className={`flex-1 py-3 text-[10px] font-black uppercase tracking-[0.2em] relative z-10 transition-colors ${mode === "login" ? 'text-black' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            Entrar
                        </button>
                        <button
                            onClick={() => setMode("register")}
                            className={`flex-1 py-3 text-[10px] font-black uppercase tracking-[0.2em] relative z-10 transition-colors ${mode === "register" ? 'text-black' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            Registro
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">
                                Endereço de E-mail
                            </label>
                            <div className="relative group/field">
                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within/field:text-neon-green transition-colors" />
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    placeholder="USUARIO@DOMINIO.COM"
                                    className="w-full bg-black/40 border border-white/5 text-white pl-14 pr-6 py-5 sharp-edge focus:outline-none focus:border-neon-green/50 transition-all placeholder:text-slate-700 font-black text-xs uppercase tracking-widest"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">
                                Senha de Acesso
                            </label>
                            <div className="relative group/field">
                                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within/field:text-neon-green transition-colors" />
                                <input
                                    name="password"
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    className="w-full bg-black/40 border border-white/5 text-white pl-14 pr-6 py-5 sharp-edge focus:outline-none focus:border-neon-green/50 transition-all placeholder:text-slate-700 font-medium"
                                />
                            </div>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={loading}
                            className={`w-full py-5 sharp-edge font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-2xl disabled:opacity-50 text-xs ${mode === "login" ? 'bg-neon-green text-black hover:bg-neon-green/90' : 'bg-white text-black hover:bg-slate-200'}`}
                        >
                            {loading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <>
                                    {mode === "login" ? "Autenticar Comando" : "Registrar Identidade"}
                                    <LogIn className="h-4 w-4 ml-1" />
                                </>
                            )}
                        </motion.button>
                    </form>

                    <div className="mt-10 pt-10 border-t border-white/5 text-center px-4">
                        <p className="text-white/20 text-[10px] uppercase tracking-[0.2em] font-black leading-relaxed">
                            Desenvolvido por <a href="https://instagram.com/sougabrielamaral" target="_blank" className="text-white hover:text-neon-green transition-colors">Gabriel Amaral</a>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
