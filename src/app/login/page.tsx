"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Github, Mail } from 'lucide-react';

export default function LoginPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.MouseEvent, provider: 'google' | 'github') => {
        // 1. Prevent the default '#' behavior
        e.preventDefault();
        e.stopPropagation();
        
        setLoading(true);
        setError(null);
        
        try {
            // 2. Log to your browser console to see if it's hitting this line
            console.log("Starting login for:", provider);
            
            const { error } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    // 3. Use a hardcoded string just to test if origin is the issue
                    redirectTo: `https://codeflow-elo.vercel.app/auth/callback`,
                },
            });
            
            if (error) throw error;
        } catch (err: any) {
            console.error("Login Error:", err);
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] bg-slate-950 text-white p-4">
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">
                        Welcome to CodeFlow-ELO
                    </h1>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg mb-6 text-sm">
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    <button
                        type="button" // 4. Explicit type="button" prevents form submission
                        onClick={(e) => handleLogin(e, 'github')}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold py-3 px-4 rounded-xl transition-all border border-slate-700 disabled:opacity-50"
                    >
                        <Github className="w-5 h-5" />
                        Continue with GitHub
                    </button>

                    <button
                        type="button"
                        onClick={(e) => handleLogin(e, 'google')}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-100 text-slate-900 font-semibold py-3 px-4 rounded-xl transition-all border border-white disabled:opacity-50"
                    >
                        <Mail className="w-5 h-5 fill-slate-900" />
                        Continue with Google
                    </button>
                </div>
            </div>
        </div>
    );
}