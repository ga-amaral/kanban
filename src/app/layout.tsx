import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
    title: "AutoKanban CRM | Gestão de Leads Premium",
    description: "Multi-workspace CRM com Kanban customizável, webhooks estilo n8n e automações poderosas. Desenvolvido por Gabriel Amaral.",
    keywords: ["CRM", "Kanban", "n8n", "Automação", "Vibe Coding", "Next.js", "Supabase"],
    authors: [{ name: "Gabriel Amaral", url: "https://instagram.com/sougabrielamaral" }],
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="pt-BR" suppressHydrationWarning>
            <body className={`${inter.variable} ${outfit.variable} font-sans antialiased`}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="dark"
                    enableSystem
                    disableTransitionOnChange
                >
                    <main className="min-h-screen">
                        {children}
                    </main>
                    <footer className="fixed bottom-4 right-6 pointer-events-none opacity-40 hover:opacity-100 transition-opacity">
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest pointer-events-auto">
                            Desenvolvido por <a href="https://instagram.com/sougabrielamaral" target="_blank" rel="noopener noreferrer" className="text-white hover:text-indigo-400 underline underline-offset-4 decoration-slate-800">Gabriel Amaral</a> (2026)
                        </p>
                    </footer>
                </ThemeProvider>
            </body>
        </html>
    );
}
