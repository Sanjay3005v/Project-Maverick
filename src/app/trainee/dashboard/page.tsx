
'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { BookOpenCheck, Code2, FileText, Award, Route, Loader2 } from "lucide-react";
import Link from "next/link";
import { useAuth } from '@/hooks/use-auth';
import { Trainee, getTraineeByEmail } from '@/services/trainee-service';

export default function TraineeDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [trainee, setTrainee] = useState<Trainee | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && user?.email) {
      const fetchTrainee = async () => {
        setDataLoading(true);
        const traineeData = await getTraineeByEmail(user.email);
        setTrainee(traineeData);
        setDataLoading(false);
      }
      fetchTrainee();
    } else if (!authLoading && !user) {
      setDataLoading(false);
    }
  }, [user, authLoading]);

  if (authLoading || dataLoading) {
    return (
        <div className="flex justify-center items-center h-screen">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="ml-4">Loading Your Dashboard...</p>
        </div>
    )
  }

  if (!trainee) {
    return (
       <div className="container mx-auto p-4 md:p-8 text-center">
         <Card>
            <CardContent className="pt-6">
                <p>Welcome! Your trainee profile has not been set up by an administrator yet. Please check back later.</p>
            </CardContent>
         </Card>
       </div>
    )
  }

  const overallProgress = typeof trainee.progress === 'number' ? trainee.progress : 0;
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('');
  }


  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8">
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center gap-4 space-y-0">
            <Avatar className="h-16 w-16">
              <AvatarImage src="https://placehold.co/128x128.png" data-ai-hint="person portrait" />
              <AvatarFallback>{getInitials(trainee.name)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="font-headline text-2xl">Welcome, {trainee.name}!</CardTitle>
              <CardDescription>Trainee, {trainee.department} Department</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Your personalized journey at Maverick Mindset starts now. Stay on top of your tasks and make the most of your onboarding.
            </p>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-headline">Your Onboarding Progress</CardTitle>
            <CardDescription>This reflects your overall progress through the onboarding program.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <Progress value={overallProgress} className="h-3" />
              <span className="font-bold text-lg text-primary">{Math.round(overallProgress)}%</span>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
                Your progress is automatically updated as you complete quizzes, assignments, and other activities.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Link href="/trainee/onboarding-plan">
            <Card className="hover:border-primary transition-colors h-full">
                <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-headline">My Onboarding Plan</CardTitle>
                    <Route className="h-6 w-6 text-muted-foreground" />
                </div>
                </CardHeader>
                <CardContent>
                <p className="text-2xl font-bold">Ready to Generate</p>
                <p className="text-sm text-muted-foreground">Get your personalized plan</p>
                </CardContent>
            </Card>
        </Link>
        <Link href="/trainee/quiz">
          <Card className="hover:border-primary transition-colors h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-headline">Daily Quiz</CardTitle>
                <BookOpenCheck className="h-6 w-6 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">Ready</p>
              <p className="text-sm text-muted-foreground">Test your knowledge now</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/trainee/challenges">
          <Card className="hover:border-primary transition-colors h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-headline">Coding Challenges</CardTitle>
                <Code2 className="h-6 w-6 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">3 / 5</p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/trainee/assignments">
          <Card className="hover:border-primary transition-colors h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-headline">Assignments</CardTitle>
                <FileText className="h-6 w-6 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">2 Submitted</p>
              <p className="text-sm text-muted-foreground">1 Pending Feedback</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/trainee/certifications">
          <Card className="hover:border-primary transition-colors h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-headline">Certifications</CardTitle>
                <Award className="h-6 w-6 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">1 / 2</p>
              <p className="text-sm text-muted-foreground">In Progress</p>
            </CardContent>
          </Card>
        </Link>
      </section>
    </div>
  );
}
