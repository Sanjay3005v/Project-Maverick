
'use client';

import { useEffect, useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trainee, getAllTrainees } from '@/services/trainee-service';
import { Loader2, CheckCircle, Clock, Award, Circle, Search, FilterX } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const dynamic = 'force-dynamic';

type CompletionStatus = 'Completed' | 'In Progress' | 'Not Started';

const getCertificationStatus = (progress: number): CompletionStatus => {
  if (progress === 100) return 'Completed';
  if (progress > 0) return 'In Progress';
  return 'Not Started';
}

export default function CertificationCompletionPage() {
  const [trainees, setTrainees] = useState<(Trainee & { certificationStatus: CompletionStatus })[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchAndProcessTrainees = async () => {
      setLoading(true);
      const fetchedTrainees = await getAllTrainees();
      const traineesWithCompletion = fetchedTrainees.map(t => ({
        ...t,
        certificationStatus: getCertificationStatus(t.progress),
      }));
      setTrainees(traineesWithCompletion);
      setLoading(false);
    };

    fetchAndProcessTrainees();
  }, []);

  const filteredTrainees = useMemo(() => {
    return trainees
      .filter(trainee => 
        trainee.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter(trainee => 
        statusFilter === 'all' || trainee.certificationStatus === statusFilter
      );
  }, [trainees, searchTerm, statusFilter]);

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
  }


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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                  <CardTitle>
                    <Award className="mr-2 h-6 w-6" />
                    All Trainees Status ({filteredTrainees.length})
                  </CardTitle>
                  <CardDescription>
                    This list shows whether each trainee has completed their certification.
                  </CardDescription>
              </div>
               <div className="flex items-center gap-2 flex-wrap">
                 <div className="relative w-full sm:w-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input 
                        placeholder="Search by name..." 
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                 <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Not Started">Not Started</SelectItem>
                  </SelectContent>
                </Select>
                {(searchTerm || statusFilter !== 'all') && (
                  <Button variant="ghost" onClick={clearFilters}>
                    <FilterX className="mr-2 h-4 w-4" /> Clear
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
                  <TableHead>Trainee Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead className="text-right">Certification Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                 {filteredTrainees.length === 0 && (
                   <TableRow>
                        <TableCell colSpan={3} className="text-center h-24">No trainees found.</TableCell>
                    </TableRow>
                )}
                {filteredTrainees.map((trainee) => (
                  <TableRow key={trainee.id}>
                    <TableCell className="font-medium">{trainee.name}</TableCell>
                    <TableCell>{trainee.department}</TableCell>
                    <TableCell className="text-right">
                        {trainee.certificationStatus === 'Completed' ? (
                            <Badge variant="default" className="gap-1.5 bg-green-500 text-white hover:bg-green-600">
                                <CheckCircle className="h-3.5 w-3.5" />
                                Completed
                            </Badge>
                        ) : trainee.certificationStatus === 'In Progress' ? (
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
