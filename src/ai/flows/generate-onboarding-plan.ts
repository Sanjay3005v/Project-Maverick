
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
  learningGoal: z.string().describe('The learning goal of the trainee, including topic and desired timeframe (e.g., "I want to learn the basics of Python in 2 weeks").'),
});
export type GeneratePersonalizedOnboardingPlanInput = z.infer<
  typeof GeneratePersonalizedOnboardingPlanInputSchema
>;

const OnboardingPlanItemSchema = z.object({
  week: z.string().describe('The week number or range (e.g., "Week 1", "Week 2").'),
  topic: z.string().describe('The main topic or module for that period.'),
  tasks: z.array(z.string()).describe('A list of specific, actionable tasks or assignments for the week.'),
  status: z.string().describe('The current status for this item, which should be "Not Started" by default.'),
});

const GeneratePersonalizedOnboardingPlanOutputSchema = z.object({
  personalizedPlan: z.array(OnboardingPlanItemSchema).describe('The personalized learning plan structured as a list of weekly items.'),
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
  prompt: `You are an expert AI mentor. A trainee has provided a learning goal. Your task is to create a structured, actionable, and personalized learning plan based on their request.

Learning Goal:
"{{learningGoal}}"

Based on this goal, create a detailed learning plan. Break it down into weekly items. For each week, define a clear topic and a set of specific, actionable tasks as an array of strings. These tasks should be phrased as assignments. Assume the trainee is a beginner unless otherwise specified. Set the initial status of all items to "Not Started". The output must be an array of plan items.

For example, if the goal is "learn basics of python in two weeks", you should generate a two-week plan with relevant topics and tasks for each week. A task for week 1 might be "Write a Python script that prints 'Hello, World!' and calculates the sum of two numbers."
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
