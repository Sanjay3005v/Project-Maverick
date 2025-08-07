
'use client';

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, TrendingUp, Award, ClipboardCheck, ListChecks, BarChart2, Loader2, UserCog, Bell, FileText, MessageSquare } from "lucide-react";
import Link from "next/link";
import { Trainee, getAllTrainees } from "@/services/trainee-service";
import { useAuth } from "@/hooks/use-auth";

export const dynamic = 'force-dynamic';

type TraineeWithCompletion = Trainee & { certificationCompleted?: boolean };

// Function to generate a *consistent* random completion status for demonstration
const generateConsistentCompletion = (id: string) => {
  // Use the trainee's ID to create a stable "random" value
  const numericId = parseInt(id.replace(/[^0-9]/g, '').slice(0, 5) || "0", 10);
  return (numericId % 2) === 0; // Even IDs are completed, odd are in progress
};

export default function AdminDashboard() {
  const [allFreshers, setAllFreshers] = useState<TraineeWithCompletion[]>([]);
  const { user, loading: authLoading } = useAuth();
  const [dataLoading, setDataLoading] = useState(true);


  useEffect(() => {
    if (!authLoading && user) {
      const fetchTrainees = async () => {
        setDataLoading(true);
        const trainees = await getAllTrainees();
        const traineesWithCompletion = trainees.map(t => ({
          ...t,
          certificationCompleted: generateConsistentCompletion(t.id),
        }));
        setAllFreshers(traineesWithCompletion);
        setDataLoading(false);
      };
      fetchTrainees();
    } else if (!authLoading && !user) {
      setDataLoading(false);
    }
  }, [user, authLoading]);

  const totalTrainees = allFreshers.length;
  const completedCount = allFreshers.filter(f => f.certificationCompleted).length;
  const onboardingCompletionRate = totalTrainees > 0 ? Math.round((completedCount / totalTrainees) * 100) : 0;
  
  const averageProgress = allFreshers.length > 0
    ? Math.round(allFreshers.reduce((acc, t) => acc + t.progress, 0) / allFreshers.length)
    : 0;

  const topPerformer = allFreshers.length > 0
    ? allFreshers.reduce((max, trainee) => trainee.progress > max.progress ? trainee : max, allFreshers[0])
    : null;
  
  if (authLoading || dataLoading) {
      return (
          <div className="flex justify-center items-center h-screen">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p className="ml-4">Loading Trainee Data...</p>
          </div>
      )
  }

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8">
      <header>
        <h1 className="text-4xl font-headline font-bold">Admin Console</h1>
        <p className="text-muted-foreground">Monitor and manage trainee onboarding.</p>
      </header>
      
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
         <Link href="/admin/trainee-management">
            <Card className="cursor-pointer hover:border-primary transition-colors h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Trainee Management</CardTitle>
                <UserCog className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{totalTrainees} Trainees</div>
                <p className="text-xs text-muted-foreground">Add, edit, and track trainees</p>
            </CardContent>
            </Card>
        </Link>
        <Link href="/admin/assessment-scores">
            <Card className="cursor-pointer hover:border-primary transition-colors h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Assessment Scores</CardTitle>
                <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">View Scores</div>
                <p className="text-xs text-muted-foreground">Check trainee assessment results</p>
              </CardContent>
            </Card>
        </Link>
        <Link href="/admin/certification-completion">
            <Card className="cursor-pointer hover:border-primary transition-colors h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Certification Completion</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{onboardingCompletionRate}%</div>
                <p className="text-xs text-muted-foreground">{completedCount} of {totalTrainees} trainees certified</p>
            </CardContent>
            </Card>
        </Link>
         <Link href="/admin/assignment-submissions">
            <Card className="cursor-pointer hover:border-primary transition-colors h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Assignment Submissions</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">View Submissions</div>
                <p className="text-xs text-muted-foreground">Review trainee assignments</p>
            </CardContent>
            </Card>
        </Link>
        <Link href="/admin/training-progress">
          <Card className="cursor-pointer hover:border-primary transition-colors h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Training Progress</CardTitle>
              <ListChecks className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Track Details</div>
              <p className="text-xs text-muted-foreground">View course and module progress</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/view-analysis">
          <Card className="cursor-pointer hover:border-primary transition-colors h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">View Analysis</CardTitle>
              <BarChart2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Visualize Data</div>
              <p className="text-xs text-muted-foreground">See performance charts and graphs</p>
            </CardContent>
          </Card>
        </Link>
         <Link href="/admin/messages">
            <Card className="cursor-pointer hover:border-primary transition-colors h-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Messages</CardTitle>
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">View Inbox</div>
                    <p className="text-xs text-muted-foreground">Chat with trainees and send announcements</p>
                </CardContent>
            </Card>
        </Link>
      </section>
    </div>
  );
}
