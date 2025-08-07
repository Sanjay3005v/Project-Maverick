
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
import { OnboardingPlanItem, PersonalizedOnboardingPlanSchema } from '@/lib/plan-schema';
import type { PersonalizedOnboardingPlan } from '@/lib/plan-schema';


const GeneratePersonalizedOnboardingPlanInputSchema = z.object({
  learningGoal: z.string().describe('The learning goal of the trainee, including topic and desired timeframe (e.g., "I want to learn the basics of Python in 2 weeks").'),
  fresherProfile: z.string().describe("A description of the trainee's skills and learning preferences."),
  trainingSchedule: z.string().describe("The company's overall training schedule or available modules."),
});
export type GeneratePersonalizedOnboardingPlanInput = z.infer<
  typeof GeneratePersonalizedOnboardingPlanInputSchema
>;

export type GeneratePersonalizedOnboardingPlanOutput = PersonalizedOnboardingPlan;

export async function generatePersonalizedOnboardingPlan(
  input: GeneratePersonalizedOnboardingPlanInput
): Promise<GeneratePersonalizedOnboardingPlanOutput> {
  return generatePersonalizedOnboardingPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePersonalizedOnboardingPlanPrompt',
  input: {schema: GeneratePersonalizedOnboardingPlanInputSchema},
  output: {schema: PersonalizedOnboardingPlanSchema},
  prompt: `You are an expert AI mentor. A trainee has provided a learning goal, their profile, and a general training schedule. Your task is to create a structured, actionable, and personalized learning plan.

**Fresher Profile:**
"{{fresherProfile}}"

**Available Training Schedule:**
"{{trainingSchedule}}"

**Trainee's Stated Learning Goal:**
"{{learningGoal}}"

Based on all this information, create a detailed learning plan. Break it down into weekly items. For each week, define a clear topic and a set of specific, actionable tasks as an array of strings. These tasks should be phrased as assignments suitable for a task list. Assume the trainee is a beginner unless their profile specifies otherwise. Set the initial status of all items to "Not Started". The output must be an array of plan items.

For example, if the goal is "learn basics of python in two weeks", you should generate a two-week plan with relevant topics and tasks for each week. A task for week 1 might be "Complete the 'Data Types' module and submit the associated quiz." or "Write a Python script that prints 'Hello, World!' and calculates the sum of two numbers."
`,
});

const generatePersonalizedOnboardingPlanFlow = ai.defineFlow(
  {
    name: 'generatePersonalizedOnboardingPlanFlow',
    inputSchema: GeneratePersonalizedOnboardingPlanInputSchema,
    outputSchema: PersonalizedOnboardingPlanSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
