
import { z } from 'zod';

export const OnboardingPlanItemSchema = z.object({
  week: z.string().describe('The week number or range (e.g., "Week 1", "Week 2").'),
  topic: z.string().describe('The main topic or module for that period.'),
  tasks: z.array(z.string()).describe('A list of specific, actionable tasks or assignments for the week. These should be phrased as clear actions.'),
  status: z.string().describe('The current status for this item, which should be "Not Started" by default.'),
});
export type OnboardingPlanItem = z.infer<typeof OnboardingPlanItemSchema>;


export const PersonalizedOnboardingPlanSchema = z.object({
  personalizedPlan: z.array(OnboardingPlanItemSchema).describe('The personalized learning plan structured as a list of weekly items.'),
});
export type PersonalizedOnboardingPlan = z.infer<typeof PersonalizedOnboardingPlanSchema>;
