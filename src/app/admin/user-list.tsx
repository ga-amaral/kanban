"use client"

import { useState } from "react"
import { updateUserStatus } from "@/app/actions/admin"
import { Shield, ShieldAlert, User, ShieldCheck, Loader2, Slash, Eye } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

export function AdminUserList({ users, currentUserId }: { users: any[], currentUserId: string }) {
    const [loadingId, setLoadingId] = useState<string | null>(null)

    const handleStatusChange = async (userId: string, newStatus: "active" | "blocked") => {
        setLoadingId(userId)
        const result = await updateUserStatus(userId, newStatus)

        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success(newStatus === "active" ? "Usuário Desbloqueado!" : "Usuário Bloqueado!")
        }
        setLoadingId(null)
    }

    return (
        <div className="w-full">
            <div className="grid grid-cols-12 gap-4 px-6 py-5 bg-black/40 border-b border-white/5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                <div className="col-span-5 sm:col-span-4">Usuário</div>
                <div className="col-span-3 sm:col-span-3 hidden sm:block">Email</div>
                <div className="col-span-3 sm:col-span-2 text-center">Status</div>
                <div className="col-span-4 sm:col-span-3 text-right">Ações</div>
            </div>

            <div className="divide-y divide-slate-800/50">
                {users.map((u) => {
                    const isSelf = u.id === currentUserId
                    const isAdmin = u.role === "admin"
                    const isBlocked = u.status === "blocked"
                    const isSuperAdmin = u.email === "amaralgabriel123@gmail.com" || u.email === "amaralgabriel4321@gmail.com"

                    return (
                        <div key={u.id} className="grid grid-cols-12 gap-4 px-6 py-5 items-center hover:bg-white/[0.02] transition-colors border-b border-white/[0.02] last:border-0">
                            <div className="col-span-5 sm:col-span-4 flex items-center gap-3">
                                <div className={`flex-shrink-0 h-10 w-10 sharp-edge flex items-center justify-center transition-all ${isAdmin ? "bg-neon-green/10 text-neon-green border border-neon-green/30 neon-glow" : "bg-white/5 text-slate-500 border border-white/5"} `}>
                                    {isAdmin ? <Shield className="h-5 w-5" /> : <User className="h-5 w-5" />}
                                </div>
                                <div className="truncate">
                                    <div className="text-sm font-black text-white flex items-center gap-2 uppercase tracking-tight">
                                        <span className="truncate">{u.full_name || "Sem Nome"}</span>
                                        {isSelf && <span className="text-[10px] bg-neon-green text-black px-2 py-0.5 sharp-edge font-black ml-1">VOCÊ</span>}
                                    </div>
                                    <div className="text-xs text-slate-500 sm:hidden truncate">{u.email}</div>
                                </div>
                            </div>

                            <div className="col-span-3 sm:col-span-3 hidden sm:flex items-center text-sm text-slate-300 truncate">
                                {u.email}
                            </div>

                            <div className="col-span-3 sm:col-span-2 flex items-center justify-center">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 sharp-edge text-[10px] font-black uppercase tracking-widest ${isBlocked
                                    ? "bg-signal-orange/10 text-signal-orange border border-signal-orange/20"
                                    : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                                    }`}>
                                    {isBlocked ? (
                                        <>
                                            <ShieldAlert className="h-3 w-3" />
                                            Bloqueado
                                        </>
                                    ) : (
                                        <>
                                            <ShieldCheck className="h-3 w-3" />
                                            Ativo
                                        </>
                                    )}
                                </span>
                            </div>

                            <div className="col-span-4 sm:col-span-3 flex items-center justify-end gap-2">
                                {!isSelf && (
                                    <Link
                                        href={`/admin/user/${u.id}`}
                                        className="px-4 py-2 sharp-edge text-[10px] font-black uppercase tracking-widest bg-white/5 hover:bg-white/10 text-white border border-white/5 transition-all flex items-center gap-2"
                                        title="Visualizar Quadros do Usuário"
                                    >
                                        <Eye className="h-3.5 w-3.5" />
                                        <span className="hidden xl:inline">Monitorar</span>
                                    </Link>
                                )}

                                {isSuperAdmin ? (
                                    <span className="text-[10px] text-neon-green font-black bg-neon-green/10 px-3 py-2 sharp-edge border border-neon-green/20 flex items-center gap-1.5 cursor-not-allowed mx-auto uppercase tracking-widest" title="Master Admin Protegido">
                                        <ShieldCheck className="h-3.5 w-3.5" />
                                        Protegido
                                    </span>
                                ) : isSelf ? (
                                    <span className="text-xs text-slate-600 font-medium">Conta Atual</span>
                                ) : (
                                    <button
                                        onClick={() => handleStatusChange(u.id, isBlocked ? "active" : "blocked")}
                                        disabled={loadingId === u.id}
                                        className={`px-4 py-2 sharp-edge text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${isBlocked
                                            ? "bg-neon-green text-black hover:bg-neon-green/90"
                                            : "bg-signal-orange/10 hover:bg-signal-orange/20 text-signal-orange border border-signal-orange/20"
                                            }`}
                                    >
                                        {loadingId === u.id ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : isBlocked ? (
                                            <>
                                                Desbloquear
                                            </>
                                        ) : (
                                            <>
                                                <Slash className="h-3 w-3" />
                                                <span className="hidden lg:inline">Bloquear</span>
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
