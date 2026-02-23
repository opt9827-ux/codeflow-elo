import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    // Default to /dashboard if no 'next' param is provided
    const next = searchParams.get('next') ?? '/dashboard';

    if (code) {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                auth: {
                    persistSession: false,
                },
            }
        );
        
        // Exchange the temporary code for a real user session
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        
        if (!error) {
            // Build an absolute URL for the redirect
            const forwardTo = new URL(next, request.url);
            return NextResponse.redirect(forwardTo);
        }
    }

    // If something fails, send them back to login with a clear error message
    const errorUrl = new URL('/login?error=auth_failed', request.url);
    return NextResponse.redirect(errorUrl);
}