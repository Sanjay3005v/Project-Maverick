
'use client';

import { useEffect, useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trainee, getAllTrainees } from '@/services/trainee-service';
import { Loader2, CheckCircle, Clock, Link as LinkIcon, Search, ClipboardList, FilterX } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


export const dynamic = 'force-dynamic';

export default function AssignmentStatusPage() {
  const [trainees, setTrainees] = useState<Trainee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');

  useEffect(() => {
    const fetchTrainees = async () => {
      setLoading(true);
      const fetchedTrainees = await getAllTrainees();
      setTrainees(fetchedTrainees);
      setLoading(false);
    };

    fetchTrainees();
  }, []);

  const filteredTrainees = useMemo(() => {
    return trainees
      .filter(trainee => 
        trainee.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        trainee.onboardingPlan && trainee.onboardingPlan.length > 0
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
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-4">Loading Assignment Status...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="mb-8">
        <h1 className="text-4xl font-headline font-bold">Assignment Status</h1>
        <p className="text-muted-foreground">A detailed view of each trainee's task completion status.</p>
      </header>
      <Card>
        <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <CardTitle>
                        <ClipboardList className="mr-2 h-6 w-6" />
                        All Trainee Task Status ({filteredTrainees.length})
                    </CardTitle>
                    <CardDescription>
                        This list shows the status of each task in every trainee's onboarding plan.
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
          <Accordion type="multiple" className="w-full space-y-4">
            {filteredTrainees.map(trainee => (
                <AccordionItem key={trainee.id} value={trainee.id} className="border rounded-lg">
                    <AccordionTrigger className="p-4 hover:no-underline">
                        <div className="flex flex-col text-left">
                            <span className="font-bold text-lg">{trainee.name}</span>
                            <span className="text-sm text-muted-foreground">{trainee.department}</span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="p-0">
                        <div className="border-t">
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Week/Topic</TableHead>
                                        <TableHead>Task</TableHead>
                                        <TableHead className="text-right">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {trainee.onboardingPlan?.map((item, weekIndex) => (
                                        item.tasks.map((task, taskIndex) => (
                                            <TableRow key={`${weekIndex}-${taskIndex}`}>
                                                <TableCell className="font-medium">{taskIndex === 0 ? `${item.week}: ${item.topic}` : ''}</TableCell>
                                                <TableCell>
                                                    <p>{task.description}</p>
                                                    {task.type === 'link' && task.submittedLink && (
                                                        <a href={task.submittedLink} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1 mt-1">
                                                            <LinkIcon className="h-3 w-3" />
                                                            View Submission
                                                        </a>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                     {task.status === 'Completed' ? (
                                                        <Badge variant="default" className="gap-1.5 bg-green-500 text-white hover:bg-green-600">
                                                            <CheckCircle className="h-3.5 w-3.5" />
                                                            Completed
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="secondary" className="gap-1.5">
                                                            <Clock className="h-3.5 w-3.5" />
                                                            Pending
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </AccordionContent>
                </AccordionItem>
            ))}
            </Accordion>
            {filteredTrainees.length === 0 && (
                <div className="text-center py-16 text-muted-foreground">
                    No trainees with assigned plans match your search.
                </div>
            )}
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

