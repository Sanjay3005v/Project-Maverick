
'use client';

import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trainee, getAllTrainees } from '@/services/trainee-service';
import { Submission, getAllSubmissions } from '@/services/submission-service';
import { Loader2, FilterX, CheckCircle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { Button } from './ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Progress } from './ui/progress';

type AssignmentStatus = {
    traineeId: string;
    traineeName: string;
    traineeDepartment: string;
    traineeBatch: string;
    submission: Submission | null;
};

type GroupedAssignment = {
    title: string;
    statuses: AssignmentStatus[];
    completionRate: number;
};


export const AssignmentProgressTable = () => {
    const [allTrainees, setAllTrainees] = useState<Trainee[]>([]);
    const [allSubmissions, setAllSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);

    const [departmentFilter, setDepartmentFilter] = useState('all');
    const [batchFilter, setBatchFilter] = useState('all');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const [trainees, submissions] = await Promise.all([
                getAllTrainees(),
                getAllSubmissions(),
            ]);
            setAllTrainees(trainees);
            setAllSubmissions(submissions);
            setLoading(false);
        };
        fetchData();
    }, []);

    const uniqueDepartments = useMemo(() => {
        return [...new Set(allTrainees.map(t => t.department))].sort();
    }, [allTrainees]);

    const uniqueBatches = useMemo(() => {
        const batches = new Set(allTrainees.map(t => t.batch).filter(Boolean));
        return Array.from(batches).sort();
    }, [allTrainees]);

    const groupedAssignments = useMemo(() => {
        const submissionMap = new Map(allSubmissions.map(s => [`${s.traineeId}-${s.assignmentTitle}`, s]));
        const assignmentsMap = new Map<string, AssignmentStatus[]>();

        const filteredTrainees = allTrainees.filter(t => 
            (departmentFilter === 'all' || t.department === departmentFilter) &&
            (batchFilter === 'all' || t.batch === batchFilter)
        );

        filteredTrainees.forEach(trainee => {
            if (trainee.onboardingPlan) {
                trainee.onboardingPlan.forEach(planItem => {
                    planItem.tasks.forEach(task => {
                        if (!assignmentsMap.has(task)) {
                            assignmentsMap.set(task, []);
                        }
                        const submission = submissionMap.get(`${trainee.id}-${task}`) || null;
                        assignmentsMap.get(task)!.push({
                            traineeId: trainee.id,
                            traineeName: trainee.name,
                            traineeDepartment: trainee.department,
                            traineeBatch: trainee.batch,
                            submission: submission,
                        });
                    });
                });
            }
        });

        const result: GroupedAssignment[] = [];
        assignmentsMap.forEach((statuses, title) => {
            const submittedCount = statuses.filter(s => s.submission).length;
            const totalCount = statuses.length;
            result.push({
                title,
                statuses,
                completionRate: totalCount > 0 ? (submittedCount / totalCount) * 100 : 0,
            });
        });
        
        return result.sort((a,b) => a.title.localeCompare(b.title));

    }, [allTrainees, allSubmissions, departmentFilter, batchFilter]);


    const clearFilters = () => {
        setDepartmentFilter('all');
        setBatchFilter('all');
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p className="ml-4">Loading Assignment Data...</p>
            </div>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Assignment Completion Status</CardTitle>
                <CardDescription>
                    A list of all assignments and the submission status for each trainee.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col md:flex-row items-center gap-4 mb-6 flex-wrap">
                     <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                        <SelectTrigger className="w-full md:w-auto flex-1">
                            <SelectValue placeholder="Filter by Department" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Departments</SelectItem>
                             {uniqueDepartments.map(dep => <SelectItem key={dep} value={dep}>{dep}</SelectItem>)}
                        </SelectContent>
                    </Select>
                     <Select value={batchFilter} onValueChange={setBatchFilter}>
                        <SelectTrigger className="w-full md:w-auto flex-1">
                            <SelectValue placeholder="Filter by Batch" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Batches</SelectItem>
                            {uniqueBatches.map(batch => <SelectItem key={batch} value={batch}>{batch}</SelectItem>)}
                        </SelectContent>
                    </Select>
                     <Button variant="ghost" onClick={clearFilters}>
                        <FilterX className="mr-2 h-4 w-4" />
                        Clear Filters
                    </Button>
                </div>

                <Accordion type="multiple" className="w-full space-y-4">
                    {groupedAssignments.map((assignment) => (
                        <AccordionItem value={assignment.title} key={assignment.title} className="border-0">
                             <Card className="shadow-none border">
                                <AccordionTrigger className="p-4 hover:no-underline">
                                    <div className="flex-1 text-left">
                                        <h3 className="font-semibold">{assignment.title}</h3>
                                        <div className="flex items-center gap-4 mt-2">
                                            <Progress value={assignment.completionRate} className="w-1/3 h-2"/>
                                            <span className="text-sm text-muted-foreground">{Math.round(assignment.completionRate)}% Complete</span>
                                        </div>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                    <div className="border-t">
                                     <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Trainee</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Submitted On</TableHead>
                                                <TableHead className="text-right">Score</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {assignment.statuses.map(status => (
                                                <TableRow key={status.traineeId}>
                                                    <TableCell>
                                                        <div className="font-medium">{status.traineeName}</div>
                                                        <div className="text-sm text-muted-foreground">{status.traineeDepartment} - {status.traineeBatch}</div>
                                                    </TableCell>
                                                    <TableCell>
                                                         {status.submission ? (
                                                            <Badge variant="default" className="gap-1.5 bg-green-500 text-white">
                                                                <CheckCircle className="h-3.5 w-3.5" />
                                                                Submitted
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="secondary" className="gap-1.5">
                                                                <Clock className="h-3.5 w-3.5" />
                                                                Not Submitted
                                                            </Badge>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        {status.submission ? format(new Date(status.submission.submittedAt.toString()), 'PP') : 'N/A'}
                                                    </TableCell>
                                                     <TableCell className="text-right">
                                                        {status.submission?.review ? (
                                                            <span className="font-bold">{status.submission.review.score}/100</span>
                                                        ) : status.submission ? (
                                                            <span className="text-xs text-muted-foreground">Pending Review</span>
                                                        ) : (
                                                            'N/A'
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                     </Table>
                                    </div>
                                </AccordionContent>
                            </Card>
                        </AccordionItem>
                    ))}
                     {groupedAssignments.length === 0 && (
                        <div className="text-center h-24 flex items-center justify-center text-muted-foreground">
                            No assignments or trainees found for the selected filters.
                        </div>
                    )}
                </Accordion>
            </CardContent>
        </Card>
    );
};


    