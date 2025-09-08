
'use client';

import { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Search, Wand2, UserCog, FilterX, BookOpenCheck, LoaderCircle, FileText, Users, UserPlus, Code, Sparkles, Box, ArrowUpDown } from "lucide-react";
import Link from "next/link";
import { ReportDialog } from "@/components/report-dialog";
import { Trainee, getAllTrainees } from "@/services/trainee-service";
import { GetOnTrackDialog } from "@/components/get-on-track-dialog";

export const dynamic = 'force-dynamic';

type SortableKeys = 'name' | 'email' | 'department' | 'batch' | 'status' | 'progress';

export default function TraineeManagementPage() {
  const [allTrainees, setAllTrainees] = useState<Trainee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [batchFilter, setBatchFilter] = useState<string>("all");
  const [sortConfig, setSortConfig] = useState<{ key: SortableKeys; direction: 'ascending' | 'descending' } | null>({ key: 'name', direction: 'ascending' });

  const fetchTrainees = async () => {
    setLoading(true);
    const trainees = await getAllTrainees();
    setAllTrainees(trainees);
    setLoading(false);
  };

  useEffect(() => {
    fetchTrainees();
  }, []);

  const requestSort = (key: SortableKeys) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedAndFilteredTrainees = useMemo(() => {
    let sortableTrainees = [...allTrainees];
    
    if (sortConfig !== null) {
      sortableTrainees.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue === undefined || aValue === null) return 1;
        if (bValue === undefined || bValue === null) return -1;
        
        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }

    return sortableTrainees
      .filter(trainee => 
        trainee.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter(trainee => 
        departmentFilter === 'all' || trainee.department === departmentFilter
      )
      .filter(trainee =>
        statusFilter === 'all' || trainee.status === statusFilter
      )
      .filter(trainee => 
        batchFilter === 'all' || trainee.batch === batchFilter
      );
  }, [allTrainees, searchTerm, departmentFilter, statusFilter, batchFilter, sortConfig]);
  
  const getStatusBadge = (status: string) => {
    switch (status) {
        case 'On Track':
            return <Badge className="bg-green-500 hover:bg-green-600 text-white">{status}</Badge>;
        case 'At Risk':
            return <Badge className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900">{status}</Badge>;
        case 'Need Attention':
            return <Badge variant="destructive">{status}</Badge>;
        case 'Not Started':
            return <Badge variant="secondary">{status}</Badge>;
        default:
            return <Badge variant="secondary">{status}</Badge>;
    }
  }

  const clearFilters = () => {
    setSearchTerm('');
    setDepartmentFilter('all');
    setStatusFilter('all');
    setBatchFilter('all');
    setSortConfig({ key: 'name', direction: 'ascending' });
  }

  const getSortIcon = (key: SortableKeys) => {
    if (!sortConfig || sortConfig.key !== key) {
        return <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />;
    }
    if (sortConfig.direction === 'ascending') {
        return <ArrowUpDown className="ml-2 h-4 w-4" />; // Or an up arrow
    }
    return <ArrowUpDown className="ml-2 h-4 w-4" />; // Or a down arrow
  };

  if (loading) {
      return (
          <div className="flex justify-center items-center h-screen">
              <LoaderCircle className="h-8 w-8 animate-spin" />
              <p className="ml-4">Loading Trainee Data...</p>
          </div>
      )
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="mb-8">
        <h1 className="text-4xl font-headline font-bold">Trainee Management</h1>
        <p className="text-muted-foreground">Search, filter, and view progress of all trainees.</p>
      </header>
       <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <CardTitle>
                    <Users className="mr-2 h-6 w-6" />
                    All Trainees ({sortedAndFilteredTrainees.length})
                    </CardTitle>
                    <CardDescription>
                        A complete list of all trainees in the system. Search, filter, and manage them from one place.
                    </CardDescription>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <ReportDialog trainees={allTrainees}>
                       <Button>
                          <FileText className="mr-2 h-4 w-4" />
                          Generate Report
                        </Button>
                    </ReportDialog>
                     <Link href="/admin/onboarding-plan">
                        <Button variant="outline">
                            <Wand2 className="mr-2 h-4 w-4" />
                            Onboarding Planner
                        </Button>
                    </Link>
                    <Link href="/admin/quizzes">
                        <Button variant="outline">
                            <BookOpenCheck className="mr-2 h-4 w-4" />
                            Manage Quizzes
                        </Button>
                    </Link>
                     <Link href="/admin/challenges">
                        <Button variant="outline">
                            <Code className="mr-2 h-4 w-4" />
                            Manage Challenges
                        </Button>
                    </Link>
                </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
              <div className="relative w-full md:flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                    placeholder="Search by name..." 
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
                  <SelectItem value="On Track">On Track</SelectItem>
                  <SelectItem value="At Risk">At Risk</SelectItem>
                  <SelectItem value="Need Attention">Need Attention</SelectItem>
                  <SelectItem value="Not Started">Not Started</SelectItem>
                </SelectContent>
              </Select>
              <Select value={batchFilter} onValueChange={setBatchFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Filter by Batch" />
                </SelectTrigger>
                <SelectContent>
                  {['all', ...new Set(allTrainees.map(t => t.batch).filter(Boolean))].map(batch => (
                    <SelectItem key={batch} value={batch!}>
                      {batch === 'all' ? 'All Batches' : batch}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {(departmentFilter !== 'all' || statusFilter !== 'all' || searchTerm || batchFilter !== 'all') && (
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
                    <TableHead>
                      <Button variant="ghost" onClick={() => requestSort('name')}>
                        Name {getSortIcon('name')}
                      </Button>
                    </TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>
                       <Button variant="ghost" onClick={() => requestSort('department')}>
                        Department {getSortIcon('department')}
                      </Button>
                    </TableHead>
                    <TableHead>
                       <Button variant="ghost" onClick={() => requestSort('batch')}>
                        Batch {getSortIcon('batch')}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button variant="ghost" onClick={() => requestSort('status')}>
                        Status {getSortIcon('status')}
                      </Button>
                    </TableHead>
                    <TableHead>
                       <Button variant="ghost" onClick={() => requestSort('progress')}>
                        Progress {getSortIcon('progress')}
                      </Button>
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedAndFilteredTrainees.map((fresher) => (
                    <TableRow key={fresher.id}>
                      <TableCell className="font-medium">{fresher.name}</TableCell>
                      <TableCell>{fresher.email}</TableCell>
                      <TableCell>{fresher.department}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="gap-1.5">
                            <Box className="h-3.5 w-3.5" />
                            {fresher.batch}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(fresher.status)}
                      </TableCell>
                       <TableCell>
                        <div className="flex items-center gap-3">
                           <Progress value={fresher.progress} className="w-32" />
                           <span className="text-sm text-muted-foreground w-8">{fresher.progress}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        { (fresher.status === 'At Risk' || fresher.status === 'Need Attention') &&
                          <GetOnTrackDialog trainee={fresher} onPlanAssigned={fetchTrainees}>
                            <Button variant="secondary" size="sm" className="mr-2">
                              <Sparkles className="mr-2 h-4 w-4" /> Get On Track
                            </Button>
                          </GetOnTrackDialog>
                        }
                        <Link href={`/admin/trainees?id=${fresher.id}`}>
                           <Button variant="ghost" size="icon">
                                <UserCog className="h-4 w-4" />
                                <span className="sr-only">Manage</span>
                           </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="flex justify-between items-center mt-6">
                <Link href="/admin/dashboard">
                    <Button variant="outline">Back to Dashboard</Button>
                </Link>
                <Link href="/admin/trainees">
                    <Button>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Add New Trainee
                    </Button>
                </Link>
            </div>
          </CardContent>
        </Card>
    </div>
  );
}
