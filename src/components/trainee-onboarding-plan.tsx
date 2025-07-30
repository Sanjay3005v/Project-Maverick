
'use client';

import { useActionState, useRef, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { assignOnboardingPlan, createOnboardingPlanForAdmin } from '@/lib/actions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wand2, Loader2, FileDown, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { useAuth } from '@/hooks/use-auth';

function GenerateButton() {
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

function SavePlanButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending} variant="secondary">
             {pending ? (
                <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
                </>
            ) : (
                <>
                <Save className="mr-2 h-4 w-4" />
                Save Plan to My Profile
                </>
            )}
        </Button>
    )
}

export function TraineeOnboardingPlan() {
  const { toast } = useToast();
  const { user } = useAuth();
  const initialState = { success: false, message: '', data: undefined };
  
  const [generateState, generateDispatch] = useActionState(createOnboardingPlanForAdmin, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  
  const [assignState, assignDispatch] = useActionState(assignOnboardingPlan, { success: false, message: '' });


  useEffect(() => {
    if (generateState && generateState.message && !generateState.success) {
        toast({
            variant: 'destructive',
            title: 'Error Generating Plan',
            description: generateState.message,
        });
    }
  }, [generateState, toast]);

   useEffect(() => {
     if (assignState && assignState.message) {
      if (assignState.success) {
        toast({
          title: 'Plan Saved!',
          description: "Your new onboarding plan has been saved to your profile.",
        });
      } else {
         toast({
          variant: 'destructive',
          title: 'Assignment Failed',
          description: assignState.message,
        });
      }
    }
  }, [assignState, toast])


  const handleDownloadPDF = () => {
    if (!generateState.data?.personalizedPlan) return;
    const doc = new jsPDF();
    doc.text("My Personalized Onboarding Plan", 14, 16);
    autoTable(doc, {
      head: [['Week', 'Topic', 'Tasks']],
      body: generateState.data.personalizedPlan.map(item => [item.week, item.topic, item.tasks.join('\n')]),
      startY: 20,
    });
    doc.save('my-onboarding-plan.pdf');
  };

  const handleDownloadExcel = () => {
    if (!generateState.data?.personalizedPlan) return;
    const worksheetData = generateState.data.personalizedPlan.map(item => ({
        Week: item.week,
        Topic: item.topic,
        Tasks: item.tasks.join('\n'),
    }));
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Onboarding Plan");
    XLSX.writeFile(workbook, 'my-onboarding-plan.xlsx');
  };

  return (
    <div className="grid md:grid-cols-2 gap-8 items-start">
        <Card className="shadow-lg">
            <form ref={formRef} action={generateDispatch}>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">Your Learning Goal</CardTitle>
                    <CardDescription>Tell the AI what you want to learn, and it will generate a plan for you.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="learningGoal" className="text-base">I want to learn...</Label>
                        <Textarea
                            id="learningGoal"
                            name="learningGoal"
                            placeholder="e.g., 'The basics of Python in 2 weeks', 'Advanced React state management in 1 month', or 'How to build a full-stack app with Next.js in 8 weeks'"
                            rows={4}
                            required
                            className="text-base"
                        />
                    </div>
                     <div className="space-y-2">
                      <Label htmlFor="fresherProfile" className="text-base">My Profile / Skills</Label>
                      <Textarea
                        id="fresherProfile"
                        name="fresherProfile"
                        placeholder="Briefly describe your current skills and experience. e.g., 'I have some experience with HTML and CSS but I am new to JavaScript.'"
                        rows={4}
                        required
                        className="text-base"
                      />
                    </div>
                    <input type="hidden" name="trainingSchedule" value="N/A for trainee" />
                </CardContent>
                <CardFooter>
                    <GenerateButton />
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
             {generateState?.success && generateState.data && (
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
        <CardContent className="min-h-[400px]">
        {generateState?.success && generateState.data ? (
            <div className="border rounded-lg overflow-auto h-full">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">Week</TableHead>
                            <TableHead>Topic</TableHead>
                            <TableHead>Tasks</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {generateState.data.personalizedPlan.map((item, index) => (
                            <TableRow key={index}>
                                <TableCell className="font-medium">{item.week}</TableCell>
                                <TableCell>{item.topic}</TableCell>
                                <TableCell className="text-sm">
                                    <ul className="list-disc pl-4 space-y-1">
                                      {item.tasks.map((task, i) => <li key={i}>{task}</li>)}
                                    </ul>
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
        {generateState.success && generateState.data && user && (
            <CardFooter>
                 <form action={assignDispatch}>
                    <input type="hidden" name="plan" value={JSON.stringify(generateState.data.personalizedPlan)} />
                    <input type="hidden" name="selectedTrainees" value={JSON.stringify([user.uid])} />
                    <SavePlanButton />
                </form>
            </CardFooter>
        )}
      </Card>
    </div>
  );
}
