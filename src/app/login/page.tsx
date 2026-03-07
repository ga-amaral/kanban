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

            {/* Efeitos de Fundo Dinâmicos */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/20 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-[440px] z-10"
            >
                <div className="bg-slate-900/40 backdrop-blur-2xl border border-white/5 p-8 rounded-[40px] shadow-2xl relative overflow-hidden group">
                    {/* Linha de brilho superior */}
                    <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />

                    <div className="text-center mb-10">
                        <motion.div
                            layout
                            className="inline-flex items-center justify-center p-4 bg-indigo-500/10 rounded-3xl mb-6 border border-indigo-500/20"
                        >
                            {mode === "login" ? <LogIn className="h-8 w-8 text-indigo-400" /> : <UserPlus className="h-8 w-8 text-purple-400" />}
                        </motion.div>
                        <h1 className="text-4xl font-bold text-white font-outfit tracking-tight mb-2">
                            AutoKanban <span className="text-indigo-400">CRM</span>
                        </h1>
                        <p className="text-slate-400 text-sm font-medium">
                            {mode === "login" ? "Bem-vindo de volta ao futuro da gestão." : "Comece sua jornada premium hoje."}
                        </p>
                    </div>

                    {/* Switcher de Modo */}
                    <div className="flex p-1 bg-black/40 rounded-2xl mb-8 border border-white/5 relative">
                        <motion.div
                            layoutId="activeTab"
                            className="absolute inset-1 bg-slate-800 rounded-xl"
                            initial={false}
                            animate={{ x: mode === "login" ? 0 : "100%" }}
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            style={{ width: 'calc(50% - 4px)' }}
                        />
                        <button
                            onClick={() => setMode("login")}
                            className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-widest relative z-10 transition-colors ${mode === "login" ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            Login
                        </button>
                        <button
                            onClick={() => setMode("register")}
                            className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-widest relative z-10 transition-colors ${mode === "register" ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            Registro
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-1">
                                E-mail
                            </label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    placeholder="seu@exemplo.com"
                                    className="w-full bg-black/50 border border-slate-800 text-white pl-12 pr-4 py-4 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all placeholder:text-slate-700 font-medium"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-1">
                                Senha
                            </label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                                <input
                                    name="password"
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    className="w-full bg-black/50 border border-slate-800 text-white pl-12 pr-4 py-4 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all placeholder:text-slate-700 font-medium"
                                />
                            </div>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={loading}
                            className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-xl disabled:opacity-50 ${mode === "login" ? 'bg-white text-black hover:bg-slate-200 shadow-white/5' : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-500/20'}`}
                        >
                            {loading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <>
                                    {mode === "login" ? "Entrar na Conta" : "Criar Minha Conta"}
                                </>
                            )}
                        </motion.button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-white/5 text-center space-y-4">
                        <p className="text-slate-500 text-[10px] uppercase tracking-widest font-bold">
                            Desenvolvido por <a href="https://instagram.com/sougabrielamaral" target="_blank" className="text-white hover:text-indigo-400 underline underline-offset-4 decoration-slate-800 transition-colors">Gabriel Amaral</a>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
