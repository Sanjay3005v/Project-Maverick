
'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { createOnboardingPlan } from '@/lib/actions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wand2, Loader2, Clock, CheckCircle } from 'lucide-react';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';

// Pre-filled data for the trainee and schedule
const fresherProfile = "Recent computer science graduate with strong JavaScript skills and a passion for frontend development. Eager to learn React, Next.js, and Tailwind CSS. Prefers hands-on, project-based learning and has completed several personal projects, including a weather app and a to-do list application.";
const trainingSchedule = "Week 1: Orientation, company culture, and development environment setup. Weeks 2-3: Deep dive into React fundamentals and state management. Week 4: Introduction to Next.js, including routing and server-side rendering. Week 5: Styling with Tailwind CSS and ShadCN UI components. Weeks 6-8: Capstone project to build a full-stack application.";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full" size="lg">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generating Your Plan...
        </>
      ) : (
        <>
          <Wand2 className="mr-2 h-4 w-4" />
          Get My Personalized Plan
        </>
      )}
    </Button>
  );
}

export function TraineeOnboardingPlan() {
  const { toast } = useToast();
  const initialState = { success: false, message: '', data: undefined };
  
  const createOnboardingPlanWithData = (prevState: any, formData: FormData) => {
    // We ignore the formData and use our pre-filled data
    const newFormData = new FormData();
    newFormData.append('fresherProfile', fresherProfile);
    newFormData.append('trainingSchedule', trainingSchedule);
    return createOnboardingPlan(prevState, newFormData);
  };
  
  const [state, dispatch] = useActionState(createOnboardingPlanWithData, initialState);

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
    <div className="grid md:grid-cols-3 gap-8 items-start">
        <div className="md:col-span-1 space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Your Profile</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">{fresherProfile}</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Company Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">{trainingSchedule}</p>
                </CardContent>
            </Card>
        </div>

      <div className="md:col-span-2">
        <Card className="shadow-lg h-full flex flex-col">
            <CardHeader>
            <CardTitle className="font-headline text-2xl">Generated Plan</CardTitle>
            <CardDescription>Your AI-generated onboarding plan will appear here.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
            {state?.success && state.data ? (
                <div className="border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">Week</TableHead>
                                <TableHead>Topic</TableHead>
                                <TableHead>Tasks</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {state.data.personalizedPlan.map((item, index) => (
                                <TableRow key={index}>
                                    <TableCell className="font-medium">{item.week}</TableCell>
                                    <TableCell>{item.topic}</TableCell>
                                    <TableCell className="text-sm">{item.tasks}</TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="flex items-center gap-1.5 w-fit">
                                            <Clock className="h-3 w-3" />
                                            {item.status}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            ) : (
                <div className="flex items-center justify-center h-full border-2 border-dashed rounded-lg bg-muted/50">
                    <p className="text-muted-foreground">Click the button to generate your plan</p>
                </div>
            )}
            </CardContent>
            <CardFooter>
                <form action={dispatch} className="w-full">
                    <SubmitButton />
                </form>
            </CardFooter>
        </Card>
      </div>
    </div>
  );
}
