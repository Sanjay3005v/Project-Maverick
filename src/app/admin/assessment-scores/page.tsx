
'use client';

import { useEffect, useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trainee, getAllTrainees } from '@/services/trainee-service';
import { LoaderCircle, ClipboardCheck, Search, FilterX } from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const dynamic = 'force-dynamic';

// Function to generate a random score for demonstration
const generateRandomScore = () => Math.floor(Math.random() * 41) + 60; // Score between 60 and 100

export default function AssessmentScoresPage() {
  const [trainees, setTrainees] = useState<Trainee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');

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

  const filteredTrainees = useMemo(() => {
    return trainees
      .filter(trainee => 
        trainee.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter(trainee => 
        departmentFilter === 'all' || trainee.department === departmentFilter
      );
  }, [trainees, searchTerm, departmentFilter]);

  const clearFilters = () => {
    setSearchTerm('');
    setDepartmentFilter('all');
  }

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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle>
                  <ClipboardCheck className="mr-2 h-6 w-6" />
                  All Trainees ({filteredTrainees.length})
                </CardTitle>
                <CardDescription>
                  This list shows the assessment scores for each trainee. Note: Scores are currently dummy data.
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
                 <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    <SelectItem value="Engineering">Engineering</SelectItem>
                    <SelectItem value="Product">Product</SelectItem>
                    <SelectItem value="Design">Design</SelectItem>
                  </SelectContent>
                </Select>
                {(searchTerm || departmentFilter !== 'all') && (
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
                  <TableHead className="text-right">Assessment Score</TableHead>
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
