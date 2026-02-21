import { google } from '@ai-sdk/google';
import { generateObject, generateText } from 'ai';

export const aiModel = google('gemini-1.5-flash');

export { generateObject, generateText };
