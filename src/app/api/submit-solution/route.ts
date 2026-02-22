import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

import { supabase } from '@/lib/supabase';
import { calculateNewELO } from '@/utils/elo';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isValidUUID = (id: string) => UUID_REGEX.test(id);

/**
 * API Route to handle problem submissions.
 * Logic:
 * 1. Verify the solution (Simulated/Mocked for MVP)
 * 2. Fetch User and Problem current ELO
 * 3. Calculate new ratings
 * 4. Update Supabase
 */
export async function POST(req: NextRequest) {
    try {
        const { userId, problemId, code, topicId } = await req.json();

        if (!userId || !problemId || !code) {
            return NextResponse.json({ error: 'Missing required data' }, { status: 400 });
        }

        // 1. MOCK EVALUATION 
        // In a real system, we'd run this in a sandbox. 
        // For this prototype, we'll assume the code is correct if it's longer than 20 chars.
        const isCorrect = code.length > 50;
        const actualScore = isCorrect ? 1 : 0;

        // 2. FETCH CURRENT RATINGS
        // Fetch user profile
        // Mapped to profile.elo_rating with null check and UUID validation
        let profile = null;
        if (isValidUUID(userId)) {
            const { data } = await (supabase
                .from('profiles')
                .select('elo_rating')
                .eq('id', userId)
                .single() as any);
            profile = data;
        }

        // Fetch problem
        let problem = null;
        if (isValidUUID(problemId)) {
            const { data } = await (supabase
                .from('problems')
                .select('difficulty_elo')
                .eq('id', problemId)
                .single() as any);
            problem = data;
        }

        // 3. CALCULATE NEW ELO
        const currentUserELO = profile?.elo_rating ?? 1200;
        const currentProblemELO = problem?.difficulty_elo ?? 1250;

        const { newUserELO, newProblemELO } = calculateNewELO(
            currentUserELO,
            currentProblemELO,
            actualScore
        );

        // 4. UPDATE DB (Only if IDs are valid)
        if (isValidUUID(userId)) {
            await supabase
                .from('profiles')
                .update({ elo_rating: newUserELO })
                .eq('id', userId);
        }

        if (isValidUUID(problemId)) {
            await supabase
                .from('problems')
                .update({ difficulty_elo: newProblemELO })
                .eq('id', problemId);
        }

        // Optionally log the attempt (reuse attempts table from schema)
        await supabase.from('attempts').insert({
            user_id: userId,
            node_id: topicId || 'general',
            code: code,
            score: actualScore,
            result: {
                passed: isCorrect,
                oldELO: profile.elo_rating,
                newELO: newUserELO,
                problemELO: newProblemELO
            }
        });

        return NextResponse.json({
            success: true,
            passed: isCorrect,
            newELO: newUserELO,
            eloChange: newUserELO - currentUserELO,
            problemELO: newProblemELO
        });

    } catch (error: any) {
        console.error('Submission Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
