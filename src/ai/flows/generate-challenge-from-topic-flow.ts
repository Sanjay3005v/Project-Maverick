
'use server';
/**
 * @fileOverview An AI-powered coding challenge generator that creates a challenge from a given topic.
 *
 * - generateChallengeFromTopic - A function that generates a coding challenge on a given topic.
 * - GenerateChallengeFromTopicInput - The input type for the function.
 * - GenerateChallengeOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import { GenerateChallengeFromTopicInputSchema, GenerateChallengeOutputSchema, type GenerateChallengeFromTopicInput, type GenerateChallengeOutput } from '@/services/challenge-service';

export async function generateChallengeFromTopic(input: GenerateChallengeFromTopicInput): Promise<GenerateChallengeOutput> {
  return generateChallengeFromTopicFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateChallengeFromTopicPrompt',
  input: {schema: GenerateChallengeFromTopicInputSchema},
  output: {schema: GenerateChallengeOutputSchema},
  prompt: `You are an expert computer science educator. Your task is to create a new, high-quality coding challenge from scratch based on the provided topic and difficulty level.

**Topic:** "{{topic}}"
**Difficulty:** {{difficulty}}

**Instructions:**
1.  **Title:** Create a concise, descriptive title for the challenge.
2.  **Description:** Write a clear and detailed problem statement. Explain what the user needs to build or solve.
3.  **Difficulty:** Use the specified difficulty level.
4.  **Tags:** Generate a list of 2-3 relevant tags or keywords (e.g., 'JavaScript', 'Algorithms').
5.  **Test Cases:** Create a list of specific requirements or example inputs/outputs that a correct solution must pass. These should be phrased as clear, verifiable statements.
`,
});

const generateChallengeFromTopicFlow = ai.defineFlow(
  {
    name: 'generateChallengeFromTopicFlow',
    inputSchema: GenerateChallengeFromTopicInputSchema,
    outputSchema: GenerateChallengeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
