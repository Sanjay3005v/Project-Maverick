
'use client';

import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trainee, getAllTrainees } from '@/services/trainee-service';
import { Submission, getAllSubmissions } from '@/services/submission-service';
import { Loader2, FilterX, CheckCircle, Clock, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { Button } from './ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Progress } from './ui/progress';

type AssignmentStatus = {
    title: string;
    submitted: boolean;
    submissionDate: string | null;
    score: number | null;
    downloadUrl?: string;
};

type TraineeWithAssignmentStatus = Trainee & {
    assignmentStatuses: AssignmentStatus[];
    completionRate: number;
    totalAssignments: number;
    submittedAssignments: number;
};


export const TraineeProgressTable = () => {
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

    const traineeProgressData = useMemo(() => {
        const submissionMap = new Map(allSubmissions.map(s => [`${s.traineeId}-${s.assignmentTitle}`, s]));

        const filteredTrainees = allTrainees.filter(t =>
            (departmentFilter === 'all' || t.department === departmentFilter) &&
            (batchFilter === 'all' || t.batch === batchFilter)
        );

        const result: TraineeWithAssignmentStatus[] = filteredTrainees.map(trainee => {
            const assignmentStatuses: AssignmentStatus[] = [];
            let totalTasks = 0;
            let submittedTasks = 0;

            if (trainee.onboardingPlan) {
                trainee.onboardingPlan.forEach(planItem => {
                    planItem.tasks.forEach(task => {
                        totalTasks++;
                        const submission = submissionMap.get(`${trainee.id}-${task}`);
                        if (submission) {
                            submittedTasks++;
                        }
                        assignmentStatuses.push({
                            title: task,
                            submitted: !!submission,
                            submissionDate: submission ? format(new Date(submission.submittedAt.toString()), 'PP') : null,
                            score: submission?.review?.score ?? null,
                            downloadUrl: submission?.fileUrl,
                        });
                    });
                });
            }

            return {
                ...trainee,
                assignmentStatuses,
                completionRate: totalTasks > 0 ? (submittedTasks / totalTasks) * 100 : 0,
                totalAssignments: totalTasks,
                submittedAssignments: submittedTasks,
            };
        });

        return result.sort((a,b) => a.name.localeCompare(b.name));

    }, [allTrainees, allSubmissions, departmentFilter, batchFilter]);


    const clearFilters = () => {
        setDepartmentFilter('all');
        setBatchFilter('all');
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p className="ml-4">Loading Trainee Progress...</p>
            </div>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Trainee Submission Status</CardTitle>
                <CardDescription>
                    A list of all trainees and their submission status for each assigned task.
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
                    {traineeProgressData.map((trainee) => (
                        <AccordionItem value={trainee.id} key={trainee.id} className="border-0">
                             <Card className="shadow-none border">
                                <AccordionTrigger className="p-4 hover:no-underline">
                                    <div className="flex-1 text-left">
                                        <h3 className="font-semibold">{trainee.name}</h3>
                                        <p className="text-sm text-muted-foreground">{trainee.department} - {trainee.batch}</p>
                                        <div className="flex items-center gap-4 mt-2">
                                            <Progress value={trainee.completionRate} className="w-1/3 h-2"/>
                                            <span className="text-sm text-muted-foreground">{trainee.submittedAssignments} of {trainee.totalAssignments} Submitted ({Math.round(trainee.completionRate)}%)</span>
                                        </div>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                    <div className="border-t">
                                     <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Assignment</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Submitted On</TableHead>
                                                <TableHead>Score</TableHead>
                                                <TableHead className="text-right">Action</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {trainee.assignmentStatuses.map(status => (
                                                <TableRow key={status.title}>
                                                    <TableCell className="font-medium">{status.title}</TableCell>
                                                    <TableCell>
                                                         {status.submitted ? (
                                                            <Badge variant="default" className="gap-1.5 bg-green-500 text-white hover:bg-green-600">
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
                                                        {status.submissionDate || 'N/A'}
                                                    </TableCell>
                                                     <TableCell>
                                                        {status.score !== null ? (
                                                            <span className="font-bold">{status.score}/100</span>
                                                        ) : status.submitted ? (
                                                            <span className="text-xs text-muted-foreground">Pending Review</span>
                                                        ) : (
                                                            'N/A'
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {status.downloadUrl ? (
                                                            <Button size="sm" variant="outline" asChild>
                                                                <a href={status.downloadUrl} target="_blank" rel="noopener noreferrer">
                                                                    <Download className="mr-2 h-4 w-4" /> Download
                                                                </a>
                                                            </Button>
                                                        ) : null}
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
                     {traineeProgressData.length === 0 && (
                        <div className="text-center h-24 flex items-center justify-center text-muted-foreground">
                            No trainees found for the selected filters.
                        </div>
                    )}
                </Accordion>
            </CardContent>
        </Card>
    );
};
