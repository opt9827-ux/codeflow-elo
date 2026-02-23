import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    // Change this to whatever page you want them to see first
    const next = searchParams.get('next') ?? '/dashboard';

    if (code) {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                auth: {
                    persistSession: true,
                    detectSessionInUrl: true,
                    flowType: 'pkce',
                },
            }
        );
        
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        
        if (!error) {
            // This ensures we redirect back to the same domain (production or local)
            const forwardTo = new URL(next, request.url);
            return NextResponse.redirect(forwardTo);
        }
    }

    // Redirect to login with a clean error message if it fails
    const loginUrl = new URL('/login?error=auth_failed', request.url);
    return NextResponse.redirect(loginUrl);
}