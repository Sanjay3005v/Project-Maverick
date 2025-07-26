
'use client';

import { useEffect, useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trainee, getAllTrainees } from '@/services/trainee-service';
import { Loader2, Users, Search } from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';

export default function TotalTraineesPage() {
  const [trainees, setTrainees] = useState<Trainee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchTrainees = async () => {
      setLoading(true);
      const fetchedTrainees = await getAllTrainees();
      setTrainees(fetchedTrainees);
      setLoading(false);
    };

    fetchTrainees();
  }, []);

  const formatUserId = (id: string) => {
    // A simple, consistent way to create a numeric-like ID from the alphanumeric original
    const numericPart = parseInt(id.replace(/[^0-9]/g, '').slice(0, 5) || "0", 10);
    const letterPart = (id.replace(/[^a-zA-Z]/g, '').charCodeAt(0) || 0) % 100;
    const combinedId = (numericPart + letterPart * 100000);
    return combinedId.toString().padStart(7, '0');
  };
  
  const filteredTrainees = useMemo(() => {
    return trainees.filter(trainee => 
      trainee.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [trainees, searchTerm]);

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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <CardTitle>
                        <Users className="mr-2 h-6 w-6" />
                        All Registered Trainees
                    </CardTitle>
                    <CardDescription>
                        This list shows the name, email, and unique user ID for each trainee.
                    </CardDescription>
                </div>
                 <div className="relative w-full sm:w-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input 
                        placeholder="Search by name..." 
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
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
                {filteredTrainees.map((trainee) => (
                  <TableRow key={trainee.id}>
                    <TableCell className="font-mono text-xs">{formatUserId(trainee.id)}</TableCell>
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
