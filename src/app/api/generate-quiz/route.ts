import { aiModel, generateObject } from '@/lib/ai';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { subTopicName } = body;

        if (!subTopicName) {
            return NextResponse.json(
                { error: 'subTopicName is required' },
                { status: 400 }
            );
        }

        const prompt = `You are a Senior DSA Instructor. Generate a prerequisite learning packet for the Data Structures & Algorithms topic: "${subTopicName}".

REQUIREMENTS:
1. Provide a concise, high-yield 'Cheat Sheet' in markdown format. It should contain core concepts, common patterns, and key formulas or boilerplate code.
2. Provide a 5-question multiple choice quiz to test the user's understanding of this exact sub-topic.
   - The questions should scale from easy to challenging.
   - Each question must have 4 options and exactly one correct answer (the index of the correct option 0-3).
`;

        const { object } = await generateObject({
            model: aiModel,
            schema: z.object({
                cheat_sheet: z.string().describe("Markdown formatted cheat sheet for the topic."),
                questions: z.array(
                    z.object({
                        question: z.string().describe("The quiz question text."),
                        options: z.array(z.string()).describe("4 possible answers."),
                        correctOptionIndex: z.number().describe("The index (0-3) of the correct answer in the options array."),
                        explanation: z.string().describe("Explanation for why the correct answer is right.")
                    })
                ).length(5)
            }),
            prompt,
        });

        return NextResponse.json(object);
    } catch (error: any) {
        console.error('Quiz Generation Error:', error);
        return NextResponse.json(
            { error: 'Failed to generate quiz', details: error.message },
            { status: 500 }
        );
    }
}
