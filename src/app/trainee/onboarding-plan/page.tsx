
'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle, Clock, ArrowRight, BookOpen, Code, Youtube } from "lucide-react";
import Link from "next/link";
import { useAuth } from '@/hooks/use-auth';
import { getTraineeByEmail, Trainee } from '@/services/trainee-service';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import type { Task } from '@/lib/plan-schema';
import { searchVideo } from '@/services/youtube-service';

function TaskAction({ task }: { task: Task }) {
    let href = '/trainee/assignments';
    let icon = <ArrowRight className="h-4 w-4" />;
    let text = "Go to Assignment";

    if (task.type === 'quiz' && task.id) {
        href = `/trainee/quiz?id=${task.id}`;
        icon = <BookOpen className="mr-2 h-4 w-4" />;
        text = "Start Quiz";
    } else if (task.type === 'challenge' && task.id) {
        href = `/trainee/challenges/${task.id}`;
        icon = <Code className="mr-2 h-4 w-4" />;
        text = "Start Challenge";
    } else if (task.type === 'basic' || task.type === 'link') {
         href = '/trainee/assignments';
         icon = <ArrowRight className="mr-2 h-4 w-4" />;
         text = "View in Assignments";
    }

    return (
        <Link href={href}>
            <Button variant="outline" size="sm">
                {icon} {text}
            </Button>
        </Link>
    );
}

function YouTubePlayer({ topic }: { topic: string }) {
  const [videoId, setVideoId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVideo() {
      setLoading(true);
      const id = await searchVideo(`${topic} tutorial for beginners`);
      setVideoId(id);
      setLoading(false);
    }
    fetchVideo();
  }, [topic]);

  if (loading) {
    return (
      <div className="flex items-center justify-center bg-muted/50 rounded-lg h-48 w-full">
        <Loader2 className="h-6 w-6 animate-spin" />
        <p className="ml-3">Loading Video...</p>
      </div>
    );
  }
  
  if (!videoId) {
     return (
      <div className="flex items-center justify-center bg-muted/50 rounded-lg h-48 w-full">
        <Youtube className="h-6 w-6 mr-3 text-red-500" />
        <p>Could not load video. YouTube API key may be missing or invalid.</p>
      </div>
    );
  }

  return (
    <div className="aspect-video">
      <iframe
        width="100%"
        height="100%"
        src={`https://www.youtube.com/embed/${videoId}`}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="rounded-lg"
      ></iframe>
    </div>
  );
}


export default function TraineeOnboardingPlanPage() {
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
        <p className="ml-4">Loading Your Onboarding Plan...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="mb-8">
        <h1 className="text-4xl font-headline font-bold">My Onboarding Plan</h1>
        <p className="text-muted-foreground">Your full learning journey with videos and tasks. Click on any item to begin.</p>
      </header>
      
      {trainee.onboardingPlan && trainee.onboardingPlan.length > 0 ? (
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {trainee.onboardingPlan.map((planItem, weekIndex) => (
            <Card key={weekIndex} className="break-inside-avoid">
              <CardHeader>
                <CardTitle>{planItem.week}: {planItem.topic}</CardTitle>
                <CardDescription>Video resource and tasks for this section.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <YouTubePlayer topic={planItem.topic} />
                <Accordion type="single" collapsible className="w-full">
                   {planItem.tasks.map((task, taskIndex) => (
                     <AccordionItem value={`task-${taskIndex}`} key={taskIndex}>
                        <AccordionTrigger>
                             <div className="flex items-center gap-4">
                                {task.status === 'Completed' ? (
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                ) : (
                                    <Clock className="h-5 w-5 text-muted-foreground" />
                                )}
                                <span className="text-left flex-1">{task.description}</span>
                                <Badge variant={task.status === 'Completed' ? 'default' : 'secondary'} className={task.status === 'Completed' ? 'bg-green-500' : ''}>
                                    {task.status}
                                </Badge>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="p-4 flex justify-between items-center bg-muted/50 rounded-b-md">
                            <div>
                                <p className="font-semibold text-muted-foreground">Action Required:</p>
                                <p>
                                    {task.type === 'quiz' && "Take the quiz."}
                                    {task.type === 'challenge' && "Solve the coding challenge."}
                                    {task.type === 'link' && "Submit your link via the assignments page."}
                                    {task.type === 'basic' && "Mark this task as complete on the assignments page."}
                                </p>
                            </div>
                            <TaskAction task={task} />
                        </AccordionContent>
                     </AccordionItem>
                    ))}
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center p-8">
          <CardContent className="pt-6">
            <p className="mb-4 text-muted-foreground">Your onboarding plan has not been assigned by an administrator yet.</p>
             <p className="text-sm">Please check back later or contact your administrator.</p>
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
