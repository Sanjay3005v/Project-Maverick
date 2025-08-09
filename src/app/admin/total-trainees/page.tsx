
'use client';

import { useEffect, useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trainee, getAllTrainees } from '@/services/trainee-service';
import { Loader2, Users, Search, FilterX } from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


export const dynamic = 'force-dynamic';

export default function TotalTraineesPage() {
  const [trainees, setTrainees] = useState<Trainee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [batchFilter, setBatchFilter] = useState('all');

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
  
  const uniqueBatches = useMemo(() => {
    const batches = new Set(trainees.map(t => t.batch).filter(Boolean));
    return Array.from(batches).sort();
  }, [trainees]);
  
  const filteredTrainees = useMemo(() => {
    return trainees
      .filter(trainee => 
        trainee.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter(trainee => 
        batchFilter === 'all' || trainee.batch === batchFilter
      );
  }, [trainees, searchTerm, batchFilter]);

  const clearFilters = () => {
    setSearchTerm('');
    setBatchFilter('all');
  }

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
                 <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input 
                            placeholder="Search by name..." 
                            className="pl-10 w-full"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                     <Select value={batchFilter} onValueChange={setBatchFilter}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Filter by Batch" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Batches</SelectItem>
                            {uniqueBatches.map(batch => (
                                <SelectItem key={batch} value={batch}>{batch}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                     {(searchTerm || batchFilter !== 'all') && (
                        <Button variant="ghost" onClick={clearFilters}>
                            <FilterX className="mr-2 h-4 w-4" />
                            Clear
                        </Button>
                    )}
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
                  <TableHead>Batch</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTrainees.map((trainee) => (
                  <TableRow key={trainee.id}>
                    <TableCell className="font-mono text-xs">{formatUserId(trainee.id)}</TableCell>
                    <TableCell className="font-medium">{trainee.name}</TableCell>
                    <TableCell>{trainee.email}</TableCell>
                    <TableCell>{trainee.batch}</TableCell>
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
