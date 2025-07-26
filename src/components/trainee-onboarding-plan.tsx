
'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { createOnboardingPlan } from '@/lib/actions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wand2, Loader2, Clock, FileDown } from 'lucide-react';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full" size="lg">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generating Your Plan...
        </>
      ) : (
        <>
          <Wand2 className="mr-2 h-4 w-4" />
          Get My Personalized Plan
        </>
      )}
    </Button>
  );
}

export function TraineeOnboardingPlan() {
  const { toast } = useToast();
  const initialState = { success: false, message: '', data: undefined };
  
  const [state, dispatch] = useActionState(createOnboardingPlan, initialState);

  useEffect(() => {
    if (state && !state.success && state.message) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: state.message,
      });
    }
  }, [state, toast]);

  const handleDownloadPDF = () => {
    if (!state.data?.personalizedPlan) return;
    const doc = new jsPDF();
    doc.text("My Personalized Onboarding Plan", 14, 16);
    autoTable(doc, {
      head: [['Week', 'Topic', 'Tasks', 'Status']],
      body: state.data.personalizedPlan.map(item => [item.week, item.topic, item.tasks, item.status]),
      startY: 20,
    });
    doc.save('my-onboarding-plan.pdf');
  };

  const handleDownloadExcel = () => {
    if (!state.data?.personalizedPlan) return;
    const worksheet = XLSX.utils.json_to_sheet(state.data.personalizedPlan);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Onboarding Plan");
    XLSX.writeFile(workbook, 'my-onboarding-plan.xlsx');
  };


  return (
    <div className="grid md:grid-cols-2 gap-8 items-start">
        <Card className="shadow-lg">
            <form action={dispatch}>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">Your Learning Goal</CardTitle>
                    <CardDescription>Tell the AI what you want to learn, and it will generate a plan for you.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <Label htmlFor="learningGoal" className="text-base">I want to learn...</Label>
                        <Textarea
                            id="learningGoal"
                            name="learningGoal"
                            placeholder="e.g., 'The basics of Python in 2 weeks', 'Advanced React state management in 1 month', or 'How to build a full-stack app with Next.js in 8 weeks'"
                            rows={8}
                            required
                            className="text-base"
                        />
                    </div>
                </CardContent>
                <CardFooter>
                    <SubmitButton />
                </CardFooter>
            </form>
        </Card>
      
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="font-headline text-2xl">Generated Plan</CardTitle>
              <CardDescription>Your AI-generated onboarding plan will appear here.</CardDescription>
            </div>
             {state?.success && state.data && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
                  <FileDown className="mr-2" />
                  PDF
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownloadExcel}>
                  <FileDown className="mr-2" />
                  Excel
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="h-[400px]">
        {state?.success && state.data ? (
            <div className="border rounded-lg overflow-auto h-full">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">Week</TableHead>
                            <TableHead>Topic</TableHead>
                            <TableHead>Tasks</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {state.data.personalizedPlan.map((item, index) => (
                            <TableRow key={index}>
                                <TableCell className="font-medium">{item.week}</TableCell>
                                <TableCell>{item.topic}</TableCell>
                                <TableCell className="text-sm">{item.tasks}</TableCell>
                                <TableCell>
                                    <Badge variant="secondary" className="flex items-center gap-1.5 w-fit">
                                        <Clock className="h-3 w-3" />
                                        {item.status}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        ) : (
            <div className="flex items-center justify-center h-full border-2 border-dashed rounded-lg bg-muted/50">
                <p className="text-muted-foreground">Your personalized plan is waiting to be generated...</p>
            </div>
        )}
        </CardContent>
      </Card>
    </div>
  );
}
