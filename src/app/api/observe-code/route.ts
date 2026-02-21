import { aiModel, generateObject } from '@/lib/ai';
import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const { userId, problemId, currentCode } = await req.json();

        if (!userId || !problemId || !currentCode) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Fetch user's prior mistakes for this specific problem (or globally for this user)
        const { data: mistakeHistory, error: dbError } = await supabase
            .from('user_mistake_history')
            .select('mistake_type, context, code')
            .eq('user_id', userId)
            .eq('problem_id', problemId)
            .order('created_at', { ascending: false })
            .limit(5);

        if (dbError) throw dbError;

        // AI identifies if the same mistake is being made
        const prompt = `You are a real-time AI coding observer. The user is writing code:
\`\`\`
${currentCode}
\`\`\`

Here is their recent mistake history for similar problems / attempts:
${JSON.stringify(mistakeHistory || [])}

Analyze their current code. Are they about to make (or currently making) a recurring logic error based on their history? Alternatively, are they stuck with an obvious syntax/logic issue (like off-by-one)?
If yes, provide a concise, helpful "Trainer Hint" to nudge them in the right direction without giving them the direct answer. If they are doing fine, do not generate a hint.`;

        const { object } = await generateObject({
            model: aiModel,
            schema: z.object({
                has_recurring_mistake: z.boolean().describe("True if a recurring or critical logic error is detected."),
                mistake_type: z.string().describe("Categorize the mistake briefly (e.g. 'off-by-one', 'infinite-loop', 'unhandled-edge-case'). Empty if none."),
                trainer_hint: z.string().describe("A helpful nudge. Empty if they are doing fine.")
            }),
            prompt,
        });

        return NextResponse.json(object);
    } catch (error: any) {
        console.error('Observer Error:', error);
        return NextResponse.json(
            { error: 'Failed to observe code', details: error.message },
            { status: 500 }
        );
    }
}
