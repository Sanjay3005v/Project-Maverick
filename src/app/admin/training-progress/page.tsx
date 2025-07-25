
'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trainee, getAllTrainees } from '@/services/trainee-service';
import { Loader2, CheckCircle, Clock, ListChecks, Circle } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

type TrainingStatus = 'Completed' | 'In Progress' | 'Not Started';

// Function to generate a *consistent* random completion status for demonstration
const generateConsistentCompletion = (id: string): TrainingStatus => {
  const numericId = parseInt(id.replace(/[^0-9]/g, '').slice(0, 5) || "0", 10);
  const statusIndex = numericId % 3;
  if (statusIndex === 0) return 'Completed';
  if (statusIndex === 1) return 'In Progress';
  return 'Not Started';
};

export default function TrainingProgressPage() {
  const [trainees, setTrainees] = useState<(Trainee & { trainingStatus: TrainingStatus })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAndProcessTrainees = async () => {
      setLoading(true);
      const fetchedTrainees = await getAllTrainees();
      const traineesWithCompletion = fetchedTrainees.map(t => ({
        ...t,
        trainingStatus: generateConsistentCompletion(t.id),
      }));
      setTrainees(traineesWithCompletion);
      setLoading(false);
    };

    fetchAndProcessTrainees();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-4">Loading Training Progress...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="mb-8">
        <h1 className="text-4xl font-headline font-bold">Training Progress</h1>
        <p className="text-muted-foreground">
          A detailed view of each trainee's overall training completion status.
        </p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>
            <ListChecks className="mr-2 h-6 w-6" />
            All Trainees Status
          </CardTitle>
          <CardDescription>
            This list shows whether each trainee has completed their assigned training modules. Note: Status is currently dummy data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Trainee Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead className="text-right">Training Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trainees.map((trainee) => (
                  <TableRow key={trainee.id}>
                    <TableCell className="font-medium">{trainee.name}</TableCell>
                    <TableCell>{trainee.department}</TableCell>
                    <TableCell className="text-right">
                        {trainee.trainingStatus === 'Completed' ? (
                             <Badge variant="default" className="gap-1.5 bg-green-500 text-white hover:bg-green-600">
                                <CheckCircle className="h-3.5 w-3.5" />
                                Completed
                            </Badge>
                        ) : trainee.trainingStatus === 'In Progress' ? (
                            <Badge variant="secondary" className="gap-1.5 bg-yellow-400 text-yellow-900 hover:bg-yellow-500">
                                <Clock className="h-3.5 w-3.5" />
                                In Progress
                            </Badge>
                        ) : (
                            <Badge variant="secondary" className="gap-1.5 bg-gray-400 text-gray-900 hover:bg-gray-500">
                                <Circle className="h-3.5 w-3.5" />
                                Not Started
                            </Badge>
                        )}
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
