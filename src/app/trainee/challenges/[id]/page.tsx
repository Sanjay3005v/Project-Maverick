
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Code2, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { evaluateCodeChallenge, EvaluateCodeChallengeOutput } from '@/ai/flows/evaluate-code-challenge';

// Mock data for challenges - in a real app, this would be fetched from a database
const challenges: Record<string, { title: string; description: string; testCases: string[] }> = {
  'css-flexbox-layout': {
    title: 'CSS Flexbox Layout',
    description:
      'Given the HTML structure, write the CSS using Flexbox to create a responsive header with a logo on the left, navigation links in the center, and a login button on the right.',
    testCases: [
      'The container should be a flex container.',
      'Items should be vertically centered.',
      'Logo should be on the far left.',
      'Login button should be on the far right.',
    ],
  },
  'api-data-fetching': {
    title: 'API Data Fetching',
    description:
      'Write a JavaScript function that fetches a list of users from the JSONPlaceholder API (`https://jsonplaceholder.typicode.com/users`) and returns an array of their names.',
    testCases: [
      'Function must be async.',
      'Must use the `fetch` API.',
      'Should handle potential errors with a try...catch block.',
      'Should return an array of strings (names).',
    ],
  },
  'state-management-with-hooks': {
    title: 'State Management with Hooks',
    description:
      'Build a React component that displays a count. The component should have two buttons: one to increment the count and one to decrement it. Use the `useState` hook to manage the count.',
    testCases: [
      'Must use the `useState` hook to store the count.',
      'Increment button should increase the count by 1.',
      'Decrement button should decrease the count by 1.',
      'The initial count should be 0.',
    ],
  },
};

export default function ChallengePage({ params }: { params: { id: string } }) {
  const [challenge, setChallenge] = useState<{ title: string; description: string, testCases: string[] } | null>(null);
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EvaluateCodeChallengeOutput | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (params.id && challenges[params.id]) {
      setChallenge(challenges[params.id]);
    } else {
      // Handle case where challenge is not found
    }
  }, [params.id]);

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
        toast({
            title: 'Congratulations!',
            description: "Good work, keep it up!",
        })
      } else {
        toast({
            variant: 'destructive',
            title: 'Not Quite...',
            description: "Better luck next time. Check the feedback for a hint.",
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

  if (!challenge) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-4">Loading Challenge...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
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
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger id="language" className="w-[180px]">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="javascript">JavaScript</SelectItem>
                        <SelectItem value="python">Python</SelectItem>
                        <SelectItem value="css">CSS</SelectItem>
                        <SelectItem value="html">HTML</SelectItem>
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
                    />
                  </div>
                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Code2 className="mr-2 h-4 w-4" />
                    )}
                    Submit & Evaluate
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
    </div>
  );
}
