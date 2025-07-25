
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import { getDailyQuiz, Quiz } from '@/services/quiz-service';

export default function DailyQuizPage() {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [dailyQuiz, setDailyQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchQuiz = async () => {
        setLoading(true);
        const todayQuiz = await getDailyQuiz();
        setDailyQuiz(todayQuiz);

        if (todayQuiz) {
            const lastTaken = localStorage.getItem('dailyQuizTaken');
            const lastQuizId = localStorage.getItem('lastQuizId');
            const today = new Date().toISOString().split('T')[0];

            if (lastTaken === today && lastQuizId === todayQuiz.id) {
                setSubmitted(true);
                const savedAnswers = JSON.parse(localStorage.getItem('lastQuizAnswers') || '{}');
                setAnswers(savedAnswers);
            } else {
                localStorage.removeItem('dailyQuizTaken');
                localStorage.removeItem('lastQuizId');
                localStorage.removeItem('lastQuizAnswers');
            }
        }
        setLoading(false);
    };

    fetchQuiz();
  }, []);

  const handleAnswerChange = (questionIndex: number, value: string) => {
    setAnswers(prev => ({ ...prev, [questionIndex]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dailyQuiz) return;
    
    if (Object.keys(answers).length !== dailyQuiz.questions.length) {
      toast({
        variant: 'destructive',
        title: 'Incomplete Quiz',
        description: 'Please answer all questions before submitting.',
      });
      return;
    }
    
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem('dailyQuizTaken', today);
    localStorage.setItem('lastQuizId', dailyQuiz.id);
    localStorage.setItem('lastQuizAnswers', JSON.stringify(answers));

    setSubmitted(true);
  };

  if(loading) {
    return (
        <div className="container mx-auto p-4 md:p-8 text-center">
            <p>Loading daily quiz...</p>
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
  const score = quizQuestions.reduce((total, question, index) => {
    return total + (answers[index] === question.answer ? 1 : 0);
  }, 0);

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
                    {quizQuestions.map((q, index) => (
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
                    ))}
                </div>
            </CardContent>
            <CardFooter className="flex-col gap-4">
                <p className="text-sm text-muted-foreground">You have completed the daily quiz. A new quiz will be available tomorrow.</p>
                 <Link href="/trainee/dashboard">
                    <Button variant="outline">Back to Dashboard</Button>
                </Link>
            </CardFooter>
        </Card>
      )}
    </div>
  );
}

    