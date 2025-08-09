
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
  id: z.string(),
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
    .describe('A comprehensive performance report in Markdown format. It should include an overall summary, a table of the trainees, identification of top performers, and highlight trainees who might be at risk. The report should be well-structured and easy to read.'),
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
  prompt: `You are an HR analyst AI. Based on the following trainee data, generate a concise performance report in Markdown format.

The report must include the following sections:
1.  **Overall Summary:** A brief paragraph summarizing the cohort's performance, mentioning key trends.
2.  **Performance Table:** A Markdown table with the following columns: Name, Department, Progress (%), and Status.
3.  **Key Insights:** A bulleted list identifying top-performing trainees and highlighting those who are 'At Risk' or 'Need Attention'.
4.  **Recommendations:** A brief concluding remark with a suggested next step, like commending top performers or scheduling check-ins with at-risk trainees.

Trainee Data:
{{#each trainees}}
- Name: {{name}}, Department: {{department}}, Progress: {{progress}}%, Status: {{status}}
{{/each}}

Ensure the entire output is a single, well-formatted Markdown string.
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
