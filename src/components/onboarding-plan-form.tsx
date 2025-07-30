
'use client';

import { useState, useEffect } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { createOnboardingPlanForAdmin, assignOnboardingPlan } from '@/lib/actions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Wand2, Loader2, FileDown, Users, Check, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Trainee, getAllTrainees } from '@/services/trainee-service';
import { Checkbox } from './ui/checkbox';
import { OnboardingPlanItem } from '@/ai/flows/generate-onboarding-plan';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Wand2 className="mr-2 h-4 w-4" />
          Generate Plan
        </>
      )}
    </Button>
  );
}

function AssignButton({ plan, selectedTrainees }: { plan: OnboardingPlanItem[], selectedTrainees: string[] }) {
  const { pending, data, method, action } = useFormStatus();

  return (
      <Button type="submit" disabled={pending || selectedTrainees.length === 0}>
        {pending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Assigning...
          </>
        ) : (
          <>
            <Send className="mr-2 h-4 w-4" />
            Assign to {selectedTrainees.length} Trainee(s)
          </>
        )}
      </Button>
  );
}

export function OnboardingPlanForm() {
  const { toast } = useToast();
  const [trainees, setTrainees] = useState<Trainee[]>([]);
  const [selectedTrainees, setSelectedTrainees] = useState<string[]>([]);

  const initialState = { success: false, message: '', data: undefined };
  const [state, dispatch] = useFormState(createOnboardingPlanForAdmin, initialState);
  const [assignState, assignDispatch] = useFormState(assignOnboardingPlan, { success: false, message: '' });


  useEffect(() => {
    const fetchTrainees = async () => {
        const fetched = await getAllTrainees();
        setTrainees(fetched);
    }
    fetchTrainees();
  }, [])

  useEffect(() => {
    if (state && !state.success && state.message) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: state.message,
      });
    }
  }, [state, toast]);

  useEffect(() => {
     if (assignState && assignState.message) {
      if (assignState.success) {
        toast({
          title: 'Plan Assigned!',
          description: assignState.message,
        });
        setSelectedTrainees([]);
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
    if (!state.data?.personalizedPlan) return;
    const doc = new jsPDF();
    doc.text("Personalized Onboarding Plan", 14, 16);
    autoTable(doc, {
      head: [['Week', 'Topic', 'Tasks', 'Status']],
      body: state.data.personalizedPlan.map(item => [item.week, item.topic, item.tasks.join('\n'), item.status]),
      startY: 20,
    });
    doc.save('onboarding-plan.pdf');
  };

  const handleDownloadExcel = () => {
    if (!state.data?.personalizedPlan) return;
     const worksheetData = state.data.personalizedPlan.map(item => ({
        Week: item.week,
        Topic: item.topic,
        Tasks: item.tasks.join('\n'),
        Status: item.status
    }));
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Onboarding Plan");
    XLSX.writeFile(workbook, 'onboarding-plan.xlsx');
  };

  const handleSelectTrainee = (traineeId: string) => {
    setSelectedTrainees(prev => 
        prev.includes(traineeId)
        ? prev.filter(id => id !== traineeId)
        : [...prev, traineeId]
    );
  }

  return (
    <div className="grid lg:grid-cols-2 gap-8 items-start">
      <div className="space-y-8">
        <Card className="shadow-lg">
          <form action={dispatch}>
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Create Onboarding Plan</CardTitle>
              <CardDescription>Use AI to generate a personalized plan for a new trainee.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="fresherProfile" className="text-base">Fresher Profile</Label>
                <Textarea
                  id="fresherProfile"
                  name="fresherProfile"
                  placeholder="Describe the trainee's skills, learning preferences, and past experience. e.g., 'Recent computer science graduate with strong Java skills, prefers hands-on projects, has internship experience in web development...'"
                  rows={5}
                  required
                  className="text-base"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="learningGoal" className="text-base">Learning Goal</Label>
                 <Textarea
                    id="learningGoal"
                    name="learningGoal"
                    placeholder="e.g., 'I want to learn the basics of Python in 2 weeks', 'Advanced React state management in 1 month', or 'How to build a full-stack app with Next.js in 8 weeks'"
                    rows={3}
                    required
                    className="text-base"
                />
              </div>
               <div className="space-y-2">
                <Label htmlFor="trainingSchedule" className="text-base">Company Schedule</Label>
                 <Textarea
                    id="trainingSchedule"
                    name="trainingSchedule"
                    placeholder="e.g., Week 1: Company orientation & tools setup. Week 2-3: Core Java programming. Week 4: Intro to databases..."
                    rows={5}
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
         {state?.success && state.data && (
            <Card>
                <form action={assignDispatch}>
                    <input type="hidden" name="plan" value={JSON.stringify(state.data.personalizedPlan)} />
                    <input type="hidden" name="selectedTrainees" value={JSON.stringify(selectedTrainees)} />
                    <CardHeader>
                        <CardTitle>Assign Plan to Trainees</CardTitle>
                        <CardDescription>Select the trainees who should receive this plan.</CardDescription>
                    </CardHeader>
                    <CardContent className="max-h-80 overflow-y-auto space-y-2">
                        {trainees.map(trainee => (
                            <div 
                                key={trainee.id} 
                                className="flex items-center space-x-3 p-3 rounded-md hover:bg-muted/50"
                            >
                                <Checkbox 
                                    id={`trainee-${trainee.id}`} 
                                    checked={selectedTrainees.includes(trainee.id)}
                                    onCheckedChange={() => handleSelectTrainee(trainee.id)}
                                />
                                <Label htmlFor={`trainee-${trainee.id}`} className="flex-1 cursor-pointer">
                                    <p className="font-medium">{trainee.name}</p>
                                    <p className="text-xs text-muted-foreground">{trainee.department}</p>
                                </Label>
                            </div>
                        ))}
                    </CardContent>
                    <CardFooter>
                        <AssignButton plan={state.data.personalizedPlan} selectedTrainees={selectedTrainees}/>
                    </CardFooter>
                </form>
            </Card>
        )}
      </div>
      
      <Card className="shadow-lg sticky top-24">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="font-headline text-2xl">Generated Plan</CardTitle>
              <CardDescription>The AI-generated plan will appear here.</CardDescription>
            </div>
            {state?.success && state.data && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
                  <FileDown className="mr-2" /> PDF
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownloadExcel}>
                  <FileDown className="mr-2" /> Excel
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="max-h-[80vh] overflow-y-auto">
          {state?.success && state.data ? (
            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">Week</TableHead>
                            <TableHead>Topic</TableHead>
                            <TableHead>Tasks</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {state.data.personalizedPlan.map((item, index) => (
                            <TableRow key={index}>
                                <TableCell className="font-medium">{item.week}</TableCell>
                                <TableCell>{item.topic}</TableCell>
                                <TableCell>
                                  <ul className="list-disc pl-4 space-y-1 text-sm">
                                      {item.tasks.map((task, i) => <li key={i}>{task}</li>)}
                                    </ul>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
          ) : (
            <div className="flex items-center justify-center h-96 border-2 border-dashed rounded-lg bg-muted/50">
              <p className="text-muted-foreground">Waiting for input...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
