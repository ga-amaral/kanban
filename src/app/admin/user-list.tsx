"use client"

import { useState } from "react"
import { updateUserStatus, updateUserProfile, deleteUserAccount } from "@/app/actions/admin"
import { Shield, ShieldAlert, User, ShieldCheck, Loader2, Slash, Eye, Edit2, Check, X, Trash2 } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

export function AdminUserList({ users, currentUserId }: { users: any[], currentUserId: string }) {
    const [loadingId, setLoadingId] = useState<string | null>(null)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editValue, setEditValue] = useState("")

    const handleStatusChange = async (userId: string, newStatus: "active" | "blocked") => {
        setLoadingId(userId)
        try {
            const result = await updateUserStatus(userId, newStatus)
            if (result.error) toast.error(result.error)
            else toast.success(newStatus === "active" ? "Usuário Desbloqueado!" : "Usuário Bloqueado!")
        } catch (e) {
            toast.error("Erro ao atualizar status")
        } finally {
            setLoadingId(null)
        }
    }

    const handleSaveName = async (userId: string) => {
        if (!editValue.trim()) return
        setLoadingId(userId)
        try {
            const result = await updateUserProfile(userId, { full_name: editValue })
            if (result.error) toast.error(result.error)
            else {
                toast.success("Perfil atualizado!")
                setEditingId(null)
            }
        } catch (e) {
            toast.error("Erro ao salvar nome")
        } finally {
            setLoadingId(null)
        }
    }

    const handleDeleteUser = async (userId: string, email: string) => {
        if (!window.confirm(`Excluir conta de ${email}?`)) return
        setLoadingId(userId)
        try {
            const result = await deleteUserAccount(userId)
            if (result.error) toast.error(result.error)
            else toast.success("Usuário excluído!")
        } catch (e) {
            toast.error("Erro ao excluir")
        } finally {
            setLoadingId(null)
        }
    }

    return (
        <div className="w-full overflow-x-auto">
            <table className="w-full border-collapse">
                <thead className="bg-black/40 border-b border-white/5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-left">
                    <tr>
                        <th className="px-6 py-5">Usuário</th>
                        <th className="px-6 py-5 hidden md:table-cell">Email</th>
                        <th className="px-6 py-5 text-center">Status</th>
                        <th className="px-6 py-5 text-right">Ações</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {users.map((u) => {
                        const isSelf = u.id === currentUserId
                        const isAdmin = u.role === "admin"
                        const isBlocked = u.status === "blocked"
                        const isSuperAdmin = u.email === "amaralgabriel123@gmail.com" || u.email === "amaralgabriel4321@gmail.com"
                        const isLoading = loadingId === u.id

                        return (
                            <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-3">
                                        <div className={`h-10 w-10 sharp-edge flex items-center justify-center ${isAdmin ? "bg-neon-green/10 text-neon-green border border-neon-green/30" : "bg-white/5 text-slate-500 border border-white/5"}`}>
                                            {isAdmin ? <Shield size={20} /> : <User size={20} />}
                                        </div>
                                        <div>
                                            {editingId === u.id ? (
                                                <div className="flex items-center gap-2">
                                                    <input 
                                                        autoFocus
                                                        value={editValue}
                                                        onChange={(e) => setEditValue(e.target.value)}
                                                        className="bg-black/40 border border-neon-green/30 text-white px-2 py-1 sharp-edge text-sm"
                                                    />
                                                    <Check className="h-4 w-4 text-neon-green cursor-pointer" onClick={() => handleSaveName(u.id)} />
                                                    <X className="h-4 w-4 text-rose-500 cursor-pointer" onClick={() => setEditingId(null)} />
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 group">
                                                    <span className="text-sm font-black text-white uppercase">{u.full_name || "Sem Nome"}</span>
                                                    {!isSuperAdmin && !isSelf && (
                                                        <Edit2 size={12} className="text-slate-500 opacity-0 group-hover:opacity-100 cursor-pointer" onClick={() => { setEditingId(u.id); setEditValue(u.full_name || ""); }} />
                                                    )}
                                                    {isSelf && <span className="text-[10px] bg-neon-green text-black px-1.5 py-0.5 font-bold uppercase">VOCÊ</span>}
                                                </div>
                                            )}
                                            <div className="text-[10px] text-slate-500 md:hidden">{u.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-5 hidden md:table-cell">
                                    <span className="text-sm text-slate-300">{u.email}</span>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex justify-center">
                                        <span className={`px-2 py-1 text-[10px] font-black uppercase tracking-widest border ${isBlocked ? "bg-rose-500/10 text-rose-500 border-rose-500/20" : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"}`}>
                                            {isBlocked ? "Bloqueado" : "Ativo"}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex items-center justify-end gap-2">
                                        {!isSelf && (
                                            <Link href={`/admin/user/${u.id}`} className="p-2 bg-white/5 text-white border border-white/5 hover:bg-white/10" title="Monitorar">
                                                <Eye size={16} />
                                            </Link>
                                        )}
                                        {isSuperAdmin ? (
                                            <span className="text-[10px] text-neon-green font-black border border-neon-green/20 px-2 py-1 uppercase">Protegido</span>
                                        ) : isSelf ? (
                                            <span className="text-[10px] text-slate-500 border border-white/5 px-2 py-1 uppercase">Sua Conta</span>
                                        ) : (
                                            <>
                                                <button 
                                                    onClick={() => handleDeleteUser(u.id, u.email)}
                                                    disabled={isLoading}
                                                    className="p-2 bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500/20 disabled:opacity-50"
                                                >
                                                    {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                                </button>
                                                <button 
                                                    onClick={() => handleStatusChange(u.id, isBlocked ? "active" : "blocked")}
                                                    disabled={isLoading}
                                                    className={`h-9 px-4 text-[10px] font-black uppercase tracking-widest border transition-all disabled:opacity-50 ${isBlocked ? "bg-neon-green text-black border-neon-green" : "bg-white/5 text-white border-white/10 hover:bg-white/10"}`}
                                                >
                                                    {isLoading ? <Loader2 size={16} className="animate-spin" /> : (isBlocked ? "Desbloquear" : "Bloquear")}
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}
