
import { z } from 'zod';

export const TaskSchema = z.object({
  description: z.string().describe("The description of the task."),
  type: z.enum(['basic', 'link', 'quiz', 'challenge']).default('basic').describe("The type of task."),
  id: z.string().optional().describe("The ID of the quiz or challenge, if applicable."),
  status: z.enum(['Pending', 'Completed']).default('Pending').describe("The completion status of the task."),
  submittedLink: z.string().optional().describe("The URL submitted by the trainee for a link task."),
});
export type Task = z.infer<typeof TaskSchema>;


export const OnboardingPlanItemSchema = z.object({
  week: z.string().describe('The week number or range (e.g., "Week 1", "Week 2").'),
  topic: z.string().describe('The main topic or module for that period.'),
  tasks: z.array(TaskSchema).describe('A list of specific, actionable tasks or assignments for the week. These should be phrased as clear actions.'),
  status: z.string().describe('The current status for this item, which should be "Not Started" by default.'),
});
export type OnboardingPlanItem = z.infer<typeof OnboardingPlanItemSchema>;


export const PersonalizedOnboardingPlanSchema = z.object({
  personalizedPlan: z.array(OnboardingPlanItemSchema).describe('The personalized learning plan structured as a list of weekly items.'),
});
export type PersonalizedOnboardingPlan = z.infer<typeof PersonalizedOnboardingPlanSchema>;
