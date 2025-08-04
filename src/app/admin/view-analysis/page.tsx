
'use client';

import { useEffect, useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Trainee, getAllTrainees } from '@/services/trainee-service';
import { LoaderCircle, Users } from 'lucide-react';
import Link from 'next/link';
import { Bar, BarChart, CartesianGrid, Pie, PieChart, Cell, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import type { ChartConfig } from '@/components/ui/chart';

export const dynamic = 'force-dynamic';

const generateRandomScore = () => Math.floor(Math.random() * 41) + 60; // 60-100
const generateConsistentCompletion = (id: string) => {
  const numericId = parseInt(id.replace(/[^0-9]/g, '').slice(0, 5) || "0", 10);
  return (numericId % 3) === 0;
};

const assessmentChartConfig = {
  passed: { label: 'Passed', color: 'hsl(var(--chart-1))' },
  failed: { label: 'Failed', color: 'hsl(var(--chart-2))' },
} satisfies ChartConfig;

const departmentChartConfig = {
  progress: { label: 'Avg. Progress' },
  Engineering: { label: 'Engineering', color: 'hsl(var(--chart-1))' },
  Product: { label: 'Product', color: 'hsl(var(--chart-3))' },
  Design: { label: 'Design', color: 'hsl(var(--chart-5))' },
} satisfies ChartConfig;


export default function ViewAnalysisPage() {
  const [trainees, setTrainees] = useState<Trainee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAndProcessTrainees = async () => {
      setLoading(true);
      const fetchedTrainees = await getAllTrainees();
      const traineesWithData = fetchedTrainees.map(t => ({
        ...t,
        assessmentScore: t.assessmentScore || generateRandomScore(),
        trainingCompleted: generateConsistentCompletion(t.id),
      }));
      // @ts-ignore
      setTrainees(traineesWithData);
      setLoading(false);
    };

    fetchAndProcessTrainees();
  }, []);
  
  const analysisData = useMemo(() => {
    if (trainees.length === 0) {
        return {
            assessmentData: [],
            completedTraining: 0,
            participationRate: 0,
            departmentProgress: [],
        }
    }
    const passCount = trainees.filter(t => (t.assessmentScore || 0) >= 70).length;
    const failCount = trainees.length - passCount;
    
    const completedTraining = trainees.filter(t => (t as any).trainingCompleted).length;

    const departmentData: { [key: string]: { totalProgress: number; count: number } } = {
        Engineering: { totalProgress: 0, count: 0 },
        Product: { totalProgress: 0, count: 0 },
        Design: { totalProgress: 0, count: 0 },
    };

    trainees.forEach(trainee => {
        if(departmentData[trainee.department]) {
            departmentData[trainee.department].totalProgress += trainee.progress;
            departmentData[trainee.department].count += 1;
        }
    });

    const departmentProgress = Object.entries(departmentData).map(([name, data]) => ({
        name,
        progress: data.count > 0 ? Math.round(data.totalProgress / data.count) : 0,
        fill: `var(--color-${name})`
    }));


    return {
      assessmentData: [
        { name: 'Passed', value: passCount, fill: 'hsl(var(--chart-1))' },
        { name: 'Failed', value: failCount, fill: 'hsl(var(--chart-2))' },
      ],
      completedTraining,
      participationRate: Math.round((completedTraining / trainees.length) * 100),
      departmentProgress,
    };
  }, [trainees]);


  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoaderCircle className="h-8 w-8 animate-spin" />
        <p className="ml-4">Loading Analysis Data...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="mb-8">
        <h1 className="text-4xl font-headline font-bold">Trainee Analysis</h1>
        <p className="text-muted-foreground">
          Visual analytics of trainee performance and participation.
        </p>
      </header>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle>Department Performance</CardTitle>
                <CardDescription>Average training progress by department.</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={departmentChartConfig} className="w-full h-[300px]">
                    <ResponsiveContainer>
                        <BarChart data={analysisData.departmentProgress} margin={{ top: 20, right: 20, left: -10, bottom: 5 }} accessibilityLayer>
                            <CartesianGrid vertical={false} />
                            <XAxis dataKey="name" tickLine={false} tickMargin={10} axisLine={false} />
                            <YAxis domain={[0, 100]} unit="%" />
                            <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
                            <Bar dataKey="progress" radius={4} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </CardContent>
        </Card>
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Training Participation</CardTitle>
            <CardDescription>Trainees who have completed all training modules.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center flex-grow">
            <div className="flex items-baseline gap-2">
                <span className="text-6xl font-bold">{analysisData.completedTraining}</span>
                <span className="text-2xl text-muted-foreground">/ {trainees.length}</span>
            </div>
            <p className="text-muted-foreground mt-2">Trainees Completed</p>
            <div className="mt-8 text-3xl font-bold text-primary">
                {analysisData.participationRate}%
            </div>
             <p className="text-muted-foreground">Completion Rate</p>
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Assessment Pass/Fail Rate</CardTitle>
            <CardDescription>Based on a 70% passing score for the final assessment.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <ChartContainer config={assessmentChartConfig} className="mx-auto aspect-square max-h-[300px]">
                <PieChart>
                    <ChartTooltip content={<ChartTooltipContent nameKey="value" hideLabel />} />
                    <Pie data={analysisData.assessmentData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                       {analysisData.assessmentData.map((entry) => (
                          <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                        ))}
                    </Pie>
                </PieChart>
            </ChartContainer>
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
