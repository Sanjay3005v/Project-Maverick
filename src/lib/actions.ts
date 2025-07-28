
'use server';

import { generatePersonalizedOnboardingPlan, type GeneratePersonalizedOnboardingPlanOutput } from '@/ai/flows/generate-onboarding-plan';
import { generateTraineeReport, type GenerateTraineeReportInput, type GenerateTraineeReportOutput } from '@/ai/flows/generate-trainee-report';
import { saveOnboardingPlan as savePlan, getTraineeByEmail } from '@/services/trainee-service';
import { auth } from '@/lib/firebase-admin';
import { headers } from 'next/headers';
import { z } from 'zod';


const formSchema = z.object({
  learningGoal: z.string().min(10, "Please provide a learning goal of at least 10 characters."),
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
    const headersList = headers();
    const idToken = headersList.get('Authorization')?.split('Bearer ')[1];

    if (!idToken) {
         return {
            success: false,
            message: 'Authentication token not found. Please log in.',
        };
    }
    
  const validatedFields = formSchema.safeParse({
    learningGoal: formData.get('learningGoal'),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Invalid form data. Please check your inputs.",
    };
  }

  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    const userEmail = decodedToken.email;

    if (!userEmail) {
      return {
        success: false,
        message: 'Could not identify user from token. Please log in again.',
      };
    }

    const trainee = await getTraineeByEmail(userEmail);
    if (!trainee) {
        return {
            success: false,
            message: 'Trainee profile not found.',
        }
    }

    const result = await generatePersonalizedOnboardingPlan({
      learningGoal: validatedFields.data.learningGoal,
      fresherProfile: 'Not provided', // Placeholder as form was simplified
      trainingSchedule: 'Not provided' // Placeholder as form was simplified
    });

    await savePlan(trainee.id, result.personalizedPlan);
    
    return { 
      success: true, 
      message: 'Successfully generated and saved plan.',
      data: result 
    };
  } catch (error) {
    console.error('Error creating onboarding plan:', error);
    if ((error as any).code === 'auth/id-token-expired') {
        return {
            success: false,
            message: 'Your session has expired. Please log out and log in again.'
        }
    }
    return {
       success: false,
       message: 'An unexpected error occurred. Please try again later.',
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
