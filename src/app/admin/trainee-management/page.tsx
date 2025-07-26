
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
import { Search, Wand2, UserCog, FilterX, BookOpenCheck, Loader2, FileText, Users, UserPlus } from "lucide-react";
import Link from "next/link";
import { ReportDialog } from "@/components/report-dialog";
import { Trainee, getAllTrainees } from "@/services/trainee-service";

export default function TraineeManagementPage() {
  const [allTrainees, setAllTrainees] = useState<Trainee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    const fetchTrainees = async () => {
      setLoading(true);
      const trainees = await getAllTrainees();
      setAllTrainees(trainees);
      setLoading(false);
    };
    fetchTrainees();
  }, []);

  const formatUserId = (id: string) => {
    const numericPart = parseInt(id.replace(/[^0-9]/g, '').slice(0, 5) || "0", 10);
    const letterPart = (id.replace(/[^a-zA-Z]/g, '').charCodeAt(0) || 0) % 100;
    const combinedId = (numericPart + letterPart * 100000);
    return combinedId.toString().padStart(7, '0');
  };

  const filteredTrainees = useMemo(() => {
    return allTrainees
      .filter(trainee => 
        trainee.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter(trainee => 
        departmentFilter === 'all' || trainee.department === departmentFilter
      )
      .filter(trainee =>
        statusFilter === 'all' || trainee.status === statusFilter
      );
  }, [allTrainees, searchTerm, departmentFilter, statusFilter]);
  
  const getStatusBadge = (status: string) => {
    switch (status) {
        case 'On Track':
            return <Badge className="bg-green-500 hover:bg-green-600 text-white">{status}</Badge>;
        case 'At Risk':
            return <Badge className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900">{status}</Badge>;
        case 'Need Attention':
            return <Badge variant="destructive">{status}</Badge>;
        default:
            return <Badge variant="secondary">{status}</Badge>;
    }
  }

  if (loading) {
      return (
          <div className="flex justify-center items-center h-screen">
              <Loader2 className="h-8 w-8 animate-spin" />
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
                <CardTitle>
                  <Users className="mr-2 h-6 w-6" />
                  All Trainees ({filteredTrainees.length})
                </CardTitle>
                <div className="flex items-center gap-2">
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
                </div>
            </div>
             <CardDescription>
                A complete list of all trainees in the system. Search, filter, and manage them from one place.
            </CardDescription>
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
                </SelectContent>
              </Select>
              {(departmentFilter !== 'all' || statusFilter !== 'all' || searchTerm) && (
                <Button variant="ghost" onClick={() => { setSearchTerm(''); setDepartmentFilter('all'); setStatusFilter('all'); }}>
                    <FilterX className="mr-2 h-4 w-4" />
                    Clear Filters
                </Button>
              )}
            </div>
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTrainees.map((fresher) => (
                    <TableRow key={fresher.id}>
                      <TableCell className="font-mono text-xs">{formatUserId(fresher.id)}</TableCell>
                      <TableCell className="font-medium">{fresher.name}</TableCell>
                      <TableCell>{fresher.email}</TableCell>
                      <TableCell>{fresher.department}</TableCell>
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
