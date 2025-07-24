'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { createOnboardingPlan } from '@/lib/actions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Wand2, Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Wand2 className="mr-2 h-4 w-4" />
          Generate Plan
        </>
      )}
    </Button>
  );
}

export function OnboardingPlanForm() {
  const { toast } = useToast();
  const initialState = { success: false, message: '', data: undefined };
  const [state, dispatch] = useFormState(createOnboardingPlan, initialState);

  useEffect(() => {
    if (state && !state.success && state.message) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: state.message,
      });
    }
  }, [state, toast]);

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <Card className="shadow-lg">
        <form action={dispatch}>
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Create Onboarding Plan</CardTitle>
            <CardDescription>Use AI to generate a personalized plan for a new trainee.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="fresherProfile" className="text-base">Fresher Profile</Label>
              <Textarea
                id="fresherProfile"
                name="fresherProfile"
                placeholder="Describe the trainee's skills, learning preferences, and past experience. e.g., 'Recent computer science graduate with strong Java skills, prefers hands-on projects, has internship experience in web development...'"
                rows={8}
                required
                className="text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="trainingSchedule" className="text-base">Training Schedule</Label>
              <Textarea
                id="trainingSchedule"
                name="trainingSchedule"
                placeholder="Outline the overall training schedule and available modules. e.g., 'Week 1: Company orientation & tools setup. Week 2-3: Core Java programming. Week 4: Introduction to databases...'"
                rows={8}
                required
                className="text-base"
              />
            </div>
          </CardContent>
          <CardFooter>
            <SubmitButton />
          </CardFooter>
        </form>
      </Card>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Generated Plan</CardTitle>
          <CardDescription>The AI-generated plan will appear here.</CardDescription>
        </CardHeader>
        <CardContent>
          {state?.success && state.data ? (
            <Alert variant="default" className="bg-primary/5 border-primary/20">
              <Wand2 className="h-4 w-4 !text-primary" />
              <AlertTitle className="font-headline text-primary">Personalized Plan Ready!</AlertTitle>
              <AlertDescription className="prose prose-sm whitespace-pre-wrap text-foreground">
                {state.data.personalizedPlan}
              </AlertDescription>
            </Alert>
          ) : (
            <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg bg-muted/50">
              <p className="text-muted-foreground">Waiting for input...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
