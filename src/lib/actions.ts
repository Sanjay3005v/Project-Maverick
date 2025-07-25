'use server';

import { generatePersonalizedOnboardingPlan, type GeneratePersonalizedOnboardingPlanOutput, type OnboardingPlanItem } from '@/ai/flows/generate-onboarding-plan';
import { generateTraineeReport, type GenerateTraineeReportInput, type GenerateTraineeReportOutput } from '@/ai/flows/generate-trainee-report';
import { z } from 'zod';

const formSchema = z.object({
  fresherProfile: z.string().min(50, "Please provide a detailed fresher profile of at least 50 characters."),
  trainingSchedule: z.string().min(50, "Please provide a detailed training schedule of at least 50 characters."),
});

type OnboardingPlanState = {
  success: boolean;
  message: string;
  data?: GeneratePersonalizedOnboardingPlanOutput;
}

export async function createOnboardingPlan(
  prevState: OnboardingPlanState | undefined,
  formData: FormData
): Promise<OnboardingPlanState> {
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

type ReportState = {
  success: boolean;
  message: string;
  data?: GenerateTraineeReportOutput;
}

export async function createTraineeReport(
  trainees: GenerateTraineeReportInput['trainees']
): Promise<ReportState> {
  try {
    const result = await generateTraineeReport({ trainees });
    return {
      success: true,
      message: 'Successfully generated report.',
      data: result
    };
  } catch (error) {
    console.error('Error generating trainee report:', error);
    return {
      success: false,
      message: 'An unexpected error occurred while generating the report.',
      data: undefined
    };
  }
}
