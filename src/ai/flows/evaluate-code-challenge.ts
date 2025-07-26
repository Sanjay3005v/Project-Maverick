'use server';

/**
 * @fileOverview An AI-powered code challenge evaluator.
 *
 * - evaluateCodeChallenge - A function that evaluates a user's code submission for a given challenge.
 * - EvaluateCodeChallengeInput - The input type for the evaluateCodeChallenge function.
 * - EvaluateCodeChallengeOutput - The return type for the evaluateCodeChallenge function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EvaluateCodeChallengeInputSchema = z.object({
  language: z.string().describe('The programming language the code is written in.'),
  problem: z.string().describe('The problem statement or description of the coding challenge.'),
  code: z.string().describe("The user's submitted code solution."),
});
export type EvaluateCodeChallengeInput = z.infer<typeof EvaluateCodeChallengeInputSchema>;

const EvaluateCodeChallengeOutputSchema = z.object({
  status: z.enum(['Passed', 'Failed']).describe("The evaluation result: 'Passed' if the code is correct, 'Failed' otherwise."),
  feedback: z.string().describe("A brief explanation of why the code passed or failed. Provide a hint if it failed."),
});
export type EvaluateCodeChallengeOutput = z.infer<typeof EvaluateCodeChallengeOutputSchema>;

export async function evaluateCodeChallenge(
  input: EvaluateCodeChallengeInput
): Promise<EvaluateCodeChallengeOutput> {
  return evaluateCodeChallengeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'evaluateCodeChallengePrompt',
  input: {schema: EvaluateCodeChallengeInputSchema},
  output: {schema: EvaluateCodeChallengeOutputSchema},
  prompt: `You are a code evaluator. A user has submitted a solution for a coding challenge.
  Your task is to determine if the code correctly solves the problem. Do not just check for syntax, but for logical correctness.

  - Programming Language: {{{language}}}
  - Problem: {{{problem}}}
  - User's Code:
  \`\`\`
  {{{code}}}
  \`\`\`

  Evaluate the code. If it correctly solves the problem, set the status to "Passed" and provide brief positive feedback.
  If the code is incorrect, incomplete, or has logical errors, set the status to "Failed" and provide a concise, helpful hint for the user to improve their solution. Do not give away the full answer.
  `,
});

const evaluateCodeChallengeFlow = ai.defineFlow(
  {
    name: 'evaluateCodeChallengeFlow',
    inputSchema: EvaluateCodeChallengeInputSchema,
    outputSchema: EvaluateCodeChallengeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
