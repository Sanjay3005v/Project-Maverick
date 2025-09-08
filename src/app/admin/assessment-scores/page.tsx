
'use client';

import { useEffect, useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trainee, getAllTrainees, AssessmentRecord } from '@/services/trainee-service';
import { LoaderCircle, ClipboardCheck, Search, FilterX, ArrowUpDown } from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';

export const dynamic = 'force-dynamic';

type SortableKeys = 'traineeName' | 'date' | 'score';
type SortDirection = 'ascending' | 'descending';

interface FlatAssessmentRecord extends AssessmentRecord {
  traineeName: string;
  traineeId: string;
  department: string;
}

export default function AssessmentScoresPage() {
  const [trainees, setTrainees] = useState<Trainee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState<{ key: SortableKeys; direction: SortDirection } | null>({ key: 'date', direction: 'descending' });

  useEffect(() => {
    const fetchTrainees = async () => {
      setLoading(true);
      const fetchedTrainees = await getAllTrainees();
      setTrainees(fetchedTrainees);
      setLoading(false);
    };

    fetchTrainees();
  }, []);

  const flattenedAndFilteredScores = useMemo(() => {
    const flatList: FlatAssessmentRecord[] = trainees.flatMap(trainee =>
      (trainee.assessmentHistory || []).map(record => ({
        ...record,
        traineeName: trainee.name,
        traineeId: trainee.id,
        department: trainee.department,
      }))
    );
    
    let filteredList = flatList
      .filter(record => 
        record.traineeName.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter(record => 
        departmentFilter === 'all' || record.department === departmentFilter
      );

    if (sortConfig !== null) {
      filteredList.sort((a, b) => {
        let aValue, bValue;

        if (sortConfig.key === 'traineeName') {
            aValue = a.traineeName;
            bValue = b.traineeName;
        } else if (sortConfig.key === 'score') {
            aValue = a.score;
            bValue = b.score;
        } else { // date
            aValue = new Date(a.date).getTime();
            bValue = new Date(b.date).getTime();
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }

    return filteredList;
  }, [trainees, searchTerm, departmentFilter, sortConfig]);

  const requestSort = (key: SortableKeys) => {
    let direction: SortDirection = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  const getSortIcon = (key: SortableKeys) => {
    if (!sortConfig || sortConfig.key !== key) {
        return <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />;
    }
    return <ArrowUpDown className="ml-2 h-4 w-4" />;
  };

  const clearFilters = () => {
    setSearchTerm('');
    setDepartmentFilter('all');
    setSortConfig({ key: 'date', direction: 'descending' });
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
        <p className="text-muted-foreground">A historical record of all submitted assessment scores.</p>
      </header>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle>
                  <ClipboardCheck className="mr-2 h-6 w-6" />
                  All Assessment Records ({flattenedAndFilteredScores.length})
                </CardTitle>
                <CardDescription>
                  This list shows all historical assessment scores. Currently, no feature exists for trainees to submit assessments.
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
                  <TableHead>
                     <Button variant="ghost" onClick={() => requestSort('traineeName')}>
                       Trainee Name {getSortIcon('traineeName')}
                      </Button>
                  </TableHead>
                  <TableHead>Department</TableHead>
                   <TableHead>
                      <Button variant="ghost" onClick={() => requestSort('date')}>
                        Date {getSortIcon('date')}
                      </Button>
                  </TableHead>
                  <TableHead className="text-right">
                      <Button variant="ghost" onClick={() => requestSort('score')}>
                        Score {getSortIcon('score')}
                      </Button>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {flattenedAndFilteredScores.length === 0 && (
                   <TableRow>
                        <TableCell colSpan={4} className="text-center h-24">No assessment records found.</TableCell>
                    </TableRow>
                )}
                {flattenedAndFilteredScores.map((record, index) => (
                  <TableRow key={`${record.traineeId}-${index}`}>
                    <TableCell className="font-medium">{record.traineeName}</TableCell>
                    <TableCell>{record.department}</TableCell>
                    <TableCell>{format(new Date(record.date), 'PPP')}</TableCell>
                    <TableCell className="text-right font-bold text-lg">
                      {record.score}%
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
