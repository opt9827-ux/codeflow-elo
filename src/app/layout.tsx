import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';
import { Activity, Trophy, Code2 } from 'lucide-react';
import Link from 'next/link';

const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });

export const metadata: Metadata = {
    title: 'CodeFlow ELO | AI-Driven DSA Trainer',
    description: 'Master Data Structures & Algorithms with an adaptive ELO rating system and real-time AI guidance.',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${outfit.variable} font-sans min-h-screen flex flex-col antialiased relative`}>
                {/* Animated Background Orbs */}
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] mix-blend-screen -z-10 animate-pulse-slow"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px] mix-blend-screen -z-10 animate-pulse-slow" style={{ animationDelay: '2s' }}></div>

                {/* Navigation Bar */}
                <nav className="sticky top-0 z-50 w-full backdrop-blur-md bg-background/60 border-b border-slate-800">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            <Link href="/" className="flex items-center gap-2 group">
                                <div className="p-2 bg-gradient-to-tr from-primary to-blue-600 rounded-lg group-hover:scale-110 transition-transform">
                                    <Code2 className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-xl font-bold tracking-tight text-white group-hover:text-primary transition-colors">
                                    CodeFlow<span className="text-slate-400 font-light">ELO</span>
                                </span>
                            </Link>

                            <div className="flex items-center gap-6">
                                <Link href="/dashboard" className="text-sm font-medium text-slate-300 hover:text-white transition-colors flex items-center gap-2">
                                    <Trophy className="w-4 h-4 text-primary" /> Dashboard
                                </Link>
                                <div className="flex items-center gap-2 px-3 py-1.5 glass-panel rounded-full text-sm font-medium">
                                    <Activity className="w-4 h-4 text-green-400" /> ELO: 1200
                                </div>
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Main Content */}
                <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {children}
                </main>
            </body>
        </html>
    );
}
