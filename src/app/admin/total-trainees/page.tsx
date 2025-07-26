
'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trainee, getAllTrainees } from '@/services/trainee-service';
import { Loader2, Users } from 'lucide-react';
import Link from 'next/link';

export default function TotalTraineesPage() {
  const [trainees, setTrainees] = useState<Trainee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrainees = async () => {
      setLoading(true);
      const fetchedTrainees = await getAllTrainees();
      setTrainees(fetchedTrainees);
      setLoading(false);
    };

    fetchTrainees();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-4">Loading Trainees...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="mb-8">
        <h1 className="text-4xl font-headline font-bold">Total Trainees</h1>
        <p className="text-muted-foreground">A complete list of all trainees in the system.</p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>
            <Users className="mr-2 h-6 w-6" />
            All Registered Trainees
          </CardTitle>
          <CardDescription>
            This list shows the name, email, and unique user ID for each trainee.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User ID</TableHead>
                  <TableHead>Trainee Name</TableHead>
                  <TableHead>Email ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trainees.map((trainee) => (
                  <TableRow key={trainee.id}>
                    <TableCell className="font-mono text-xs">{trainee.id}</TableCell>
                    <TableCell className="font-medium">{trainee.name}</TableCell>
                    <TableCell>{trainee.email}</TableCell>
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
