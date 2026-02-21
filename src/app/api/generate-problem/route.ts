import { aiModel, generateObject } from '@/lib/ai';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const { subTopicName, userELO } = await req.json();

        if (!subTopicName || typeof userELO !== 'number') {
            return NextResponse.json(
                { error: 'subTopicName and userELO are required' },
                { status: 400 }
            );
        }

        // Generator difficulty must be exactly 50 ELO points above the user's current ELO.
        const targetDifficultyELO = userELO + 50;

        const prompt = `You are an expert DSA platform problem setter. The user currently has an ELO rating of ${userELO}.
I need you to generate a novel Data Structures and Algorithms problem specifically tailored to the sub-topic: "${subTopicName}".

REQUIREMENTS:
1. Target Difficulty: Precisely at an ELO of ${targetDifficultyELO}. ELO 800 is a very easy beginner problem. ELO 1200 is Leetcode Medium. ELO >1800 is Hard.
2. Provide a title, clear markdown description, and constraints.
3. Provide 3 sample Input/Output pairs with explanations.
4. Generate 10 hidden test cases for backend validation of their eventual code submission.
5. The output must strictly adhere to the expected schema.
`;

        const { object } = await generateObject({
            model: aiModel,
            schema: z.object({
                title: z.string().describe("Problem Title."),
                markdown_description: z.string().describe("Detailed markdown description of the problem, avoiding direct copy-pastes from public platforms."),
                constraints: z.string().describe("Markdown unordered list of strict constraints for the variables in the problem."),
                sample_io: z.array(
                    z.object({
                        input: z.string().describe("The stringified input to standard in or arguments. E.g. 'nums = [1, 2, 3]'"),
                        output: z.string().describe("The expected standard out string or return value. E.g. '6'"),
                        explanation: z.string().describe("Explanation of the test case.")
                    })
                ).length(3),
                hidden_test_cases: z.array(
                    z.object({
                        input: z.string(),
                        output: z.string()
                    })
                ).length(10).describe("Edge cases, max bounds, and general tests for the logic.")
            }),
            prompt,
        });

        return NextResponse.json({ ...object, difficulty_elo: targetDifficultyELO });
    } catch (error: any) {
        console.error('Problem Generation Error:', error);
        return NextResponse.json(
            { error: 'Failed to generate problem', details: error.message },
            { status: 500 }
        );
    }
}
