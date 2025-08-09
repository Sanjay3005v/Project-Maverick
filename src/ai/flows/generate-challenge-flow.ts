
'use server';
/**
 * @fileOverview An AI-powered coding challenge generator.
 *
 * - generateChallenge - A function that generates a coding challenge on a given topic or from a URL.
 * - GenerateChallengeInput - The input type for the generateChallenge function.
 * - GenerateChallengeOutput - The return type for the generateChallenge function.
 */

import {ai} from '@/ai/genkit';
import { GenerateChallengeInputSchema, GenerateChallengeOutputSchema, type GenerateChallengeInput, type GenerateChallengeOutput } from '@/services/challenge-service';

export async function generateChallenge(input: GenerateChallengeInput): Promise<GenerateChallengeOutput> {
  return generateChallengeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateChallengePrompt',
  input: {schema: GenerateChallengeInputSchema},
  output: {schema: GenerateChallengeOutputSchema},
  prompt: `You are an expert computer science educator. Your task is to create a high-quality coding challenge appropriate for a corporate trainee.

{{#if url}}
**Task: Extract Challenge from URL**

You have been given a URL. Your job is to visit this URL, analyze its content, and extract the details to create a coding challenge.

**URL:** {{url}}

**Instructions:**
1.  **Title:** Extract the main title of the problem.
2.  **Description:** Summarize the problem statement clearly and concisely.
3.  **Difficulty:** Assess the difficulty (Easy, Medium, Hard) based on the problem's complexity.
4.  **Tags:** Identify 2-3 relevant technical tags (e.g., 'Arrays', 'Sorting', 'Dynamic Programming').
5.  **Test Cases:** Define a list of specific requirements or example inputs/outputs that a correct solution must pass. These should be phrased as clear, verifiable statements.
{{else}}
**Task: Generate Challenge from Topic**

You have been given a topic and a difficulty level. Your job is to create a new coding challenge from scratch based on this information.

**Topic:** "{{topic}}"
**Difficulty:** {{difficulty}}

**Instructions:**
1.  **Title:** Create a concise, descriptive title for the challenge.
2.  **Description:** Write a clear and detailed problem statement. Explain what the user needs to build or solve.
3.  **Difficulty:** Use the specified difficulty level.
4.  **Tags:** Generate a list of 2-3 relevant tags or keywords (e.g., 'JavaScript', 'Algorithms').
5.  **Test Cases:** Create a list of specific requirements or example inputs/outputs that a correct solution must pass. These should be phrased as clear, verifiable statements.
{{/if}}
`,
});

const generateChallengeFlow = ai.defineFlow(
  {
    name: 'generateChallengeFlow',
    inputSchema: GenerateChallengeInputSchema,
    outputSchema: GenerateChallengeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);


