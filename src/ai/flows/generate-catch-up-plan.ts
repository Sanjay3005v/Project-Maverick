
'use server';

/**
 * @fileOverview A personalized catch-up plan generator for at-risk trainees.
 *
 * - generateCatchUpPlan - A function that generates a one-week intervention plan.
 * - GenerateCatchUpPlanInput - The input type for the function.
 * - GenerateCatchUpPlanOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { OnboardingPlanItemSchema } from './generate-onboarding-plan';
import type { OnboardingPlanItem } from './generate-onboarding-plan';


const GenerateCatchUpPlanInputSchema = z.object({
  name: z.string().describe("The trainee's name."),
  progress: z.number().describe("The trainee's current overall progress percentage."),
  department: z.string().describe("The trainee's department."),
  currentPlan: z.array(OnboardingPlanItemSchema).describe('The full existing onboarding plan for the trainee.'),
});
export type GenerateCatchUpPlanInput = z.infer<typeof GenerateCatchUpPlanInputSchema>;

export type GenerateCatchUpPlanOutput = OnboardingPlanItem;


export async function generateCatchUpPlan(
  input: GenerateCatchUpPlanInput
): Promise<GenerateCatchUpPlanOutput> {
  return generateCatchUpPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCatchUpPlanPrompt',
  input: {schema: GenerateCatchUpPlanInputSchema},
  output: {schema: OnboardingPlanItemSchema },
  prompt: `You are an expert AI mentor and corporate trainer. A trainee named {{name}} in the {{department}} department is falling behind with only {{progress}}% progress. 

Their current learning plan is:
{{#each currentPlan}}
- **{{week}} ({{topic}}):** Tasks: {{#each tasks}}{{{this}}}{{/each}}
{{/each}}

Analyze their progress and create a single, one-week "Catch-Up Plan". This plan should be encouraging and contain 2-3 specific, actionable tasks to help them build momentum and get back on track. The topic should be foundational and relevant to their current progress level. Phrase the tasks as clear actions. The 'week' should be labeled "Week 1 (Catch-Up)". Set the status to "Not Started".
`,
});

const generateCatchUpPlanFlow = ai.defineFlow(
  {
    name: 'generateCatchUpPlanFlow',
    inputSchema: GenerateCatchUpPlanInputSchema,
    outputSchema: OnboardingPlanItemSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
