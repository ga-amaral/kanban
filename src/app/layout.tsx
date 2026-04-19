import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { SidebarNav } from "@/components/sidebar-nav";
import { CommandPalette } from "@/components/command-palette";
import { getCurrentUserRole } from "@/app/actions/auth";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
    title: "AutoKanban CRM | Gestão de Leads Premium",
    description: "Multi-workspace CRM com Kanban customizável, webhooks estilo n8n e automações poderosas. Desenvolvido por Gabriel Amaral.",
    keywords: ["CRM", "Kanban", "n8n", "Automação", "Vibe Coding", "Next.js", "Supabase"],
    authors: [{ name: "Gabriel Amaral", url: "https://instagram.com/sougabrielamaral" }],
    icons: {
        icon: "/favicon.png",
        apple: "/favicon.png",
    },
};

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const role = await getCurrentUserRole();

    return (
        <html lang="pt-BR" suppressHydrationWarning>
            <body className={`${inter.variable} ${outfit.variable} font-sans antialiased`}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="dark"
                    enableSystem
                    disableTransitionOnChange
                >
                    <div className="flex min-h-screen bg-black text-white selection:bg-neon-green/30 selection:text-neon-green">
                        <SidebarNav userRole={role} />
                        <CommandPalette />
                        <main className="flex-1 md:ml-16 relative overflow-hidden min-w-0">
                            {/* Global background effects */}
                            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-neon-green/5 blur-[120px] rounded-full" />
                                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-indigo-500/5 blur-[120px] rounded-full" />
                            </div>
                            
                            <div className="relative z-10 w-full">
                                {children}
                            </div>
                        </main>
                    </div>
                    
                    <footer className="fixed bottom-6 right-8 pointer-events-none z-[100] group/footer">
                        <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md border border-white/5 py-2 px-4 sharp-edge pointer-events-auto hover:border-neon-green/30 transition-all">
                            <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
                            <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em]">
                                Licensed to <a href="https://instagram.com/sougabrielamaral" target="_blank" rel="noopener noreferrer" className="text-white hover:text-neon-green transition-colors">Gabriel Amaral</a> • 2026
                            </p>
                        </div>
                    </footer>
                </ThemeProvider>
            </body>
        </html>
    );
}
