import { createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
    // Add 'await' here because createClient is now async
    const supabase = await createClient();
    
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        redirect('/login');
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white p-8">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-slate-400">Welcome, {user.email}</p>
        </div>
    );
}