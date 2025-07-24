'use server';

/**
 * @fileOverview A trainee performance report generator.
 *
 * - generateTraineeReport - A function that generates a performance report for a list of trainees.
 * - GenerateTraineeReportInput - The input type for the generateTraineeReport function.
 * - GenerateTraineeReportOutput - The return type for the generateTraineeReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TraineeSchema = z.object({
  id: z.number(),
  name: z.string(),
  department: z.string(),
  progress: z.number(),
  status: z.string(),
});

const GenerateTraineeReportInputSchema = z.object({
  trainees: z.array(TraineeSchema),
});
export type GenerateTraineeReportInput = z.infer<typeof GenerateTraineeReportInputSchema>;

const GenerateTraineeReportOutputSchema = z.object({
  report: z
    .string()
    .describe('A comprehensive performance report based on the provided trainee data. It should include an overall summary, identify top performers, and highlight trainees who might be at risk or need attention. The report should be well-structured and easy to read.'),
});
export type GenerateTraineeReportOutput = z.infer<typeof GenerateTraineeReportOutputSchema>;


export async function generateTraineeReport(
  input: GenerateTraineeReportInput
): Promise<GenerateTraineeReportOutput> {
  return generateTraineeReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTraineeReportPrompt',
  input: {schema: GenerateTraineeReportInputSchema},
  output: {schema: GenerateTraineeReportOutputSchema},
  prompt: `You are an HR analyst AI. Based on the following trainee data, generate a concise performance report.

The report should include:
1.  A brief overall summary of the cohort's performance.
2.  Identification of top-performing trainees (those with 'Exceeding' status or high progress).
3.  Identification of trainees who are 'At Risk' or 'Need Attention' and might require support.
4.  A concluding remark.

Trainee Data:
{{#each trainees}}
- Name: {{name}}, Department: {{department}}, Progress: {{progress}}%, Status: {{status}}
{{/each}}
`,
});

const generateTraineeReportFlow = ai.defineFlow(
  {
    name: 'generateTraineeReportFlow',
    inputSchema: GenerateTraineeReportInputSchema,
    outputSchema: GenerateTraineeReportOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
