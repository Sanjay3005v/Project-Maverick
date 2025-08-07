
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
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { LoaderCircle, Wand2, Send } from 'lucide-react';
import type { Trainee } from '@/services/trainee-service';
import { generateCatchUpPlan } from '@/ai/flows/generate-catch-up-plan';
import type { OnboardingPlanItem } from '@/lib/plan-schema';
import { saveOnboardingPlan } from '@/services/trainee-service';

interface GetOnTrackDialogProps {
  trainee: Trainee;
  onPlanAssigned: () => void;
  children: React.ReactNode;
}

export function GetOnTrackDialog({ trainee, onPlanAssigned, children }: GetOnTrackDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [catchUpPlan, setCatchUpPlan] = useState<OnboardingPlanItem | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleGeneratePlan = async () => {
    setLoading(true);
    setCatchUpPlan(null);
    try {
      const result = await generateCatchUpPlan({
          name: trainee.name,
          progress: trainee.progress,
          department: trainee.department,
          currentPlan: trainee.onboardingPlan || [],
      });
      setCatchUpPlan(result);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'An unexpected error occurred while generating the plan.',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleAssignPlan = async () => {
      if (!catchUpPlan) return;
      setLoading(true);
      try {
          // Prepend the catch-up plan to the existing plan
          const newPlan = [catchUpPlan, ...(trainee.onboardingPlan || [])];
          await saveOnboardingPlan(trainee.id, newPlan);
          toast({
              title: "Plan Assigned!",
              description: `The catch-up plan has been assigned to ${trainee.name}.`
          });
          onPlanAssigned();
          setIsOpen(false);
      } catch (error) {
          toast({
              variant: 'destructive',
              title: 'Error',
              description: 'An unexpected error occurred while assigning the plan.',
          });
      } finally {
          setLoading(false);
      }

  }


  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">AI-Powered Intervention Plan</DialogTitle>
          <DialogDescription>
            Generate a targeted, one-week catch-up plan for {trainee.name}.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 max-h-[60vh] overflow-y-auto">
          {loading && !catchUpPlan && (
            <div className="flex items-center justify-center h-48">
              <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-4 text-muted-foreground">Generating plan...</p>
            </div>
          )}
          {catchUpPlan && (
             <Alert variant="default" className="bg-primary/5 border-primary/20">
              <Wand2 className="h-4 w-4 !text-primary" />
              <AlertTitle className="font-headline text-primary">{catchUpPlan.week}: {catchUpPlan.topic}</AlertTitle>
              <AlertDescription className="prose prose-sm text-foreground">
                <ul className="list-disc pl-5 mt-2 space-y-1">
                    {catchUpPlan.tasks.map((task, i) => (
                        <li key={i}>{task}</li>
                    ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
          {!catchUpPlan && !loading && (
             <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-lg bg-muted/50">
              <p className="text-muted-foreground">Click below to generate an intervention plan.</p>
            </div>
          )}
        </div>
        <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-between gap-2 pt-4 border-t">
            <div>
             {catchUpPlan && !loading && (
                  <Button variant="secondary" onClick={handleAssignPlan}>
                      <Send className="mr-2 h-4 w-4" />
                      Assign Plan
                  </Button>
              )}
            </div>
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                    {catchUpPlan ? 'Close' : 'Cancel'}
                </Button>
                <Button onClick={handleGeneratePlan} disabled={loading}>
                    {loading ? (
                    <>
                        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                    </>
                    ) : (
                    <>
                        <Wand2 className="mr-2 h-4 w-4" />
                        {catchUpPlan ? 'Regenerate' : 'Generate Plan'}
                    </>
                    )}
                </Button>
            </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
