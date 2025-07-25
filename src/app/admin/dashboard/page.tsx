
'use client';

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, TrendingUp, Award, ClipboardCheck, ListChecks, BarChart2, Loader2 } from "lucide-react";
import Link from "next/link";
import { Trainee, getAllTrainees } from "@/services/trainee-service";

export default function AdminDashboard() {
  const [allFreshers, setAllFreshers] = useState<Trainee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrainees = async () => {
      setLoading(true);
      const trainees = await getAllTrainees();
      setAllFreshers(trainees);
      setLoading(false);
    };
    fetchTrainees();
  }, []);

  const totalTrainees = allFreshers.length;
  const completedCount = allFreshers.filter(f => f.progress === 100).length;
  const onboardingCompletionRate = totalTrainees > 0 ? Math.round((completedCount / totalTrainees) * 100) : 0;
  const averageProgress = 78;
  
  if (loading) {
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
      
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/admin/trainee-management">
            <Card className="cursor-pointer hover:border-primary transition-colors h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Trainees</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalTrainees}</div>
                <p className="text-xs text-muted-foreground">Click to manage all trainees</p>
              </CardContent>
            </Card>
        </Link>
         <Link href="/admin/trainee-management">
            <Card className="cursor-pointer hover:border-primary transition-colors h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Progress</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{averageProgress}%</div>
                <p className="text-xs text-muted-foreground">Overall progress of the cohort</p>
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
                <p className="text-xs text-muted-foreground">{completedCount} trainees certified</p>
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
      </section>
    </div>
  );
}
