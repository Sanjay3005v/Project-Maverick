
'use client';

import { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, TrendingUp, Award, ClipboardCheck, ListChecks, BarChart2, Loader2, UserCog, Bell, FileText, Mail, CheckSquare, ListOrdered } from "lucide-react";
import Link from "next/link";
import { Trainee, getAllTrainees } from "@/services/trainee-service";
import { useAuth } from "@/hooks/use-auth";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export const dynamic = 'force-dynamic';

type TraineeWithCompletion = Trainee & { certificationCompleted?: boolean };
type SortOption = 'default' | 'alphabetical' | 'category';

// Function to generate a *consistent* random completion status for demonstration
const generateConsistentCompletion = (id: string) => {
  // Use the trainee's ID to create a stable "random" value
  const numericId = parseInt(id.replace(/[^0-9]/g, '').slice(0, 5) || "0", 10);
  return (numericId % 2) === 0; // Even IDs are completed, odd are in progress
};

const dashboardCardsList = [
    {
      href: "/admin/trainee-management",
      title: "Trainee Management",
      icon: <UserCog className="h-4 w-4 text-muted-foreground" />,
      description: "Add, edit, and track trainees",
      category: "Trainee Info",
    },
    {
      href: "/admin/assessment-scores",
      title: "Assessment Scores",
      icon: <ClipboardCheck className="h-4 w-4 text-muted-foreground" />,
      description: "Check trainee assessment results",
      category: "Performance",
    },
    {
      href: "/admin/certification-completion",
      title: "Certification Completion",
      icon: <Award className="h-4 w-4 text-muted-foreground" />,
      description: "View certification rates",
      category: "Performance",
    },
    {
      href: "/admin/assignment-submissions",
      title: "Assignment Submissions",
      icon: <FileText className="h-4 w-4 text-muted-foreground" />,
      description: "Inbox for submitted files",
      category: "Performance",
    },
    {
      href: "/admin/assignment-progress",
      title: "Assignment Progress",
      icon: <CheckSquare className="h-4 w-4 text-muted-foreground" />,
      description: "View submission status for all trainees",
      category: "Performance",
    },
    {
      href: "/admin/training-progress",
      title: "Training Progress",
      icon: <ListChecks className="h-4 w-4 text-muted-foreground" />,
      description: "View course and module progress",
      category: "Performance",
    },
    {
      href: "/admin/view-analysis",
      title: "View Analysis",
      icon: <BarChart2 className="h-4 w-4 text-muted-foreground" />,
      description: "See performance charts and graphs",
      category: "Performance",
    },
    {
      href: "/admin/mail",
      title: "Mail",
      icon: <Mail className="h-4 w-4 text-muted-foreground" />,
      description: "Send and receive mail",
      category: "Communication",
    },
];

export default function AdminDashboard() {
  const [allFreshers, setAllFreshers] = useState<TraineeWithCompletion[]>([]);
  const { user, loading: authLoading } = useAuth();
  const [dataLoading, setDataLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState<SortOption>('default');

  useEffect(() => {
    const savedSortOrder = localStorage.getItem('adminDashboardSortOrder') as SortOption | null;
    if (savedSortOrder) {
      setSortOrder(savedSortOrder);
    }
  }, []);

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
  
  const dashboardCards = useMemo(() => {
    const cardsWithValue = dashboardCardsList.map(card => {
        let value = '';
        if (card.title === "Trainee Management") value = `${totalTrainees} Trainees`;
        else if (card.title === "Certification Completion") value = `${onboardingCompletionRate}%`;
        else if (card.title === "Assessment Scores") value = `View Scores`;
        else if (card.title === "Assignment Submissions") value = `Review Submissions`;
        else if (card.title === "Assignment Progress") value = `Track Status`;
        else if (card.title === "Training Progress") value = `Track Details`;
        else if (card.title === "View Analysis") value = `Visualize Data`;
        else if (card.title === "Mail") value = `View Inbox`;
        return { ...card, value };
    });

    switch (sortOrder) {
        case 'alphabetical':
            return [...cardsWithValue].sort((a, b) => a.title.localeCompare(b.title));
        case 'category':
            const categoryOrder = ['Trainee Info', 'Performance', 'Content Management', 'Communication'];
            return [...cardsWithValue].sort((a, b) => {
                const categoryAIndex = categoryOrder.indexOf(a.category);
                const categoryBIndex = categoryOrder.indexOf(b.category);
                if (categoryAIndex !== categoryBIndex) {
                    return categoryAIndex - categoryBIndex;
                }
                return a.title.localeCompare(b.title);
            });
        case 'default':
        default:
            return cardsWithValue;
    }
  }, [sortOrder, totalTrainees, onboardingCompletionRate]);

  const handleSortChange = (value: SortOption) => {
    setSortOrder(value);
    localStorage.setItem('adminDashboardSortOrder', value);
  }

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
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-headline font-bold">Admin Console</h1>
          <p className="text-muted-foreground">Monitor and manage trainee onboarding.</p>
        </div>
        <div className="flex items-center gap-2">
            <ListOrdered className="h-5 w-5 text-muted-foreground"/>
            <Select value={sortOrder} onValueChange={handleSortChange}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort cards by..." />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="alphabetical">Alphabetical</SelectItem>
                    <SelectItem value="category">Category</SelectItem>
                </SelectContent>
            </Select>
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
