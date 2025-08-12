
'use client';

import { useEffect, useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, CheckSquare, Search, FilterX, Clock, CheckCircle, Eye } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { Assignment, getAllAssignments } from '@/services/assignment-service';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const dynamic = 'force-dynamic';

export default function AssignmentTrackingPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchAssignments = async () => {
      setLoading(true);
      const fetchedAssignments = await getAllAssignments();
      setAssignments(fetchedAssignments);
      setLoading(false);
    };

    fetchAssignments();
  }, []);

  const clearFilters = () => {
    setSearchTerm('');
    setDepartmentFilter('all');
    setStatusFilter('all');
  };

  const filteredAssignments = useMemo(() => {
    return assignments
      .filter(assignment =>
        assignment.traineeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assignment.assignmentTitle.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter(assignment =>
        departmentFilter === 'all' || assignment.department === departmentFilter
      )
      .filter(assignment =>
        statusFilter === 'all' || assignment.status === statusFilter
      );
  }, [assignments, searchTerm, departmentFilter, statusFilter]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-4">Loading Assignment Data...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="mb-8">
        <h1 className="text-4xl font-headline font-bold">Assignment Tracking</h1>
        <p className="text-muted-foreground">Monitor the status of all assignments across all trainees.</p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>
            <CheckSquare className="mr-2 h-6 w-6" />
            All Assignments
          </CardTitle>
          <CardDescription>
            A consolidated list of every task from every trainee's onboarding plan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
            <div className="relative w-full md:flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search by trainee or assignment..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="Engineering">Engineering</SelectItem>
                <SelectItem value="Product">Product</SelectItem>
                <SelectItem value="Design">Design</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Submitted">Submitted</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            {(departmentFilter !== 'all' || statusFilter !== 'all' || searchTerm) && (
              <Button variant="ghost" onClick={clearFilters}>
                <FilterX className="mr-2 h-4 w-4" />
                Clear Filters
              </Button>
            )}
          </div>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Trainee Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Assignment</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssignments.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center h-24">No assignments match your filters.</TableCell>
                  </TableRow>
                )}
                {filteredAssignments.map((assignment) => (
                  <TableRow key={assignment.id}>
                    <TableCell className="font-medium">{assignment.traineeName}</TableCell>
                    <TableCell>{assignment.department}</TableCell>
                    <TableCell>{assignment.assignmentTitle}</TableCell>
                    <TableCell className="text-right">
                      {assignment.status === 'Submitted' ? (
                        <Badge variant="default" className="gap-1.5 bg-green-500 text-white hover:bg-green-600">
                          <CheckCircle className="h-3.5 w-3.5" />
                          Submitted
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1.5">
                          <Clock className="h-3.5 w-3.5" />
                          Pending
                        </Badge>
                      )}
                      {assignment.submissionId && (
                         <Link href={`/admin/assignment-submissions/${assignment.submissionId}`}>
                            <Button variant="ghost" size="icon" className="ml-2">
                                <Eye className="h-4 w-4" />
                                <span className="sr-only">View Submission</span>
                            </Button>
                         </Link>
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
