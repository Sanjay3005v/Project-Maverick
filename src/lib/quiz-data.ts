
import {z} from 'zod';

export const QuestionSchema = z.object({
  question: z.string().describe('The question text.'),
  options: z.array(z.string()).min(4).max(4).describe('A list of exactly four possible answers (options).'),
  answer: z.string().describe('The correct answer, which must be one of the provided options.'),
});
export type Question = z.infer<typeof QuestionSchema>;

export const GenerateQuizInputSchema = z.object({
  topic: z.string().describe('The topic for which to generate the quiz.'),
  numQuestions: z.number().int().positive().default(10).describe('The number of questions to generate for the quiz.'),
  documentContent: z.string().optional().describe('The full text content of a document to base the quiz on.'),
});
export type GenerateQuizInput = z.infer<typeof GenerateQuizInputSchema>;


export const GenerateQuizOutputSchema = z.object({
  title: z.string().describe('A suitable title for the generated quiz.'),
  topic: z.string().describe('The topic of the quiz.'),
  questions: z.array(QuestionSchema).describe('An array of generated questions.'),
});
export type GenerateQuizOutput = z.infer<typeof GenerateQuizOutputSchema>;


export const QuizSchema = z.object({
  id: z.string(),
  title: z.string(),
  topic: z.string(),
  questions: z.array(QuestionSchema),
  isDailyQuiz: z.boolean(),
});
export type Quiz = z.infer<typeof QuizSchema>;
