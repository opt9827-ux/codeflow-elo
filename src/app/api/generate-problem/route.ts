import { aiModel } from '@/lib/ai';
import { streamObject } from 'ai';
import { NextRequest } from 'next/server';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const { subTopicName, userELO } = await req.json();

        if (!subTopicName || typeof userELO !== 'number') {
            return new Response(
                JSON.stringify({ error: 'subTopicName and userELO are required' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const targetDifficultyELO = userELO + 50;

        const prompt = `You are an expert DSA platform problem setter. The user currently has an ELO rating of ${userELO}.
I need you to generate a novel Data Structures and Algorithms problem specifically tailored to the sub-topic: "${subTopicName}".

REQUIREMENTS:
1. Target Difficulty: Precisely at an ELO of ${targetDifficultyELO}. ELO 800 is a very easy beginner problem. ELO 1200 is Leetcode Medium. ELO >1800 is Hard.
2. Provide a title, clear markdown description, and constraints.
3. Provide 3 sample Input/Output pairs with explanations.
4. Generate 10 hidden test cases for backend validation of their eventual code submission.
5. Provide default boilerplates for Java, Python, and C++.
6. The output must strictly adhere to the expected schema.
`;

        const result = await streamObject({
            model: aiModel,
            schema: z.object({
                title: z.string().describe("Problem Title."),
                markdown_description: z.string().describe("Detailed markdown description of the problem."),
                constraints: z.string().describe("Markdown unordered list of strict constraints."),
                difficulty_elo: z.number().default(targetDifficultyELO),
                sample_io: z.array(
                    z.object({
                        input: z.string(),
                        output: z.string(),
                        explanation: z.string()
                    })
                ).length(3),
                boilerplates: z.object({
                    java: z.string().describe("Java boilerplate: class Solution { public ... }"),
                    python: z.string().describe("Python boilerplate: class Solution: def solve..."),
                    cpp: z.string().describe("C++ boilerplate: class Solution { public: ... };")
                }),
                hidden_test_cases: z.array(
                    z.object({
                        input: z.string(),
                        output: z.string()
                    })
                ).length(10)
            }),
            prompt,
        });

        return result.toTextStreamResponse();
    } catch (error: any) {
        console.error('Problem Generation Error:', error);
        return new Response(
            JSON.stringify({ error: 'Failed to generate problem', details: error.message }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
