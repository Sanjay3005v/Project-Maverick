
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { getDailyQuiz, Quiz } from '@/services/quiz-service';
import { useAuth } from '@/hooks/use-auth';
import { getTraineeByEmail, updateTraineeProgress, Trainee, addQuizCompletion } from '@/services/trainee-service';
import { format } from 'date-fns';

export default function DailyQuizPage() {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [dailyQuiz, setDailyQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [trainee, setTrainee] = useState<Trainee | null>(null);
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const [score, setScore] = useState(0);


  useEffect(() => {
    const fetchQuizAndTrainee = async () => {
        setLoading(true);
        const todayQuiz = await getDailyQuiz();
        setDailyQuiz(todayQuiz);

        if (user?.email) {
            const traineeData = await getTraineeByEmail(user.email);
            setTrainee(traineeData);
            const todayString = format(new Date(), 'yyyy-MM-dd');
            
            if (todayQuiz && traineeData?.quizCompletions?.find(c => c.date === todayString)) {
                 setSubmitted(true);
                 // We can't reconstruct answers, just show the already-completed view
            }
        }
        setLoading(false);
    };

    if (!authLoading) {
      fetchQuizAndTrainee();
    }
  }, [user, authLoading]);

  const handleAnswerChange = (questionIndex: number, value: string) => {
    setAnswers(prev => ({ ...prev, [questionIndex]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dailyQuiz || !trainee) return;
    
    if (Object.keys(answers).length !== dailyQuiz.questions.length) {
      toast({
        variant: 'destructive',
        title: 'Incomplete Quiz',
        description: 'Please answer all questions before submitting.',
      });
      return;
    }

    const todayString = format(new Date(), 'yyyy-MM-dd');
    
    // Calculate score
    const calculatedScore = dailyQuiz.questions.reduce((total, question, index) => {
        return total + (answers[index] === question.answer ? 1 : 0);
    }, 0);
    const scorePercentage = Math.round((calculatedScore / dailyQuiz.questions.length) * 100);
    setScore(calculatedScore);

    // Calculate progress update
    const progressUpdate = Math.round((calculatedScore / dailyQuiz.questions.length) * 10); // +10% for a perfect quiz

    try {
        await updateTraineeProgress(trainee.id, Math.min(100, trainee.progress + progressUpdate));
        await addQuizCompletion(trainee.id, { date: todayString, score: scorePercentage });
        
        toast({
            title: 'Quiz Submitted!',
            description: `Your progress has been updated. Keep it up!`
        });

        setSubmitted(true);
    } catch (error) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Could not submit your quiz or update progress.'
        })
    }
  };

  if(loading || authLoading) {
    return (
        <div className="container mx-auto p-4 md:p-8 text-center flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="ml-4">Loading daily quiz...</p>
        </div>
    )
  }
  
  if (!dailyQuiz) {
      return (
        <div className="container mx-auto p-4 md:p-8 text-center">
             <header className="mb-8">
                <h1 className="text-4xl font-headline font-bold">Daily Quiz</h1>
             </header>
             <Card>
                <CardContent className="pt-6">
                    <p>No daily quiz has been assigned by the administrator yet. Please check back later.</p>
                </CardContent>
             </Card>
             <div className="text-center mt-12">
                 <Link href="/trainee/dashboard">
                    <Button variant="outline">Back to Dashboard</Button>
                </Link>
            </div>
        </div>
      )
  }

  const quizQuestions = dailyQuiz.questions;

  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="mb-8">
        <h1 className="text-4xl font-headline font-bold">Daily Quiz: {dailyQuiz.title}</h1>
        <p className="text-muted-foreground">{dailyQuiz.topic}</p>
      </header>
      
      {!submitted ? (
        <form onSubmit={handleSubmit}>
          <div className="space-y-8">
            {quizQuestions.map((q, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle>Question {index + 1}</CardTitle>
                  <CardDescription>{q.question}</CardDescription>
                </CardHeader>
                <CardContent>
                  <RadioGroup onValueChange={(value) => handleAnswerChange(index, value)}>
                    <div className="space-y-2">
                      {q.options.map((option, optionIndex) => (
                        <div key={optionIndex} className="flex items-center space-x-2">
                          <RadioGroupItem value={option} id={`q${index}-o${optionIndex}`} />
                          <Label htmlFor={`q${index}-o${optionIndex}`}>{option}</Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
            ))}
            <Button type="submit" size="lg" className="w-full">Submit Answers</Button>
          </div>
        </form>
      ) : (
        <Card className="max-w-2xl mx-auto text-center">
            <CardHeader>
                <CardTitle className="text-3xl font-headline">Quiz Results</CardTitle>
                <CardDescription>You scored</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-6xl font-bold text-primary">
                    {score} / {quizQuestions.length}
                </p>
                <div className="space-y-4">
                    {Object.keys(answers).length > 0 ? (
                        quizQuestions.map((q, index) => (
                            <div key={index} className="p-4 rounded-lg text-left"
                                 style={{
                                     backgroundColor: answers[index] === q.answer ? 'hsl(var(--primary) / 0.1)' : 'hsl(var(--destructive) / 0.1)'
                                 }}>
                                <p className="font-semibold">{q.question}</p>
                                <div className="flex items-center mt-2">
                                    {answers[index] === q.answer ?
                                        <CheckCircle className="h-5 w-5 text-green-600 mr-2"/> :
                                        <XCircle className="h-5 w-5 text-red-600 mr-2"/>
                                    }
                                    <p className="text-sm">Your answer: {answers[index]}</p>
                                </div>
                                {answers[index] !== q.answer && (
                                    <p className="text-sm text-muted-foreground mt-1">Correct answer: {q.answer}</p>
                                )}
                            </div>
                        ))
                    ) : (
                        <p className="text-muted-foreground">You've already completed the quiz for today!</p>
                    )}
                </div>
            </CardContent>
            <CardFooter className="flex-col gap-4">
                <p className="text-sm text-muted-foreground">You have completed the daily quiz. Your progress has been updated!</p>
                 <Link href="/trainee/dashboard">
                    <Button variant="outline">Back to Dashboard</Button>
                </Link>
            </CardFooter>
        </Card>
      )}
    </div>
  );
}
