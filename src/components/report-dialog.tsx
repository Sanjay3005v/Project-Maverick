
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
import { createTraineeReport } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Loader2, Wand2, Download } from 'lucide-react';
import type { GenerateTraineeReportInput } from '@/ai/flows/generate-trainee-report';

interface ReportDialogProps {
  trainees: GenerateTraineeReportInput['trainees'];
  children: React.ReactNode;
}

export function ReportDialog({ trainees, children }: ReportDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerateReport = async () => {
    setLoading(true);
    setReport(null);
    try {
      const result = await createTraineeReport(trainees);
      if (result.success && result.data) {
        setReport(result.data.report);
      } else {
        toast({
          variant: 'destructive',
          title: 'Error Generating Report',
          description: result.message,
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'An unexpected error occurred.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = () => {
    if (!report) return;

    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `trainee-performance-report-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };


  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">AI Generated Trainee Report</DialogTitle>
          <DialogDescription>
            An AI-powered summary of the current trainee progress and status.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 max-h-[60vh] overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-4 text-muted-foreground">Generating your report...</p>
            </div>
          )}
          {report && !loading && (
             <Alert variant="default" className="bg-primary/5 border-primary/20">
              <Wand2 className="h-4 w-4 !text-primary" />
              <AlertTitle className="font-headline text-primary">Trainee Performance Summary</AlertTitle>
              <AlertDescription className="prose prose-sm whitespace-pre-wrap text-foreground">
                {report}
              </AlertDescription>
            </Alert>
          )}
          {!report && !loading && (
             <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-lg bg-muted/50">
              <p className="text-muted-foreground">Click the button below to generate the report.</p>
            </div>
          )}
        </div>
        <DialogFooter className="sm:justify-between gap-2 pt-4 border-t">
            <div>
              {report && !loading && (
                  <Button variant="secondary" onClick={handleDownloadReport}>
                      <Download className="mr-2 h-4 w-4" />
                      Download Report
                  </Button>
              )}
            </div>
            <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                    Close
                </Button>
                <Button onClick={handleGenerateReport} disabled={loading}>
                    {loading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Regenerating...
                    </>
                    ) : (
                    <>
                        <Wand2 className="mr-2 h-4 w-4" />
                        {report ? 'Regenerate Report' : 'Generate Report'}
                    </>
                    )}
                </Button>
            </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
