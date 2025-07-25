
'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trainee, getAllTrainees } from '@/services/trainee-service';
import { Loader2, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

// Function to generate a random completion status for demonstration
const generateRandomCompletion = () => Math.random() > 0.5;

export default function CertificationCompletionPage() {
  const [trainees, setTrainees] = useState<(Trainee & { certificationCompleted: boolean })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAndProcessTrainees = async () => {
      setLoading(true);
      const fetchedTrainees = await getAllTrainees();
      const traineesWithCompletion = fetchedTrainees.map(t => ({
        ...t,
        certificationCompleted: generateRandomCompletion(),
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
        <p className="ml-4">Loading Certification Status...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="mb-8">
        <h1 className="text-4xl font-headline font-bold">Trainee Certification Status</h1>
        <p className="text-muted-foreground">A detailed view of each trainee's certification completion status.</p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>All Trainees Status</CardTitle>
          <CardDescription>
            This list shows whether each trainee has completed their certification. Note: Status is currently dummy data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Trainee Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead className="text-right">Certification Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trainees.map((trainee) => (
                  <TableRow key={trainee.id}>
                    <TableCell className="font-medium">{trainee.name}</TableCell>
                    <TableCell>{trainee.department}</TableCell>
                    <TableCell className="text-right">
                        {trainee.certificationCompleted ? (
                            <Badge variant="default" className="gap-1.5 bg-green-600 hover:bg-green-700">
                                <CheckCircle className="h-3.5 w-3.5" />
                                Completed
                            </Badge>
                        ) : (
                            <Badge variant="secondary" className="gap-1.5">
                                <Clock className="h-3.5 w-3.5" />
                                In Progress
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
