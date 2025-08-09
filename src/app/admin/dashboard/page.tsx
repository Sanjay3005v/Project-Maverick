
'use client';

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UserCog, ClipboardCheck, Award, FileText, CheckSquare, ListChecks, BarChart2, Mail, Loader2 } from "lucide-react";
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
  
  const dashboardCards = [
    {
      href: "/admin/trainee-management",
      title: "Trainee Management",
      icon: <UserCog className="h-4 w-4 text-muted-foreground" />,
      description: "Add, edit, and track trainees",
      value: `${totalTrainees} Trainees`
    },
    {
      href: "/admin/assessment-scores",
      title: "Assessment Scores",
      icon: <ClipboardCheck className="h-4 w-4 text-muted-foreground" />,
      description: "Check trainee assessment results",
      value: "View Scores"
    },
    {
      href: "/admin/certification-completion",
      title: "Certification Completion",
      icon: <Award className="h-4 w-4 text-muted-foreground" />,
      description: "View certification rates",
      value: `${onboardingCompletionRate}%`
    },
    {
      href: "/admin/assignment-submissions",
      title: "Assignment Submissions",
      icon: <FileText className="h-4 w-4 text-muted-foreground" />,
      description: "Inbox for submitted files",
      value: "Review Submissions"
    },
    {
      href: "/admin/assignment-progress",
      title: "Assignment Progress",
      icon: <CheckSquare className="h-4 w-4 text-muted-foreground" />,
      description: "View submission status for all trainees",
      value: "Track Status"
    },
    {
      href: "/admin/training-progress",
      title: "Training Progress",
      icon: <ListChecks className="h-4 w-4 text-muted-foreground" />,
      description: "View course and module progress",
      value: "Track Details"
    },
    {
      href: "/admin/view-analysis",
      title: "View Analysis",
      icon: <BarChart2 className="h-4 w-4 text-muted-foreground" />,
      description: "See performance charts and graphs",
      value: "Visualize Data"
    },
    {
      href: "/admin/mail",
      title: "Mail",
      icon: <Mail className="h-4 w-4 text-muted-foreground" />,
      description: "Send and receive mail",
      value: "View Inbox"
    },
];

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
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-headline font-bold">Admin Console</h1>
          <p className="text-muted-foreground">Monitor and manage trainee onboarding.</p>
        </div>
      </header>
      
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {dashboardCards.map((card, index) => (
             <Link href={card.href} key={card.href} className="animate-fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
                <Card className="cursor-pointer hover:border-primary transition-colors h-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                    {card.icon}
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{card.value}</div>
                    <p className="text-xs text-muted-foreground">{card.description}</p>
                </CardContent>
                </Card>
            </Link>
        ))}
      </section>
    </div>
  );
}
