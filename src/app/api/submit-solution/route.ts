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
        const { userId, problemId, code, language, topicId } = await req.json();

        if (!userId || !problemId || !code) {
            return NextResponse.json({ error: 'Missing required data' }, { status: 400 });
        }

        // 1. EVALUATION (Simulated Driver-Code Wrapper)
        // In a real sandbox:
        // const driverCode = `
        //   ${code}
        //   const testCases = ${JSON.stringify(hiddenTestCases)};
        //   const results = testCases.map(tc => solve(...tc.args) === tc.expected);
        //   return results.every(r => r === true);
        // `;

        // Simulation logic: 
        // We'll check if the code contains the word 'return' and the function name 'solve' (or the class Solution for other languages)
        const hasSolve = code.toLowerCase().includes('solve') || code.toLowerCase().includes('solution');
        const hasReturn = code.toLowerCase().includes('return');

        // For the sake of this DSA Overhaul, let's say it passes if it has the core logic
        const isCorrect = hasSolve && hasReturn && code.length > 60;
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
