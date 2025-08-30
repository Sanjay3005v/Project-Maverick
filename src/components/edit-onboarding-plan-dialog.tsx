
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, X, PlusCircle } from 'lucide-react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Trainee, saveOnboardingPlan } from '@/services/trainee-service';
import { OnboardingPlanItem, Task } from '@/lib/plan-schema';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { getAllQuizzes, Quiz } from '@/services/quiz-service';
import { getAllChallenges, Challenge } from '@/services/challenge-service';
import { useEffect } from 'react';


interface EditOnboardingPlanDialogProps {
  trainee: Trainee;
  children: React.ReactNode;
  onPlanUpdated: () => void;
}

export function EditOnboardingPlanDialog({ trainee, children, onPlanUpdated }: EditOnboardingPlanDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [editedPlan, setEditedPlan] = useState<OnboardingPlanItem[]>(
    JSON.parse(JSON.stringify(trainee.onboardingPlan || []))
  );
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);

  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        const [q, c] = await Promise.all([getAllQuizzes(), getAllChallenges()]);
        setQuizzes(q);
        setChallenges(c);
      }
      fetchData();
      setEditedPlan(JSON.parse(JSON.stringify(trainee.onboardingPlan || [])));
    }
  }, [isOpen, trainee.onboardingPlan]);


  const handleWeekTopicChange = (weekIndex: number, value: string) => {
    const updatedPlan = [...editedPlan];
    updatedPlan[weekIndex].topic = value;
    setEditedPlan(updatedPlan);
  };
  
  const handleTaskChange = (weekIndex: number, taskIndex: number, field: keyof Task, value: any) => {
    const updatedPlan = [...editedPlan];
    const task = updatedPlan[weekIndex].tasks[taskIndex];
    
    // @ts-ignore
    task[field] = value;

    // Reset id if type changes away from quiz/challenge
    if(field === 'type' && (value === 'basic' || value === 'link')) {
        task.id = undefined;
    }

    setEditedPlan(updatedPlan);
  };

  const handleAddTask = (weekIndex: number) => {
    const updatedPlan = [...editedPlan];
    updatedPlan[weekIndex].tasks.push({ description: 'New task', type: 'basic', status: 'Pending' });
    setEditedPlan(updatedPlan);
  };

  const handleRemoveTask = (weekIndex: number, taskIndex: number) => {
    const updatedPlan = [...editedPlan];
    updatedPlan[weekIndex].tasks.splice(taskIndex, 1);
    setEditedPlan(updatedPlan);
  };

  const handleAddWeek = () => {
    const newWeekNumber = editedPlan.length > 0 ? parseInt(editedPlan[editedPlan.length - 1].week.replace(/\D/g,'')) + 1 : 1;
    setEditedPlan([
      ...editedPlan,
      {
        week: `Week ${newWeekNumber}`,
        topic: 'New Topic',
        tasks: [{ description: 'New task', type: 'basic', status: 'Pending' }],
        status: 'Not Started'
      }
    ]);
  };

  const handleRemoveWeek = (weekIndex: number) => {
    const updatedPlan = [...editedPlan];
    updatedPlan.splice(weekIndex, 1);
    setEditedPlan(updatedPlan);
  };

  const handleSaveChanges = async () => {
    setLoading(true);
    try {
      await saveOnboardingPlan(trainee.id, editedPlan);
      toast({
        title: 'Plan Updated',
        description: `The onboarding plan for ${trainee.name} has been saved.`,
      });
      onPlanUpdated();
      setIsOpen(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'An unexpected error occurred while saving the plan.',
      });
    } finally {
      setLoading(false);
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">Edit Onboarding Plan</DialogTitle>
          <DialogDescription>
            Modify the plan for {trainee.name}. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 max-h-[60vh] overflow-y-auto p-4">
          {editedPlan.map((week, weekIndex) => (
            <div key={weekIndex} className="space-y-4 p-4 border rounded-md relative bg-muted/20">
              <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => handleRemoveWeek(weekIndex)}>
                  <X className="h-4 w-4" />
              </Button>
              <div className="space-y-2">
                <Label htmlFor={`week-topic-${weekIndex}`}>Week Title</Label>
                <Input
                  id={`week-topic-${weekIndex}`}
                  value={week.week}
                  onChange={(e) => handleWeekTopicChange(weekIndex, e.target.value)}
                  className="font-bold"
                />
              </div>
               <div className="space-y-2">
                <Label htmlFor={`week-topic-${weekIndex}`}>Topic</Label>
                <Input
                  id={`week-topic-${weekIndex}`}
                  value={week.topic}
                  onChange={(e) => handleWeekTopicChange(weekIndex, e.target.value)}
                />
              </div>
              <div className="space-y-3">
                <Label>Tasks</Label>
                {week.tasks.map((task, taskIndex) => (
                  <div key={taskIndex} className="flex flex-col gap-2 border p-3 rounded-md bg-background">
                     <div className="flex items-center justify-between">
                        <p className="font-semibold">Task {taskIndex + 1}</p>
                         <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveTask(weekIndex, taskIndex)}>
                            <X className="h-4 w-4 text-red-500" />
                        </Button>
                     </div>
                     <Textarea
                      value={task.description}
                      onChange={(e) => handleTaskChange(weekIndex, taskIndex, 'description', e.target.value)}
                      rows={2}
                      placeholder="Task description..."
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <Select value={task.type} onValueChange={(v) => handleTaskChange(weekIndex, taskIndex, 'type', v)}>
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="basic">Basic (Check-off)</SelectItem>
                                <SelectItem value="link">Link Submission</SelectItem>
                                <SelectItem value="quiz">Quiz</SelectItem>
                                <SelectItem value="challenge">Challenge</SelectItem>
                            </SelectContent>
                        </Select>

                        {task.type === 'quiz' && (
                            <Select onValueChange={(v) => handleTaskChange(weekIndex, taskIndex, 'id', v)}>
                                <SelectTrigger><SelectValue placeholder="Select a quiz"/></SelectTrigger>
                                <SelectContent>
                                    {quizzes.map(q => <SelectItem key={q.id} value={q.id}>{q.title}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        )}
                         {task.type === 'challenge' && (
                            <Select onValueChange={(v) => handleTaskChange(weekIndex, taskIndex, 'id', v)}>
                                <SelectTrigger><SelectValue placeholder="Select a challenge"/></SelectTrigger>
                                <SelectContent>
                                    {challenges.map(c => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        )}

                    </div>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => handleAddTask(weekIndex)}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Task
                </Button>
              </div>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={handleAddWeek} className="w-full">
            <PlusCircle className="mr-2" /> Add Week
          </Button>
        </div>
        <DialogFooter>
            <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSaveChanges} disabled={loading}>
                {loading ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                </>
                ) : (
                <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                </>
                )}
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
