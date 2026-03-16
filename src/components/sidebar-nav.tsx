"use client"

import React, { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Kanban, LayoutGrid, Bot, Settings, ChevronRight, PlusCircle, LogOut, ShieldAlert } from "lucide-react"
import { cn } from "@/lib/utils"
import { signOut } from "@/app/actions/auth"

const navItems = [
    { title: "Dashboard", href: "/", icon: LayoutGrid },
    { title: "Agentes IA", href: "/agents", icon: Bot },
]

export function SidebarNav({ userRole }: { userRole?: string | null }) {
    const pathname = usePathname()
    const [isExpanded, setIsExpanded] = useState(false)

    return (
        <aside 
            onMouseEnter={() => setIsExpanded(true)}
            onMouseLeave={() => setIsExpanded(false)}
            className={cn(
                "fixed left-0 top-0 h-screen z-[100] bg-carbon border-r border-white/5 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] overflow-hidden",
                isExpanded ? "w-64 shadow-[20px_0_50px_rgba(0,0,0,0.5)]" : "w-16"
            )}
        >
            <div className="flex flex-col h-full py-8">
                {/* Logo Section */}
                <Link href="/" className="px-4 mb-16 flex items-center gap-4 group/logo">
                    <div className="min-w-[32px] h-8 bg-neon-green sharp-edge flex items-center justify-center shadow-[0_0_15px_hsla(var(--neon-green),0.3)] group-hover/logo:scale-110 transition-transform">
                        <Kanban className="h-5 w-5 text-black" />
                    </div>
                    <span className={cn(
                        "font-outfit font-black text-xl tracking-tighter text-white transition-all duration-300",
                        isExpanded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
                    )}>
                        AUTO<span className="text-neon-green">KANBAN</span>
                    </span>
                </Link>

                {/* Navigation Links */}
                <nav className="flex-1 px-3 space-y-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
                        const Icon = item.icon
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-4 px-3 py-4 group relative transition-all duration-300 sharp-edge",
                                    isActive ? "bg-neon-green/10 text-neon-green" : "text-slate-500 hover:bg-white/5 hover:text-white"
                                )}
                            >
                                <div className="min-w-[20px] flex justify-center">
                                    <Icon className={cn(
                                        "h-5 w-5 transition-transform duration-500 group-hover:scale-110",
                                        isActive && "neon-glow"
                                    )} />
                                </div>
                                <span className={cn(
                                    "text-xs font-black uppercase tracking-[0.2em] transition-all duration-300 whitespace-nowrap",
                                    isExpanded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
                                )}>
                                    {item.title}
                                </span>
                                {isActive && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-neon-green shadow-[0_0_15px_rgba(57,255,20,0.5)]" />
                                )}
                            </Link>
                        )
                    })}

                    {/* Admin Section */}
                    {userRole === "admin" && (
                        <Link
                            href="/admin"
                            className={cn(
                                "flex items-center gap-4 px-3 py-4 group relative transition-all duration-300 sharp-edge",
                                pathname.startsWith("/admin") ? "bg-neon-green/10 text-neon-green" : "text-slate-500 hover:bg-white/5 hover:text-white"
                            )}
                        >
                            <div className="min-w-[20px] flex justify-center">
                                <ShieldAlert className={cn(
                                    "h-5 w-5 transition-transform duration-500 group-hover:scale-110",
                                    pathname.startsWith("/admin") && "neon-glow text-neon-green"
                                )} />
                            </div>
                            <span className={cn(
                                "text-xs font-black uppercase tracking-[0.2em] transition-all duration-300 whitespace-nowrap",
                                isExpanded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
                            )}>
                                Admin Panel
                            </span>
                            {pathname.startsWith("/admin") && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-neon-green shadow-[0_0_15px_rgba(57,255,20,0.5)]" />
                            )}
                        </Link>
                    )}
                    
                    {/* Active Workspace Context */}
                    {pathname.startsWith("/workspace/") && (
                         <div
                            className="flex items-center gap-4 px-3 py-4 group relative transition-all duration-300 sharp-edge bg-neon-green/5 text-neon-green border-y border-neon-green/10 my-4"
                        >
                            <div className="min-w-[20px] flex justify-center">
                                <Kanban className="h-5 w-5 animate-pulse" />
                            </div>
                            <span className={cn(
                                "text-xs font-black uppercase tracking-[0.2em] transition-all duration-300",
                                isExpanded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
                            )}>
                                Workspace Ativo
                            </span>
                         </div>
                    )}
                </nav>

                {/* Footer Actions */}
                <div className="px-3 pt-6 border-t border-white/5 space-y-2">
                    <button 
                        onClick={() => signOut()}
                        className="flex items-center gap-4 px-3 py-4 w-full text-slate-500 hover:text-signal-orange transition-all group sharp-edge hover:bg-signal-orange/5"
                    >
                        <div className="min-w-[20px] flex justify-center">
                            <LogOut className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
                        </div>
                        <span className={cn(
                            "text-xs font-black uppercase tracking-[0.2em] transition-all duration-300",
                            isExpanded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
                        )}>
                            Encerrar Sessão
                        </span>
                    </button>
                    
                    <div className="flex items-center gap-4 px-3 py-6">
                         <div className={cn(
                            "transition-all duration-500 flex flex-col gap-1",
                            isExpanded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
                        )}>
                            <span className="text-[8px] text-slate-700 font-black uppercase tracking-[0.3em]">System Engine</span>
                            <span className="text-[10px] text-neon-green font-black uppercase tracking-[0.2em] neon-glow">v2.1.3-RADICAL</span>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    )
}
