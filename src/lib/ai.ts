import { google } from '@ai-sdk/google';
import { generateObject, generateText } from 'ai';

// Using the -latest suffix ensures you point to the most recent stable version
export const aiModel = google('gemini-1.5-flash-latest');

export { generateObject, generateText };
