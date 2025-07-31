
'use server';
/**
 * @fileOverview An AI-powered coding challenge generator.
 *
 * - generateChallenge - A function that generates a coding challenge on a given topic.
 * - GenerateChallengeInput - The input type for the generateChallenge function.
 * - GenerateChallengeOutput - The return type for the generateChallenge function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { ChallengeSchema } from '@/services/challenge-service';

export const GenerateChallengeInputSchema = z.object({
  topic: z.string().describe('The topic for which to generate the challenge (e.g., "Python dictionaries", "React hooks").'),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']).describe('The desired difficulty level for the challenge.'),
});
export type GenerateChallengeInput = z.infer<typeof GenerateChallengeInputSchema>;

export const GenerateChallengeOutputSchema = ChallengeSchema.omit({ id: true });
export type GenerateChallengeOutput = z.infer<typeof GenerateChallengeOutputSchema>;

export async function generateChallenge(input: GenerateChallengeInput): Promise<GenerateChallengeOutput> {
  return generateChallengeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateChallengePrompt',
  input: {schema: GenerateChallengeInputSchema},
  output: {schema: GenerateChallengeOutputSchema},
  prompt: `You are an expert computer science educator. Your task is to create a high-quality coding challenge based on a given topic and difficulty.

**Topic:** "{{topic}}"
**Difficulty:** {{difficulty}}

Generate a complete coding challenge with the following components:
1.  **Title:** A concise, descriptive title for the challenge.
2.  **Description:** A clear and detailed problem statement. Explain what the user needs to build or solve.
3.  **Difficulty:** The specified difficulty level.
4.  **Tags:** A list of 2-3 relevant tags or keywords (e.g., 'JavaScript', 'Arrays', 'Algorithms').
5.  **Test Cases:** A list of specific requirements or example inputs/outputs that a correct solution must pass. These should be phrased as clear, verifiable statements.

The generated challenge should be appropriate for a corporate trainee.
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
