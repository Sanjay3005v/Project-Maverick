
'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trainee, getAllTrainees } from '@/services/trainee-service';
import { Loader2, CheckCircle, Clock, ListChecks, Circle, BarChart3, FilterX } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

export const dynamic = 'force-dynamic';

type TrainingStatus = 'Completed' | 'In Progress' | 'Not Started';

// Function to generate a *consistent* random completion status for demonstration
const generateConsistentCompletion = (id: string): TrainingStatus => {
  const numericId = parseInt(id.replace(/[^0-9]/g, '').slice(0, 5) || "0", 10);
  const statusIndex = numericId % 3;
  if (statusIndex === 0) return 'Completed';
  if (statusIndex === 1) return 'In Progress';
  return 'Not Started';
};

export default function TrainingProgressPage() {
  const [trainees, setTrainees] = useState<(Trainee & { trainingStatus: TrainingStatus })[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<TrainingStatus | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    const fetchAndProcessTrainees = async () => {
      setLoading(true);
      const fetchedTrainees = await getAllTrainees();
      const traineesWithCompletion = fetchedTrainees.map(t => ({
        ...t,
        trainingStatus: generateConsistentCompletion(t.id),
      }));
      setTrainees(traineesWithCompletion);
      setLoading(false);
    };

    fetchAndProcessTrainees();
  }, []);

  const chartData = useMemo(() => {
    const counts = trainees.reduce((acc, trainee) => {
        acc[trainee.trainingStatus] = (acc[trainee.trainingStatus] || 0) + 1;
        return acc;
    }, {} as Record<TrainingStatus, number>);

    return [
        { status: 'Completed', trainees: counts['Completed'] || 0, fill: 'hsl(var(--chart-1))' },
        { status: 'In Progress', trainees: counts['In Progress'] || 0, fill: 'hsl(var(--chart-4))' },
        { status: 'Not Started', trainees: counts['Not Started'] || 0, fill: 'hsl(var(--chart-2))' }
    ];
  }, [trainees]);
  
  const chartConfig = {
    trainees: {
      label: "Trainees",
    },
    Completed: {
      label: "Completed",
      color: "hsl(var(--chart-1))",
    },
    'In Progress': {
        label: "In Progress",
       color: "hsl(var(--chart-4))",
    },
    'Not Started': {
        label: "Not Started",
        color: "hsl(var(--chart-2))",
    }
  };
  
  const handleBarClick = (data: any) => {
    if (data && data.activePayload && data.activePayload.length > 0) {
      const status = data.activePayload[0].payload.status as TrainingStatus;
      setFilter(status);
      setTimeout(() => {
        tableRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const clearFilter = () => setFilter(null);

  const filteredTrainees = useMemo(() => {
    if (!filter) return trainees;
    return trainees.filter(trainee => trainee.trainingStatus === filter);
  }, [trainees, filter]);


  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-4">Loading Training Progress...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8">
      <header className="mb-8">
        <h1 className="text-4xl font-headline font-bold">Training Progress</h1>
        <p className="text-muted-foreground">
          A detailed view of each trainee's overall training completion status.
        </p>
      </header>

      <Card>
        <CardHeader>
            <CardTitle>
                <BarChart3 className="mr-2 h-6 w-6" />
                Progress Overview
            </CardTitle>
            <CardDescription>A visual summary of training status across all trainees. Click a bar to filter the list below.</CardDescription>
        </CardHeader>
        <CardContent>
             <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <ResponsiveContainer>
                    <BarChart data={chartData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }} onClick={handleBarClick}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="status" />
                        <YAxis allowDecimals={false} />
                        <Tooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Bar dataKey="trainees" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </ChartContainer>
        </CardContent>
      </Card>
      
      <div ref={tableRef}>
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>
                <ListChecks className="mr-2 h-6 w-6" />
                {filter ? `${filter} Trainees` : 'All Trainees Status'}
              </CardTitle>
              {filter && (
                <Button variant="ghost" onClick={clearFilter}>
                  <FilterX className="mr-2 h-4 w-4" />
                  Clear Filter
                </Button>
              )}
            </div>
            <CardDescription>
              This list shows whether each trainee has completed their assigned training modules. Note: Status is currently dummy data.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Trainee Name</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead className="text-right">Training Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTrainees.map((trainee) => (
                    <TableRow key={trainee.id}>
                      <TableCell className="font-medium">{trainee.name}</TableCell>
                      <TableCell>{trainee.department}</TableCell>
                      <TableCell className="text-right">
                          {trainee.trainingStatus === 'Completed' ? (
                              <Badge variant="default" className="gap-1.5 bg-green-500 text-white hover:bg-green-600">
                                  <CheckCircle className="h-3.5 w-3.5" />
                                  Completed
                              </Badge>
                          ) : trainee.trainingStatus === 'In Progress' ? (
                              <Badge variant="secondary" className="gap-1.5 bg-yellow-400 text-yellow-900 hover:bg-yellow-500">
                                  <Clock className="h-3.5 w-3.5" />
                                  In Progress
                              </Badge>
                          ) : (
                              <Badge variant="destructive" className="gap-1.5 bg-red-500 text-white hover:bg-red-600">
                                  <Circle className="h-3.5 w-3.5" />
                                  Not Started
                              </Badge>
                          )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

       <div className="text-center mt-12">
          <Link href="/admin/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
      </div>
    </div>
  );
}
