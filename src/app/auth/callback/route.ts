import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
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
        
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        
        if (!error) {
            // Using a full URL for the redirect is safer in production
            return NextResponse.redirect(`${origin}${next}`);
        }
    }

    // If there is an error, send them back to login with a message
    return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}