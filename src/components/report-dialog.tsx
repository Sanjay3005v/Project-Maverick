
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
import { Loader2, Wand2, FileText, LoaderCircle } from 'lucide-react';
import type { GenerateTraineeReportInput } from '@/ai/flows/generate-trainee-report';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

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

  const handleDownloadPDF = () => {
    if (!report) return;
    const doc = new jsPDF('portrait', 'pt', 'a4');
    const tableData = trainees.map(t => [t.name, t.department, `${t.progress}%`, t.status]);

    doc.setFontSize(18);
    doc.text("Trainee Performance Report", 40, 60);

    // Use a regex to split the report but keep the headings.
    // This is a simple way to separate summary from the table part in the markdown.
    const reportParts = report.split(/(\n##\s.*)/).filter(part => part.trim() !== '');
    const summaryText = reportParts[0] || 'No summary available.';

    doc.setFontSize(11);
    doc.setTextColor(100);
    const splitSummary = doc.splitTextToSize(summaryText, 500);
    doc.text(splitSummary, 40, 80);
    
    // Calculate a safe startY based on summary length
    const summaryHeight = doc.getTextDimensions(splitSummary).h;
    const tableStartY = 80 + summaryHeight + 20;

    autoTable(doc, {
        head: [['Name', 'Department', 'Progress', 'Status']],
        body: tableData,
        startY: tableStartY,
        theme: 'grid',
        headStyles: { fillColor: [37, 171, 226] },
    });

    doc.save(`trainee-performance-report-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const handleDownloadExcel = () => {
     if (!trainees) return;
     const worksheet = XLSX.utils.json_to_sheet(trainees.map(t => ({
        Name: t.name,
        Department: t.department,
        'Progress (%)': t.progress,
        Status: t.status
     })));
     const workbook = XLSX.utils.book_new();
     XLSX.utils.book_append_sheet(workbook, worksheet, "Trainees");
     XLSX.writeFile(workbook, `trainee-performance-report-${new Date().toISOString().split('T')[0]}.xlsx`);
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
            An AI-powered summary of the selected {trainees.length} trainee(s).
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 max-h-[60vh] overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center h-48">
              <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-4 text-muted-foreground">Generating your report...</p>
            </div>
          )}
          {report && !loading && (
             <Alert variant="default" className="bg-primary/5 border-primary/20">
              <FileText className="h-4 w-4 !text-primary" />
              <AlertTitle className="font-headline text-primary">Trainee Performance Summary</AlertTitle>
              <AlertDescription className="prose prose-sm prose-p:my-2 prose-headings:my-2 prose-ul:my-1 whitespace-pre-wrap text-foreground">
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
        <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-between gap-2 pt-4 border-t">
            <div>
              {report && !loading && (
                  <div className="flex gap-2">
                    <Button variant="secondary" onClick={handleDownloadPDF}>
                      Download PDF
                    </Button>
                     <Button variant="secondary" onClick={handleDownloadExcel}>
                      Download Excel
                    </Button>
                  </div>
              )}
            </div>
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                    Close
                </Button>
                <Button onClick={handleGenerateReport} disabled={loading}>
                    {loading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                    </>
                    ) : (
                    <>
                        <Wand2 className="mr-2 h-4 w-4" />
                        {report ? 'Regenerate' : 'Generate Report'}
                    </>
                    )}
                </Button>
            </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
