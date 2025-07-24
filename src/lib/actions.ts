'use server';

import { generatePersonalizedOnboardingPlan, type GeneratePersonalizedOnboardingPlanInput, type GeneratePersonalizedOnboardingPlanOutput } from '@/ai/flows/generate-onboarding-plan';
import { z } from 'zod';

const formSchema = z.object({
  fresherProfile: z.string().min(50, "Please provide a detailed fresher profile of at least 50 characters."),
  trainingSchedule: z.string().min(50, "Please provide a detailed training schedule of at least 50 characters."),
});

type State = {
  success: boolean;
  message: string;
  data?: GeneratePersonalizedOnboardingPlanOutput;
}

export async function createOnboardingPlan(
  prevState: State | undefined,
  formData: FormData
): Promise<State> {
  const validatedFields = formSchema.safeParse({
    fresherProfile: formData.get('fresherProfile'),
    trainingSchedule: formData.get('trainingSchedule'),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Invalid form data. Please check your inputs.",
      data: undefined
    };
  }

  try {
    const result = await generatePersonalizedOnboardingPlan(validatedFields.data);
    return { 
      success: true, 
      message: 'Successfully generated plan.',
      data: result 
    };
  } catch (error) {
    console.error('Error generating onboarding plan:', error);
    return {
       success: false,
       message: 'An unexpected error occurred. Please try again later.',
       data: undefined
    };
  }
}
