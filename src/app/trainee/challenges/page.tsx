
'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Challenge, getAllChallenges } from "@/services/challenge-service";
import { Code2, LoaderCircle, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from 'react';
import { useAuth } from "@/hooks/use-auth";
import { Trainee, getTraineeByEmail } from "@/services/trainee-service";
import { Badge } from "@/components/ui/badge";

export const dynamic = 'force-dynamic';

export default function CodingChallengesPage() {
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [trainee, setTrainee] = useState<Trainee | null>(null);
    const [loading, setLoading] = useState(true);
    const { user, loading: authLoading } = useAuth();

    useEffect(() => {
        const fetchAndProcessData = async () => {
            setLoading(true);
            const [fetchedChallenges, fetchedTrainee] = await Promise.all([
                getAllChallenges(),
                user?.email ? getTraineeByEmail(user.email) : Promise.resolve(null)
            ]);
            
            setChallenges(fetchedChallenges);
            setTrainee(fetchedTrainee);
            setLoading(false);
        }

        if (!authLoading) {
           fetchAndProcessData();
        }
    }, [user, authLoading]);

    if (loading || authLoading) {
        return (
          <div className="flex justify-center items-center h-screen">
            <LoaderCircle className="h-8 w-8 animate-spin" />
            <p className="ml-4">Loading Challenges...</p>
          </div>
        );
    }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="mb-8">
        <h1 className="text-4xl font-headline font-bold">Coding Challenges</h1>
        <p className="text-muted-foreground">Sharpen your skills with these hands-on challenges.</p>
      </header>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {challenges.map((challenge) => {
          const isCompleted = trainee?.completedChallengeIds?.includes(challenge.id);
          return (
          <Card key={challenge.id} className="flex flex-col">
            <CardHeader>
              <div className="flex justify-between items-start">
                  <CardTitle>{challenge.title}</CardTitle>
                   <div className="flex items-center gap-2">
                        {isCompleted && (
                            <Badge variant="default" className="bg-green-500 hover:bg-green-600 gap-1.5">
                                <CheckCircle className="h-3.5 w-3.5" />
                                Completed
                            </Badge>
                        )}
                        <span className="text-xs font-semibold px-2 py-1 rounded-full bg-secondary text-secondary-foreground">{challenge.difficulty}</span>
                   </div>
              </div>
              <CardDescription>{challenge.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
                <div className="flex flex-wrap gap-2">
                    {challenge.tags.map(tag => <span key={tag} className="text-xs px-2 py-0.5 rounded-md bg-primary/10 text-primary">{tag}</span>)}
                </div>
            </CardContent>
            <CardFooter>
              <Link href={`/trainee/challenges/${challenge.id}`} className="w-full">
                <Button className="w-full" variant={isCompleted ? "secondary" : "default"}>
                  {isCompleted ? 'View Challenge' : <><Code2 className="mr-2 h-4 w-4" /> Start Challenge</>}
                </Button>
              </Link>
            </CardFooter>
          </Card>
        )})}
      </div>
      <div className="text-center mt-12">
          <Link href="/trainee/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
      </div>
    </div>
  );
}
