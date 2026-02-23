import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    const next = requestUrl.searchParams.get('next') ?? '/dashboard';

    if (code) {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        
        if (!error) {
            return NextResponse.redirect(new URL(next, request.url));
        }
    }

    // Fallback: If no code is present, or exchange failed, 
    // redirect to dashboard anyway so the client-side 
    // detectSessionInUrl can try to parse the hash fragment.
    return NextResponse.redirect(new URL('/dashboard', request.url));
}