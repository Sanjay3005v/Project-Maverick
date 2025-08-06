
'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BookOpenCheck, Code2, FileText, Award, Route, LoaderCircle, Trophy, Star, Trash2 } from "lucide-react";
import Link from "next/link";
import { useAuth } from '@/hooks/use-auth';
import { Trainee, getTraineeByEmail, deleteTraineeAccount } from '@/services/trainee-service';
import { getAllChallenges, Challenge } from '@/services/challenge-service';
import { Heatmap } from '@/components/heatmap';
import { AvatarUploader } from '@/components/avatar-uploader';
import { getBadgesForTrainee, Badge } from '@/lib/badges';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export const dynamic = 'force-dynamic';

function DeleteAccountButton({ traineeId }: { traineeId: string }) {
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    const handleDelete = async () => {
        setLoading(true);
        try {
            await deleteTraineeAccount(traineeId);
            toast({
                title: 'Account Deleted',
                description: 'Your account has been permanently deleted.',
            });
            // The auth provider will handle redirecting to /login
            router.push('/login');
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Deletion Failed',
                description: error.message || 'An unexpected error occurred.',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                    <Trash2 className="mr-2" /> Delete Account
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your account and all of your data from our servers.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} disabled={loading}>
                        {loading ? <LoaderCircle className="animate-spin mr-2"/> : null}
                        Continue
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export default function TraineeDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [trainee, setTrainee] = useState<Trainee | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [earnedBadges, setEarnedBadges] = useState<Badge[]>([]);

  const fetchTrainee = async () => {
      if (user?.email) {
        setDataLoading(true);
        const [traineeData, challengesData] = await Promise.all([
            getTraineeByEmail(user.email),
            getAllChallenges()
        ]);
        setTrainee(traineeData);
        setChallenges(challengesData);
        if (traineeData) {
            setEarnedBadges(getBadgesForTrainee(traineeData, challengesData.length));
        }
        setDataLoading(false);
      }
  }

  useEffect(() => {
    if (!authLoading && user?.email) {
      fetchTrainee();
    } else if (!authLoading && !user) {
      setDataLoading(false);
    }
  }, [user, authLoading]);

  if (authLoading || dataLoading) {
    return (
        <div className="flex justify-center items-center h-screen">
            <LoaderCircle className="h-8 w-8 animate-spin" />
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

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('');
  }
  const completedChallenges = trainee.completedChallengeIds?.length || 0;
  const totalChallenges = challenges.length;


  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8">
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1 flex flex-col">
          <CardHeader className="flex flex-row items-center gap-4 space-y-0">
            <div className="relative group">
                <Avatar className="h-16 w-16">
                    <AvatarImage src={trainee.avatarUrl} data-ai-hint="person portrait" />
                    <AvatarFallback>{getInitials(trainee.name)}</AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                    <AvatarUploader trainee={trainee} onUploadComplete={fetchTrainee} />
                </div>
            </div>
            <div>
              <CardTitle className="font-headline text-2xl">Welcome, {trainee.name}!</CardTitle>
              <CardDescription>Trainee, {trainee.department} Department</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-muted-foreground">
              Your personalized journey at Maverick Mindset starts now. Stay on top of your tasks and make the most of your onboarding.
            </p>
          </CardContent>
          <CardFooter>
            <DeleteAccountButton traineeId={trainee.id} />
          </CardFooter>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-headline">Daily Quiz Activity</CardTitle>
            <CardDescription>A heatmap of your daily quiz scores over the past year.</CardDescription>
          </CardHeader>
          <CardContent>
             <Heatmap quizCompletions={trainee.quizCompletions || []} />
          </CardContent>
        </Card>
      </section>

       <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Link href="/trainee/onboarding-plan">
            <Card className="hover:border-primary transition-colors h-full">
                <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-headline">My Onboarding Plan</CardTitle>
                    <Route className="h-6 w-6 text-muted-foreground" />
                </div>
                </CardHeader>
                <CardContent>
                <p className="text-sm text-muted-foreground">Generate or update your personalized plan.</p>
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
              <p className="text-sm text-muted-foreground">{completedChallenges} / {totalChallenges} Completed</p>
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
              <p className="text-sm text-muted-foreground">View your plan and submit your work.</p>
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
              <p className="text-sm text-muted-foreground">View your achievements</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/trainee/leaderboard">
            <Card className="hover:border-primary transition-colors h-full">
                <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-headline">Leaderboard</CardTitle>
                    <Trophy className="h-6 w-6 text-muted-foreground" />
                </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">See top performers</p>
                </CardContent>
            </Card>
        </Link>
      </section>

      {earnedBadges.length > 0 && (
        <section>
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Your Achievements</CardTitle>
                    <CardDescription>A collection of badges you've earned for your hard work and performance.</CardDescription>
                </CardHeader>
                <CardContent>
                  <TooltipProvider>
                    <div className="flex flex-wrap gap-6">
                        {earnedBadges.map((badge) => (
                           <Tooltip key={badge.name} delayDuration={100}>
                            <TooltipTrigger>
                                <div className="flex flex-col items-center gap-2">
                                    <div className="h-16 w-16 rounded-full flex items-center justify-center" style={{ backgroundColor: badge.bgColor }}>
                                        <badge.icon className="h-8 w-8" style={{ color: badge.color }} />
                                    </div>
                                    <p className="text-sm font-medium">{badge.name}</p>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{badge.description}</p>
                            </TooltipContent>
                        </Tooltip>
                        ))}
                    </div>
                   </TooltipProvider>
                </CardContent>
            </Card>
        </section>
      )}

    </div>
  );
}
