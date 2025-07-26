
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
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
  'python-list-comprehension': {
    title: 'Python List Comprehension',
    description: 'Write a Python function to transform a list of numbers into a list of their squares using list comprehension.',
    testCases: [
      'Must be a function that accepts a list.',
      'Must use list comprehension syntax.',
      '[1, 2, 3] should return [1, 4, 9].',
      'Should handle an empty list correctly.'
    ],
  },
  'java-inheritance': {
    title: 'Java Class Inheritance',
    description: "Create a 'Dog' class that inherits from an 'Animal' class, overriding a method to make a specific sound.",
    testCases: [
      'Must define an Animal base class.',
      'Dog class must extend Animal.',
      "Animal's `makeSound()` should be overridden in Dog.",
      "Dog's `makeSound()` should return 'Woof!'."
    ],
  },
  'sql-join-query': {
    title: 'SQL Join Query',
    description: "Write a SQL query to join 'Orders' and 'Customers' tables on `customer_id`, returning the order ID and customer name.",
    testCases: [
      'Must SELECT Orders.OrderID and Customers.CustomerName.',
      'Must JOIN the Orders and Customers tables.',
      'The JOIN condition must be `Orders.CustomerID = Customers.CustomerID`.',
    ],
  },
};

export default function ChallengePage() {
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : '';
  const [challenge, setChallenge] = useState<{ title: string; description: string, testCases: string[] } | null>(null);
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EvaluateCodeChallengeOutput | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (id && challenges[id]) {
      setChallenge(challenges[id]);
    } else {
      // Handle case where challenge is not found
    }
  }, [id]);

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
                        <SelectItem value="python">Python</SelectItem>
                        <SelectItem value="java">Java</SelectItem>
                        <SelectItem value="sql">SQL</SelectItem>
                        <SelectItem value="c">C</SelectItem>
                        <SelectItem value="cpp">C++</SelectItem>
                        <SelectItem value="php">PHP</SelectItem>
                        <SelectItem value="javascript">JavaScript</SelectItem>
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
