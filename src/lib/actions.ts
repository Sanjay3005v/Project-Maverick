
'use server';

import { generatePersonalizedOnboardingPlan, type GeneratePersonalizedOnboardingPlanOutput, type OnboardingPlanItem } from '@/ai/flows/generate-onboarding-plan';
import { generateTraineeReport, type GenerateTraineeReportInput, type GenerateTraineeReportOutput } from '@/ai/flows/generate-trainee-report';
import { saveOnboardingPlan as savePlan } from '@/services/trainee-service';
import { z } from 'zod';

const adminFormSchema = z.object({
  fresherProfile: z.string().min(10, 'Please provide a profile of at least 10 characters.'),
  learningGoal: z.string().min(10, "Please provide a learning goal of at least 10 characters."),
  trainingSchedule: z.string().min(10, "Please provide a schedule of at least 10 characters."),
});

type OnboardingPlanState = {
  success: boolean;
  message: string;
  data?: GeneratePersonalizedOnboardingPlanOutput;
}

export async function createOnboardingPlanForAdmin(
  prevState: OnboardingPlanState | undefined,
  formData: FormData
): Promise<OnboardingPlanState> {
    
  const validatedFields = adminFormSchema.safeParse({
    fresherProfile: formData.get('fresherProfile'),
    learningGoal: formData.get('learningGoal'),
    trainingSchedule: formData.get('trainingSchedule'),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Invalid form data. Please check your inputs.",
    };
  }

  try {
    const result = await generatePersonalizedOnboardingPlan(validatedFields.data);
    
    return { 
      success: true, 
      message: 'Plan generated successfully. You can now assign it to trainees.',
      data: result 
    };
  } catch (error) {
    console.error('Error creating onboarding plan:', error);
    return {
       success: false,
       message: 'An unexpected error occurred. Please try again later.',
    };
  }
}

type AssignPlanState = {
  success: boolean;
  message: string;
}

export async function assignOnboardingPlan(
  prevState: AssignPlanState | undefined,
  formData: FormData
): Promise<AssignPlanState> {
  
  const planData = formData.get('plan');
  const traineesData = formData.get('selectedTrainees');

  if (!planData || !traineesData) {
    return { success: false, message: 'Missing plan or trainee data.'}
  }

  try {
    const plan = JSON.parse(planData as string) as OnboardingPlanItem[];
    const traineeIds = JSON.parse(traineesData as string) as string[];

    if (!Array.isArray(plan) || !Array.isArray(traineeIds)) {
       return { success: false, message: 'Invalid data format.'}
    }

    // Server-side validation can be added here

    for (const traineeId of traineeIds) {
        await savePlan(traineeId, plan);
    }
    
    return { success: true, message: `Plan successfully assigned to ${traineeIds.length} trainee(s).` };

  } catch (error) {
     console.error('Error assigning onboarding plan:', error);
     return { success: false, message: 'An unexpected error occurred during assignment.' };
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
