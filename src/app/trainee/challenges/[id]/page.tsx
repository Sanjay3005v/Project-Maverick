
'use client';

import { Suspense } from 'react';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { LoaderCircle, Code2, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { evaluateCodeChallenge, EvaluateCodeChallengeOutput } from '@/ai/flows/evaluate-code-challenge';
import { Challenge, getChallengeById } from '@/services/challenge-service';
import { useAuth } from '@/hooks/use-auth';
import { Trainee, getTraineeByEmail, markChallengeAsCompleted } from '@/services/trainee-service';

export const dynamic = 'force-dynamic';

function ChallengeContent() {
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : '';
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [trainee, setTrainee] = useState<Trainee | null>(null);
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EvaluateCodeChallengeOutput | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSqlChallenge, setIsSqlChallenge] = useState(false);


  useEffect(() => {
    async function fetchData() {
        if (id && user?.email) {
            const [fetchedChallenge, fetchedTrainee] = await Promise.all([
                getChallengeById(id),
                getTraineeByEmail(user.email)
            ]);
            setChallenge(fetchedChallenge);
            setTrainee(fetchedTrainee);

            if (fetchedChallenge?.tags.map(t => t.toLowerCase()).includes('sql')) {
              setLanguage('sql');
              setIsSqlChallenge(true);
            }

            if (fetchedTrainee?.completedChallengeIds?.includes(id)) {
                setIsCompleted(true);
            }
        }
    }
    if(!authLoading) {
        fetchData();
    }
  }, [id, user, authLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      toast({
        variant: 'destructive',
        title: 'Empty Code',
        description: 'Please write some code before submitting.',
      });
      return;
    }
    if (!trainee || !challenge) return;

    setLoading(true);
    setResult(null);

    try {
      const evaluation = await evaluateCodeChallenge({
        language,
        problem: challenge!.description,
        code,
      });
      setResult(evaluation);
      if (evaluation.status === 'Passed') {
        await markChallengeAsCompleted(trainee.id, challenge.id);
        setIsCompleted(true);
        toast({
            title: 'Congratulations! Good work, keep it up!',
            description: evaluation.feedback,
        })
      } else {
        toast({
            variant: 'destructive',
            title: 'Not Quite... Better luck next time.',
            description: "Check the feedback for a hint.",
        })
      }

    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'An unexpected error occurred during evaluation.',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!challenge || !trainee) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoaderCircle className="h-8 w-8 animate-spin" />
        <p className="ml-4">Loading Challenge...</p>
      </div>
    );
  }

  return (
    <>
      <header className="mb-8">
         <Link href="/trainee/challenges" className="flex items-center text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to All Challenges
        </Link>
        <h1 className="text-4xl font-headline font-bold">{challenge.title}</h1>
        <p className="text-muted-foreground mt-2 max-w-3xl">{challenge.description}</p>
      </header>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Your Solution</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select value={language} onValueChange={setLanguage} disabled={isCompleted || isSqlChallenge}>
                      <SelectTrigger id="language" className="w-[180px]">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        {isSqlChallenge ? (
                            <SelectItem value="sql">SQL</SelectItem>
                        ) : (
                            <>
                                <SelectItem value="python">Python</SelectItem>
                                <SelectItem value="java">Java</SelectItem>
                                <SelectItem value="sql">SQL</SelectItem>
                                <SelectItem value="c">C</SelectItem>
                                <SelectItem value="cpp">C++</SelectItem>
                                <SelectItem value="php">PHP</SelectItem>
                                <SelectItem value="javascript">JavaScript</SelectItem>
                            </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="code-editor">Code Editor</Label>
                    <Textarea
                      id="code-editor"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="Write your code here..."
                      className="font-mono h-96"
                      disabled={isCompleted}
                    />
                  </div>
                  <Button type="submit" disabled={loading || isCompleted} className="w-full">
                    {loading ? (
                      <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Code2 className="mr-2 h-4 w-4" />
                    )}
                    {isCompleted ? 'Challenge Completed' : 'Submit & Evaluate'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
            <Card>
                 <CardHeader>
                    <CardTitle>Test Cases</CardTitle>
                    <CardDescription>Your code should pass these checks.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5">
                        {challenge.testCases.map((tc, i) => <li key={i}>{tc}</li>)}
                    </ul>
                </CardContent>
            </Card>
            {isCompleted && !result && (
                 <div className="p-4 rounded-md bg-green-500/10 text-green-700 dark:text-green-400 flex items-center gap-3">
                    <CheckCircle className="h-6 w-6" />
                    <div>
                        <h3 className="font-bold">Already Completed!</h3>
                        <p className="text-sm">You have successfully completed this challenge.</p>
                    </div>
                  </div>
            )}
            {result && (
            <Card>
              <CardHeader>
                <CardTitle>Evaluation Result</CardTitle>
              </CardHeader>
              <CardContent>
                {result.status === 'Passed' ? (
                  <div className="p-4 rounded-md bg-green-500/10 text-green-700 dark:text-green-400 flex items-center gap-3">
                    <CheckCircle className="h-6 w-6" />
                    <div>
                        <h3 className="font-bold">Passed!</h3>
                        <p className="text-sm">{result.feedback}</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-md bg-red-500/10 text-red-700 dark:text-red-400 flex items-center gap-3">
                    <XCircle className="h-6 w-6" />
                     <div>
                        <h3 className="font-bold">Failed</h3>
                        <p className="text-sm">{result.feedback}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}

export default function ChallengePage() {
    return (
        <div className="container mx-auto p-4 md:p-8">
            <Suspense fallback={<div className="flex justify-center items-center h-screen"><LoaderCircle className="h-8 w-8 animate-spin" /><p className="ml-4">Loading Challenge...</p></div>}>
                <ChallengeContent />
            </Suspense>
        </div>
    );
}
