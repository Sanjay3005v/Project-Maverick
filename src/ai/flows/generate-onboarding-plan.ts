'use server';

/**
 * @fileOverview A personalized onboarding plan generator for freshers.
 *
 * - generatePersonalizedOnboardingPlan - A function that generates a personalized onboarding plan.
 * - GeneratePersonalizedOnboardingPlanInput - The input type for the generatePersonalizedOnboardingPlan function.
 * - GeneratePersonalizedOnboardingPlanOutput - The return type for the generatePersonalizedOnboardingPlan function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePersonalizedOnboardingPlanInputSchema = z.object({
  fresherProfile: z
    .string()
    .describe('The profile details of the fresher, including skills, learning preferences, and experience.'),
  trainingSchedule: z
    .string()
    .describe('The overall training schedule for the fresher program.'),
});
export type GeneratePersonalizedOnboardingPlanInput = z.infer<
  typeof GeneratePersonalizedOnboardingPlanInputSchema
>;

const GeneratePersonalizedOnboardingPlanOutputSchema = z.object({
  personalizedPlan: z
    .string()
    .describe('The personalized onboarding plan for the fresher.'),
});
export type GeneratePersonalizedOnboardingPlanOutput = z.infer<
  typeof GeneratePersonalizedOnboardingPlanOutputSchema
>;

export async function generatePersonalizedOnboardingPlan(
  input: GeneratePersonalizedOnboardingPlanInput
): Promise<GeneratePersonalizedOnboardingPlanOutput> {
  return generatePersonalizedOnboardingPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePersonalizedOnboardingPlanPrompt',
  input: {schema: GeneratePersonalizedOnboardingPlanInputSchema},
  output: {schema: GeneratePersonalizedOnboardingPlanOutputSchema},
  prompt: `You are an AI assistant designed to create personalized onboarding plans for freshers based on their profile details and the overall training schedule.

  Fresher Profile:
  {{fresherProfile}}

  Training Schedule:
  {{trainingSchedule}}

  Create a personalized onboarding plan that considers the fresher's skills, learning preferences, and experience, and aligns with the overall training schedule. The plan should focus on relevant learning modules and help the fresher quickly understand the training program.
  `,
});

const generatePersonalizedOnboardingPlanFlow = ai.defineFlow(
  {
    name: 'generatePersonalizedOnboardingPlanFlow',
    inputSchema: GeneratePersonalizedOnboardingPlanInputSchema,
    outputSchema: GeneratePersonalizedOnboardingPlanOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
