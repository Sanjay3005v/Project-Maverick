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

const OnboardingPlanItemSchema = z.object({
  week: z.string().describe('The week number or range (e.g., "Week 1", "Weeks 2-3").'),
  topic: z.string().describe('The main topic or module for that period.'),
  tasks: z.string().describe('A summary of tasks, learning objectives, or activities for the week.'),
  status: z.string().describe('The current status for this item, which should be "Not Started" by default.'),
});

const GeneratePersonalizedOnboardingPlanOutputSchema = z.object({
  personalizedPlan: z.array(OnboardingPlanItemSchema).describe('The personalized onboarding plan structured as a list of weekly items.'),
});
export type GeneratePersonalizedOnboardingPlanOutput = z.infer<
  typeof GeneratePersonalizedOnboardingPlanOutputSchema
>;
export type OnboardingPlanItem = z.infer<typeof OnboardingPlanItemSchema>;


export async function generatePersonalizedOnboardingPlan(
  input: GeneratePersonalizedOnboardingPlanInput
): Promise<GeneratePersonalizedOnboardingPlanOutput> {
  return generatePersonalizedOnboardingPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePersonalizedOnboardingPlanPrompt',
  input: {schema: GeneratePersonalizedOnboardingPlanInputSchema},
  output: {schema: GeneratePersonalizedOnboardingPlanOutputSchema},
  prompt: `You are an AI assistant designed to create a structured, personalized onboarding plan in a table format for freshers based on their profile details and the overall training schedule.

  Fresher Profile:
  {{fresherProfile}}

  Training Schedule:
  {{trainingSchedule}}

  Create a personalized onboarding plan that considers the fresher's skills, learning preferences, and experience, and aligns with the overall training schedule. The plan should be broken down into weekly items. For each item, provide the week, topic, a summary of tasks, and set the initial status to "Not Started". The output must be an array of plan items.
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
