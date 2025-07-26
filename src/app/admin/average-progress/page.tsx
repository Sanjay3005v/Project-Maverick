
'use client';

import { useEffect, useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { Trainee, getAllTrainees } from '@/services/trainee-service';
import { Loader2, TrendingUp, TrendingDown, FileDown, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import Link from 'next/link';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import type { ChartConfig } from '@/components/ui/chart';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const departmentChartConfig = {
  progress: { label: 'Avg. Progress' },
  Engineering: { label: 'Engineering', color: 'hsl(var(--chart-1))' },
  Product: { label: 'Product', color: 'hsl(var(--chart-3))' },
  Design: { label: 'Design', color: 'hsl(var(--chart-5))' },
} satisfies ChartConfig;

export default function AverageProgressPage() {
  const [trainees, setTrainees] = useState<Trainee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAndProcessTrainees = async () => {
      setLoading(true);
      const fetchedTrainees = await getAllTrainees();
      setTrainees(fetchedTrainees);
      setLoading(false);
    };

    fetchAndProcessTrainees();
  }, []);

  const { overallAverage, departmentProgress, topDepartment, bottomDepartment } = useMemo(() => {
    if (trainees.length === 0) {
      return { overallAverage: 0, departmentProgress: [], topDepartment: null, bottomDepartment: null };
    }

    const overallAverage = Math.round(trainees.reduce((acc, t) => acc + t.progress, 0) / trainees.length);

    const departmentData: { [key: string]: { totalProgress: number; count: number } } = {};
    trainees.forEach(trainee => {
      if (!departmentData[trainee.department]) {
        departmentData[trainee.department] = { totalProgress: 0, count: 0 };
      }
      departmentData[trainee.department].totalProgress += trainee.progress;
      departmentData[trainee.department].count += 1;
    });

    const departmentProgress = Object.entries(departmentData).map(([name, data]) => ({
      name,
      progress: data.count > 0 ? Math.round(data.totalProgress / data.count) : 0,
      fill: `var(--color-${name})`,
    })).sort((a, b) => b.progress - a.progress);
    
    const topDepartment = departmentProgress[0];
    const bottomDepartment = departmentProgress[departmentProgress.length - 1];

    return { overallAverage, departmentProgress, topDepartment, bottomDepartment };
  }, [trainees]);
  
  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.text("Department Average Progress Report", 14, 16);
    autoTable(doc, {
      head: [['Department', 'Average Progress (%)']],
      body: departmentProgress.map(item => [item.name, item.progress]),
      startY: 20,
    });
    doc.save('department-average-progress.pdf');
  };

  const handleDownloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(departmentProgress.map(d => ({ Department: d.name, 'Average Progress (%)': d.progress })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Progress");
    XLSX.writeFile(workbook, 'department-average-progress.xlsx');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-4">Loading Progress Data...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="mb-8">
        <h1 className="text-4xl font-headline font-bold">Average Progress Analytics</h1>
        <p className="text-muted-foreground">
          A detailed breakdown of trainee progress across the organization.
        </p>
      </header>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
         <Card>
            <CardHeader>
                <CardTitle>Overall Average Progress</CardTitle>
                <CardDescription>Average completion across all trainees.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
                 <div className="text-7xl font-bold text-primary">{overallAverage}%</div>
            </CardContent>
        </Card>
        {topDepartment && (
             <Card>
                <CardHeader>
                    <CardTitle className="text-green-600 flex items-center gap-2"><ArrowUpCircle /> Top Performing Department</CardTitle>
                    <CardDescription>Highest average progress.</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                     <p className="text-4xl font-bold">{topDepartment.name}</p>
                     <p className="text-2xl font-semibold text-muted-foreground">{topDepartment.progress}% Average</p>
                </CardContent>
            </Card>
        )}
        {bottomDepartment && (
             <Card>
                <CardHeader>
                    <CardTitle className="text-red-600 flex items-center gap-2"><ArrowDownCircle /> Bottom Performing Department</CardTitle>
                    <CardDescription>Lowest average progress.</CardDescription>
                </CardHeader>
                 <CardContent className="text-center">
                     <p className="text-4xl font-bold">{bottomDepartment.name}</p>
                     <p className="text-2xl font-semibold text-muted-foreground">{bottomDepartment.progress}% Average</p>
                </CardContent>
            </Card>
        )}
      </div>

      <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle>Progress by Department</CardTitle>
                <CardDescription>Average training progress for each department.</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
                  <FileDown className="mr-2" /> PDF
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownloadExcel}>
                  <FileDown className="mr-2" /> Excel
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
              <ChartContainer config={departmentChartConfig} className="w-full h-[400px]">
                  <ResponsiveContainer>
                      <BarChart data={departmentProgress} margin={{ top: 20, right: 20, left: -10, bottom: 5 }} accessibilityLayer>
                          <CartesianGrid vertical={false} />
                          <XAxis dataKey="name" tickLine={false} tickMargin={10} axisLine={false} />
                          <YAxis domain={[0, 100]} unit="%" />
                          <ChartTooltipContent indicator="dot" />
                          <Bar dataKey="progress" radius={4} />
                      </BarChart>
                  </ResponsiveContainer>
              </ChartContainer>
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
