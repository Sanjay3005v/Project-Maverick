
'use server';

/**
 * @fileOverview An AI-powered quiz generator.
 *
 * - generateQuiz - A function that generates a quiz on a given topic.
 * - GenerateQuizInput - The input type for the generateQuiz function.
 * - GenerateQuizOutput - The return type for the generateQuiz function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateQuizInputSchema = z.object({
  topic: z.string().describe('The topic for which to generate the quiz.'),
  numQuestions: z.number().int().positive().default(5).describe('The number of questions to generate for the quiz.'),
});
export type GenerateQuizInput = z.infer<typeof GenerateQuizInputSchema>;

const QuestionSchema = z.object({
  question: z.string().describe('The question text.'),
  options: z.array(z.string()).describe('A list of possible answers (options).'),
  answer: z.string().describe('The correct answer, which must be one of the provided options.'),
});

const GenerateQuizOutputSchema = z.object({
  title: z.string().describe('A suitable title for the generated quiz.'),
  topic: z.string().describe('The topic of the quiz.'),
  questions: z.array(QuestionSchema).describe('An array of generated questions.'),
});
export type GenerateQuizOutput = z.infer<typeof GenerateQuizOutputSchema>;


export async function generateQuiz(input: GenerateQuizInput): Promise<GenerateQuizOutput> {
  return generateQuizFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateQuizPrompt',
  input: {schema: GenerateQuizInputSchema},
  output: {schema: GenerateQuizOutputSchema},
  prompt: `You are an expert curriculum developer. Your task is to create a quiz based on a given topic.

Topic: "{{topic}}"
Number of Questions: {{numQuestions}}

Generate a quiz with a relevant title and the specified number of questions. Each question must have exactly four options, and one of them must be the correct answer. The 'answer' field must exactly match one of the strings in the 'options' array. Ensure the questions are relevant to the topic and the difficulty is appropriate for a corporate trainee.
`,
});

const generateQuizFlow = ai.defineFlow(
  {
    name: 'generateQuizFlow',
    inputSchema: GenerateQuizInputSchema,
    outputSchema: GenerateQuizOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
