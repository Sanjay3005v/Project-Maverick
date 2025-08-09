
'use server';
/**
 * @fileOverview An AI-powered coding challenge importer that creates a challenge from a given URL.
 *
 * - generateChallengeFromUrl - A function that generates a coding challenge by extracting it from a URL.
 * - GenerateChallengeFromUrlInput - The input type for the function.
 * - GenerateChallengeOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import { GenerateChallengeFromUrlInputSchema, GenerateChallengeOutputSchema, type GenerateChallengeFromUrlInput, type GenerateChallengeOutput } from '@/services/challenge-service';

export async function generateChallengeFromUrl(input: GenerateChallengeFromUrlInput): Promise<GenerateChallengeOutput> {
  return generateChallengeFromUrlFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateChallengeFromUrlPrompt',
  input: {schema: GenerateChallengeFromUrlInputSchema},
  output: {schema: GenerateChallengeOutputSchema},
  prompt: `You are an expert computer science educator. Your task is to extract challenge details from the content of the provided URL to create a coding challenge.

**URL:** {{url}}

**Instructions:**
1.  **Title:** Extract the main title of the problem.
2.  **Description:** Summarize the problem statement clearly and concisely.
3.  **Difficulty:** Assess the difficulty (Easy, Medium, Hard) based on the problem's complexity.
4.  **Tags:** Identify 2-3 relevant technical tags (e.g., 'Arrays', 'Sorting', 'Dynamic Programming').
5.  **Test Cases:** Define a list of specific requirements or example inputs/outputs that a correct solution must pass. These should be phrased as clear, verifiable statements.
`,
});

const generateChallengeFromUrlFlow = ai.defineFlow(
  {
    name: 'generateChallengeFromUrlFlow',
    inputSchema: GenerateChallengeFromUrlInputSchema,
    outputSchema: GenerateChallengeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
