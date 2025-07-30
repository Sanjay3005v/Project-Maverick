
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
import { OnboardingPlanItem } from '@/ai/flows/generate-onboarding-plan';


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

  const handleWeekTopicChange = (weekIndex: number, value: string) => {
    const updatedPlan = [...editedPlan];
    updatedPlan[weekIndex].topic = value;
    setEditedPlan(updatedPlan);
  };
  
  const handleTaskChange = (weekIndex: number, taskIndex: number, value: string) => {
    const updatedPlan = [...editedPlan];
    updatedPlan[weekIndex].tasks[taskIndex] = value;
    setEditedPlan(updatedPlan);
  };

  const handleAddTask = (weekIndex: number) => {
    const updatedPlan = [...editedPlan];
    updatedPlan[weekIndex].tasks.push('New task');
    setEditedPlan(updatedPlan);
  };

  const handleRemoveTask = (weekIndex: number, taskIndex: number) => {
    const updatedPlan = [...editedPlan];
    updatedPlan[weekIndex].tasks.splice(taskIndex, 1);
    setEditedPlan(updatedPlan);
  };

  const handleAddWeek = () => {
    const newWeekNumber = editedPlan.length > 0 ? parseInt(editedPlan[editedPlan.length - 1].week.split(' ')[1]) + 1 : 1;
    setEditedPlan([
      ...editedPlan,
      {
        week: `Week ${newWeekNumber}`,
        topic: 'New Topic',
        tasks: ['New task'],
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
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">Edit Onboarding Plan</DialogTitle>
          <DialogDescription>
            Modify the plan for {trainee.name}. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 max-h-[60vh] overflow-y-auto p-4">
          {editedPlan.map((week, weekIndex) => (
            <div key={weekIndex} className="space-y-4 p-4 border rounded-md relative">
              <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => handleRemoveWeek(weekIndex)}>
                  <X className="h-4 w-4" />
              </Button>
              <h4 className="font-semibold">{week.week}</h4>
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
                  <div key={taskIndex} className="flex items-center gap-2">
                    <Textarea
                      value={task}
                      onChange={(e) => handleTaskChange(weekIndex, taskIndex, e.target.value)}
                      rows={1}
                      className="flex-grow"
                    />
                    <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveTask(weekIndex, taskIndex)}>
                      <X className="h-4 w-4 text-red-500" />
                    </Button>
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
