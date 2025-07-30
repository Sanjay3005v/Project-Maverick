
'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trainee, getAllTrainees } from '@/services/trainee-service';
import { LoaderCircle, ClipboardCheck } from 'lucide-react';
import Link from 'next/link';

// Function to generate a random score for demonstration
const generateRandomScore = () => Math.floor(Math.random() * 41) + 60; // Score between 60 and 100

export default function AssessmentScoresPage() {
  const [trainees, setTrainees] = useState<Trainee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAndProcessTrainees = async () => {
      setLoading(true);
      const fetchedTrainees = await getAllTrainees();
      const traineesWithScores = fetchedTrainees.map(t => ({
        ...t,
        assessmentScore: t.assessmentScore || generateRandomScore(),
      }));
      setTrainees(traineesWithScores);
      setLoading(false);
    };

    fetchAndProcessTrainees();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoaderCircle className="h-8 w-8 animate-spin" />
        <p className="ml-4">Loading Assessment Scores...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="mb-8">
        <h1 className="text-4xl font-headline font-bold">Trainee Assessment Scores</h1>
        <p className="text-muted-foreground">A consolidated view of assessment scores for all trainees.</p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>
            <ClipboardCheck className="mr-2 h-6 w-6" />
            All Trainees
          </CardTitle>
          <CardDescription>
            This list shows the assessment scores for each trainee. Note: Scores are currently dummy data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Trainee Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead className="text-right">Assessment Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trainees.map((trainee) => (
                  <TableRow key={trainee.id}>
                    <TableCell className="font-medium">{trainee.name}</TableCell>
                    <TableCell>{trainee.department}</TableCell>
                    <TableCell className="text-right font-bold text-lg">
                      {trainee.assessmentScore}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      <div className="text-center mt-12">
        <Link href="/admin/dashboard">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
