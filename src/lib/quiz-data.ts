
import {z} from 'zod';

export const QuestionSchema = z.object({
  question: z.string().describe('The question text.'),
  options: z.array(z.string()).describe('A list of possible answers (options).'),
  answer: z.string().describe('The correct answer, which must be one of the provided options.'),
});
export type Question = z.infer<typeof QuestionSchema>;

export const QuizSchema = z.object({
  id: z.string(),
  title: z.string().describe('A suitable title for the generated quiz.'),
  topic: z.string().describe('The topic of the quiz.'),
  questions: z.array(QuestionSchema).describe('An array of generated questions.'),
  isDailyQuiz: z.boolean(),
});
export type Quiz = z.infer<typeof QuizSchema>;
