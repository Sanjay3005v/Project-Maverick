
'use server';

/**
 * @fileOverview An AI-powered quiz generator that creates quizzes from document content.
 *
 * - generateQuizFromDocument - A function that generates a quiz from a given document content.
 * - GenerateQuizFromDocumentInput - The input type for the function.
 * - GenerateQuizOutput - The return type for the function (shared with generate-quiz-flow).
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { GenerateQuizOutputSchema, GenerateQuizOutput } from './generate-quiz-flow';

export const GenerateQuizFromDocumentInputSchema = z.object({
  topic: z.string().describe('The topic for which to generate the quiz. This is often derived from the document filename.'),
  documentContent: z.string().describe('The full text content of the document from which to generate the quiz.'),
  numQuestions: z.number().int().positive().default(10).describe('The number of questions to generate for the quiz.'),
});
export type GenerateQuizFromDocumentInput = z.infer<typeof GenerateQuizFromDocumentInputSchema>;


export async function generateQuizFromDocument(input: GenerateQuizFromDocumentInput): Promise<GenerateQuizOutput> {
  return generateQuizFromDocumentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateQuizFromDocumentPrompt',
  input: {schema: GenerateQuizFromDocumentInputSchema},
  output: {schema: GenerateQuizOutputSchema},
  prompt: `You are an expert curriculum developer. Your task is to create a quiz based on the provided document content.

Topic: "{{topic}}"
Number of Questions: {{numQuestions}}

Please read the following document content and generate a quiz with a relevant title and the specified number of questions. Each question must be directly based on the information present in the document. Each question must have exactly four options, and one of them must be the correct answer. The 'answer' field must exactly match one of the strings in the 'options' array. Ensure the questions are relevant to the topic and the difficulty is appropriate for a corporate trainee.

Document Content:
---
{{{documentContent}}}
---
`,
});

const generateQuizFromDocumentFlow = ai.defineFlow(
  {
    name: 'generateQuizFromDocumentFlow',
    inputSchema: GenerateQuizFromDocumentInputSchema,
    outputSchema: GenerateQuizOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
