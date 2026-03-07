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
            <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-slate-900/80 border-b border-slate-800 text-xs font-bold text-slate-400 uppercase tracking-widest">
                <div className="col-span-5 sm:col-span-4">Usuário</div>
                <div className="col-span-3 sm:col-span-3 hidden sm:block">Email</div>
                <div className="col-span-3 sm:col-span-2 text-center">Status</div>
                <div className="col-span-4 sm:col-span-3 text-right text-xs">Ações</div>
            </div>

            <div className="divide-y divide-slate-800/50">
                {users.map((u) => {
                    const isSelf = u.id === currentUserId
                    const isAdmin = u.role === "admin"
                    const isBlocked = u.status === "blocked"

                    return (
                        <div key={u.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-slate-800/20 transition-colors">
                            <div className="col-span-5 sm:col-span-4 flex items-center gap-3">
                                <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${isAdmin ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30" : "bg-slate-800 text-slate-400 border border-slate-700"} `}>
                                    {isAdmin ? <Shield className="h-5 w-5" /> : <User className="h-5 w-5" />}
                                </div>
                                <div className="truncate">
                                    <div className="text-sm font-semibold text-white flex items-center gap-2">
                                        <span className="truncate">{u.full_name || "Sem Nome"}</span>
                                        {isSelf && <span className="text-[10px] bg-indigo-500 text-white px-2 py-0.5 rounded-full font-bold ml-1">Você</span>}
                                    </div>
                                    <div className="text-xs text-slate-500 sm:hidden truncate">{u.email}</div>
                                </div>
                            </div>

                            <div className="col-span-3 sm:col-span-3 hidden sm:flex items-center text-sm text-slate-300 truncate">
                                {u.email}
                            </div>

                            <div className="col-span-3 sm:col-span-2 flex items-center justify-center">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${isBlocked
                                    ? "bg-rose-500/10 text-rose-500 border border-rose-500/20"
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
                                        className="px-3 py-2 rounded-xl text-xs font-bold bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 transition-all flex items-center gap-1.5"
                                        title="Visualizar Quadros do Usuário"
                                    >
                                        <Eye className="h-3 w-3" />
                                        <span className="hidden xl:inline">Monitorar</span>
                                    </Link>
                                )}

                                {isSelf ? (
                                    <span className="text-xs text-slate-600 font-medium">Conta Atual</span>
                                ) : (
                                    <button
                                        onClick={() => handleStatusChange(u.id, isBlocked ? "active" : "blocked")}
                                        disabled={loadingId === u.id}
                                        className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${isBlocked
                                                ? "bg-slate-800 hover:bg-slate-700 text-slate-300"
                                                : "bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20"
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
