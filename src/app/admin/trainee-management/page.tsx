
'use client';

import { useState, useEffect } from "react";
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
import { Search, Wand2, UserCog, FilterX, BookOpenCheck, Loader2 } from "lucide-react";
import Link from "next/link";
import { ReportDialog } from "@/components/report-dialog";
import { Trainee, getAllTrainees } from "@/services/trainee-service";

export default function TraineeManagementPage() {
  const [allFreshers, setAllFreshers] = useState<Trainee[]>([]);
  const [filteredFreshers, setFilteredFreshers] = useState<Trainee[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrainees = async () => {
      setLoading(true);
      const trainees = await getAllTrainees();
      setAllFreshers(trainees);
      setFilteredFreshers(trainees);
      setLoading(false);
    };
    fetchTrainees();
  }, []);

  const handleClearFilter = () => {
    setFilteredFreshers(allFreshers);
    setFilter(null);
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
            <div className="flex justify-between items-center">
                <CardTitle className="font-headline">All Trainees</CardTitle>
              {filter && (
                 <Button variant="ghost" onClick={handleClearFilter}>
                    <FilterX className="mr-2 h-4 w-4" />
                    Clear Filter ({filter})
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
              <div className="relative w-full md:flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input placeholder="Search by name..." className="pl-10" />
              </div>
              <Select>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Filter by Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="engineering">Engineering</SelectItem>
                  <SelectItem value="product">Product</SelectItem>
                  <SelectItem value="design">Design</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex gap-2 w-full flex-wrap md:w-auto md:flex-nowrap">
                <Link href="/admin/onboarding-plan" className="w-full md:w-auto">
                    <Button variant="outline" className="w-full">
                        <Wand2 className="mr-2 h-4 w-4" />
                        Onboarding Planner
                    </Button>
                </Link>
                <Link href="/admin/quizzes" className="w-full md:w-auto">
                    <Button variant="outline" className="w-full">
                        <BookOpenCheck className="mr-2 h-4 w-4" />
                        Manage Quizzes
                    </Button>
                </Link>
                <ReportDialog trainees={allFreshers} />
              </div>
            </div>
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFreshers.map((fresher) => (
                    <TableRow key={fresher.id}>
                      <TableCell className="font-medium">{fresher.name}</TableCell>
                      <TableCell>{fresher.department}</TableCell>
                      <TableCell>
                        <Badge variant={
                          fresher.status === 'On Track' ? 'secondary' :
                          fresher.progress === 100 || fresher.status === 'Exceeding' ? 'default' :
                          'destructive'
                        }>{fresher.status}</Badge>
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
                    <Button>Add New Trainee</Button>
                </Link>
            </div>
          </CardContent>
        </Card>
    </div>
  );
}
