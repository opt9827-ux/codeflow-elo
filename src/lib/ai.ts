import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateObject, generateText } from 'ai';

// This is the correct setup for Next.js 15 in 2026
const google = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export const aiModel = google('gemini-1.5-flash-8b');
export { generateObject, generateText };