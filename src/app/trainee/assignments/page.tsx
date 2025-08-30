
'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Link as LinkIcon, Loader2, CheckCircle, ChevronsUpDown, BookOpen, Code } from "lucide-react";
import Link from "next/link";
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { getTraineeByEmail, Trainee, updateTaskStatus } from '@/services/trainee-service';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import type { Task } from '@/lib/plan-schema';

export const dynamic = 'force-dynamic';

function TaskItem({ weekIndex, taskIndex, task, traineeId, onTaskUpdated }: { weekIndex: number, taskIndex: number, task: Task, traineeId: string, onTaskUpdated: () => void }) {
  const [submittedLink, setSubmittedLink] = useState(task.submittedLink || '');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleMarkAsComplete = async () => {
    setLoading(true);
    try {
      await updateTaskStatus(traineeId, weekIndex, taskIndex, 'Completed');
      onTaskUpdated();
      toast({ title: 'Task Completed!', description: `"${task.description}" marked as complete.` });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to update task status.' });
    } finally {
      setLoading(false);
    }
  }

  const handleSubmitLink = async () => {
    if (!submittedLink || !submittedLink.startsWith('http')) {
        toast({ variant: 'destructive', title: 'Invalid Link', description: 'Please enter a valid URL.' });
        return;
    }
    setLoading(true);
    try {
      await updateTaskStatus(traineeId, weekIndex, taskIndex, 'Completed', submittedLink);
      onTaskUpdated();
      toast({ title: 'Link Submitted!', description: `Your submission for "${task.description}" has been saved.` });
    } catch (error) {
       toast({ variant: 'destructive', title: 'Error', description: 'Failed to submit link.' });
    } finally {
        setLoading(false);
    }
  }
  
  const renderTaskAction = () => {
      if (task.status === 'Completed') {
          return (
              <div className="p-3 rounded-md bg-green-500/10 text-green-700 dark:text-green-400 flex items-center gap-3">
                  <CheckCircle className="h-5 w-5" />
                  <p>Completed! {task.submittedLink && <a href={task.submittedLink} target="_blank" className="font-bold underline">View your submission</a>}</p>
              </div>
          )
      }

      switch(task.type) {
          case 'basic':
            return (
                <Button onClick={handleMarkAsComplete} disabled={loading}>
                    {loading ? <Loader2 className="animate-spin mr-2" /> : <Check className="mr-2" />} Mark as Complete
                </Button>
            );
          case 'link':
            return (
                <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-grow">
                        <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            value={submittedLink}
                            onChange={e => setSubmittedLink(e.target.value)}
                            placeholder="https://github.com/your-repo"
                            className="pl-10"
                        />
                    </div>
                    <Button onClick={handleSubmitLink} disabled={loading}>
                        {loading ? <Loader2 className="animate-spin mr-2" /> : <Check className="mr-2" />} Submit Link
                    </Button>
                </div>
            );
          case 'quiz':
            return (
                 <Link href={`/trainee/quiz?id=${task.id}`}>
                    <Button>
                        <BookOpen className="mr-2" /> Go to Quiz
                    </Button>
                </Link>
            )
          case 'challenge':
            return (
                 <Link href={`/trainee/challenges/${task.id}`}>
                    <Button>
                        <Code className="mr-2" /> Go to Challenge
                    </Button>
                </Link>
            )
          default:
            return null;
      }
  }

  return (
    <AccordionItem value={task.description}>
      <AccordionTrigger>
        <div className='flex items-center gap-4'>
            {task.status === 'Completed' ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
                <ChevronsUpDown className="h-5 w-5 text-muted-foreground" />
            )}
            <span>{task.description}</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="p-4 bg-muted/50 rounded-b-md">
        {renderTaskAction()}
      </AccordionContent>
    </AccordionItem>
  );
}

export default function AssignmentsPage() {
  const [trainee, setTrainee] = useState<Trainee | null>(null);
  const { user, loading: authLoading } = useAuth();
  
  const fetchTraineeData = async () => {
    if (user?.email) {
      const traineeData = await getTraineeByEmail(user.email);
      setTrainee(traineeData);
    }
  }

  useEffect(() => {
    if (!authLoading && user?.email) {
      fetchTraineeData();
    }
  }, [user, authLoading]);
  
  if (authLoading || !trainee) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-4">Loading Your Assignments...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="mb-8">
        <h1 className="text-4xl font-headline font-bold">Your Assignments</h1>
        <p className="text-muted-foreground">Complete tasks from your personalized onboarding plan.</p>
      </header>
      
      {trainee.onboardingPlan && trainee.onboardingPlan.length > 0 ? (
        <div className="space-y-6">
          {trainee.onboardingPlan.map((planItem, weekIndex) => (
            <Card key={weekIndex}>
              <CardHeader>
                <CardTitle>{planItem.week}: {planItem.topic}</CardTitle>
                <CardDescription>Complete the tasks below to make progress.</CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {planItem.tasks.map((task, taskIndex) => (
                    <TaskItem 
                        key={`${weekIndex}-${taskIndex}`} 
                        weekIndex={weekIndex}
                        taskIndex={taskIndex}
                        task={task}
                        traineeId={trainee.id}
                        onTaskUpdated={fetchTraineeData}
                    />
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center p-8">
          <CardContent className="pt-6">
            <p className="mb-4">You don't have a personalized onboarding plan yet.</p>
            <Link href="/trainee/onboarding-plan">
              <Button>Generate Your Plan</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      <div className="text-center mt-12">
        <Link href="/trainee/dashboard">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
