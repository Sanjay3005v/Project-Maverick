
'use client';

import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trainee, getAllTrainees } from '@/services/trainee-service';
import { Submission, getAllSubmissions } from '@/services/submission-service';
import { Loader2, Search, FilterX, CheckCircle, Clock, ArrowUpDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { Button } from './ui/button';

type AssignmentRecord = {
    traineeId: string;
    traineeName: string;
    traineeDepartment: string;
    traineeBatch: string;
    assignmentTitle: string;
    submission: Submission | null;
};

type SortKey = keyof Pick<AssignmentRecord, 'traineeName' | 'assignmentTitle'>;


export const AssignmentProgressTable = () => {
    const [allTrainees, setAllTrainees] = useState<Trainee[]>([]);
    const [allSubmissions, setAllSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);

    const [traineeFilter, setTraineeFilter] = useState('all');
    const [departmentFilter, setDepartmentFilter] = useState('all');
    const [batchFilter, setBatchFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState<'all' | 'submitted' | 'not-submitted'>('all');
    const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' } | null>(null);


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

    const uniqueTraineeNames = useMemo(() => {
        return [...new Set(allTrainees.map(t => t.name))].sort();
    }, [allTrainees]);
    
    const uniqueDepartments = useMemo(() => {
        return [...new Set(allTrainees.map(t => t.department))].sort();
    }, [allTrainees]);

    const uniqueBatches = useMemo(() => {
        const batches = new Set(allTrainees.map(t => t.batch).filter(Boolean));
        return Array.from(batches).sort();
    }, [allTrainees]);


    const assignmentRecords: AssignmentRecord[] = useMemo(() => {
        const records: AssignmentRecord[] = [];
        const submissionMap = new Map(allSubmissions.map(s => [`${s.traineeId}-${s.assignmentTitle}`, s]));

        allTrainees.forEach(trainee => {
            if (trainee.onboardingPlan) {
                trainee.onboardingPlan.forEach(planItem => {
                    planItem.tasks.forEach(task => {
                        const submission = submissionMap.get(`${trainee.id}-${task}`) || null;
                        records.push({
                            traineeId: trainee.id,
                            traineeName: trainee.name,
                            traineeDepartment: trainee.department,
                            traineeBatch: trainee.batch,
                            assignmentTitle: task,
                            submission: submission,
                        });
                    });
                });
            }
        });
        return records;
    }, [allTrainees, allSubmissions]);
    
    const sortedAndFilteredRecords = useMemo(() => {
        let filtered = assignmentRecords.filter(record => {
            const traineeMatch = traineeFilter === 'all' || record.traineeName === traineeFilter;
            const departmentMatch = departmentFilter === 'all' || record.traineeDepartment === departmentFilter;
            const batchMatch = batchFilter === 'all' || record.traineeBatch === batchFilter;
            const statusMatch = statusFilter === 'all' ||
                                (statusFilter === 'submitted' && !!record.submission) ||
                                (statusFilter === 'not-submitted' && !record.submission);
            return traineeMatch && departmentMatch && batchMatch && statusMatch;
        });

        if (sortConfig !== null) {
            filtered.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }

        return filtered;
    }, [assignmentRecords, traineeFilter, departmentFilter, batchFilter, statusFilter, sortConfig]);

    const requestSort = (key: SortKey) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const clearFilters = () => {
        setTraineeFilter('all');
        setDepartmentFilter('all');
        setBatchFilter('all');
        setStatusFilter('all');
        setSortConfig(null);
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
                <CardTitle>All Assignment Records</CardTitle>
                <CardDescription>
                    A detailed log of all assigned tasks and their submission status.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col md:flex-row items-center gap-4 mb-6 flex-wrap">
                    <Select value={traineeFilter} onValueChange={setTraineeFilter}>
                        <SelectTrigger className="w-full md:w-auto flex-1">
                            <SelectValue placeholder="Filter by Trainee" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Trainees</SelectItem>
                            {uniqueTraineeNames.map(name => <SelectItem key={name} value={name}>{name}</SelectItem>)}
                        </SelectContent>
                    </Select>
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
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full md:w-auto flex-1">
                            <SelectValue placeholder="Filter by Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="submitted">Submitted</SelectItem>
                            <SelectItem value="not-submitted">Not Submitted</SelectItem>
                        </SelectContent>
                    </Select>
                     <Button variant="ghost" onClick={clearFilters}>
                        <FilterX className="mr-2 h-4 w-4" />
                        Clear Filters
                    </Button>
                </div>
                <div className="border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>
                                    <Button variant="ghost" onClick={() => requestSort('traineeName')}>
                                        Trainee
                                        <ArrowUpDown className="ml-2 h-4 w-4" />
                                    </Button>
                                </TableHead>
                                <TableHead>
                                    <Button variant="ghost" onClick={() => requestSort('assignmentTitle')}>
                                        Assignment
                                        <ArrowUpDown className="ml-2 h-4 w-4" />
                                    </Button>
                                </TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Submitted On</TableHead>
                                <TableHead className="text-right">Score</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sortedAndFilteredRecords.map((record, index) => (
                                <TableRow key={index}>
                                    <TableCell>
                                        <div className="font-medium">{record.traineeName}</div>
                                        <div className="text-sm text-muted-foreground">{record.traineeDepartment} - {record.traineeBatch}</div>
                                    </TableCell>
                                    <TableCell className="max-w-xs truncate">{record.assignmentTitle}</TableCell>
                                    <TableCell>
                                        {record.submission ? (
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
                                        {record.submission ? format(new Date(record.submission.submittedAt.toString()), 'PP') : 'N/A'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {record.submission?.review ? (
                                            <span className="font-bold">{record.submission.review.score}/100</span>
                                        ) : record.submission ? (
                                            <span className="text-xs text-muted-foreground">Pending Review</span>
                                        ) : (
                                            'N/A'
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                             {sortedAndFilteredRecords.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24">
                                        No matching records found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
};
