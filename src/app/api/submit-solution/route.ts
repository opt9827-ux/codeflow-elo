import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { calculateNewELO } from '@/utils/elo';

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
        const { data: profile, error: profileErr } = await supabase
            .from('profiles')
            .select('elo_rating')
            .eq('id', userId)
            .single();

        if (profileErr) throw new Error('User profile not found');

        // Fetch problem
        const { data: problem, error: problemErr } = await supabase
            .from('problems')
            .select('difficulty_elo')
            .eq('id', problemId)
            .single();

        if (problemErr) throw new Error('Problem not found');

        // 3. CALCULATE NEW ELO
        const { newUserELO, newProblemELO } = calculateNewELO(
            profile.elo_rating,
            problem.difficulty_elo,
            actualScore
        );

        // 4. UPDATE DB
        // Update User Profile
        const { error: updateUserErr } = await supabase
            .from('profiles')
            .update({ elo_rating: newUserELO })
            .eq('id', userId);

        if (updateUserErr) throw updateUserErr;

        // Update Problem Rating
        const { error: updatePropErr } = await supabase
            .from('problems')
            .update({ difficulty_elo: newProblemELO })
            .eq('id', problemId);

        if (updatePropErr) throw updatePropErr;

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
            eloChange: newUserELO - profile.elo_rating,
            problemELO: newProblemELO
        });

    } catch (error: any) {
        console.error('Submission Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
