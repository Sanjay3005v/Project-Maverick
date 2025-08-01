
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Download, Loader2 } from "lucide-react";
import Link from "next/link";
import jsPDF from 'jspdf';
import { useAuth } from "@/hooks/use-auth";
import { getTraineeByEmail, Trainee } from "@/services/trainee-service";
import { useEffect, useState }from "react";

export default function CertificationsPage() {
  const { user, loading: authLoading } = useAuth();
  const [trainee, setTrainee] = useState<Trainee | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && user?.email) {
      const fetchTrainee = async () => {
        setDataLoading(true);
        const traineeData = await getTraineeByEmail(user.email);
        setTrainee(traineeData);
        setDataLoading(false);
      }
      fetchTrainee();
    } else if (!authLoading && !user) {
      setDataLoading(false);
    }
  }, [user, authLoading]);

  const handleDownload = () => {
    if (!trainee) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const primaryColor = '#29ABE2'; // Saturated Blue from your theme
    const accentColor = '#00C698'; // Analogous Cyan
    const textColor = '#333333';

    // Decorative border
    doc.setDrawColor(primaryColor);
    doc.setLineWidth(1.5);
    doc.rect(5, 5, pageWidth - 10, pageHeight - 10);
    
    doc.setDrawColor(accentColor);
    doc.setLineWidth(0.5);
    doc.rect(8, 8, pageWidth - 16, pageHeight - 16);
    
    // Header
    doc.setTextColor(primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text("Maverick Mindset", pageWidth / 2, 30, { align: 'center' });

    // Main Title
    doc.setFontSize(32);
    doc.setTextColor(textColor);
    doc.text("Certificate of Completion", pageWidth / 2, 60, { align: 'center' });

    // Subtitle
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text("This certificate is proudly presented to", pageWidth / 2, 85, { align: 'center' });
    
    // Trainee Name
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryColor);
    doc.text(trainee.name, pageWidth / 2, 105, { align: 'center' });
    
    // Department
    doc.setFontSize(12);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(textColor);
    doc.text(`(${trainee.department} Department)`, pageWidth / 2, 115, { align: 'center' });

    // Completion Text
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    const completionText = `For successfully completing the comprehensive onboarding program and demonstrating exceptional skill and dedication.`;
    doc.text(completionText, pageWidth / 2, 140, { align: "center" });

    // Footer lines
    const lineY = pageHeight - 60;
    doc.setDrawColor(textColor);
    doc.line(30, lineY, 90, lineY); // Line for Date
    doc.line(pageWidth - 90, lineY, pageWidth - 30, lineY); // Line for Signature

    // Footer labels
    doc.setFontSize(10);
    doc.text("Issue Date", 60, lineY + 5, { align: "center" });
    doc.text("Training Director", pageWidth - 60, lineY + 5, { align: "center" });

    // Footer values
    doc.setFontSize(12);
    doc.text(new Date().toLocaleDateString(), 60, lineY - 2, { align: "center" });

    // Add a stylized signature (as text)
    doc.setFont("cursive", "normal");
    doc.text("A. Supervisor", pageWidth - 60, lineY - 2, { align: "center" });


    doc.save(`${trainee.name}-training-completion-certificate.pdf`);
  };
  
  if (authLoading || dataLoading) {
      return (
          <div className="flex justify-center items-center h-screen">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p className="ml-4">Loading Certificate Data...</p>
          </div>
      )
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="mb-8">
        <h1 className="text-4xl font-headline font-bold">Certifications</h1>
        <p className="text-muted-foreground">View and download your earned certifications.</p>
      </header>
      <Card className="max-w-md mx-auto">
        <CardHeader className="items-center text-center">
            <Award className="w-16 h-16 text-primary" />
          <CardTitle>Training Completion Certificate</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground mb-4">
            This certifies that you have successfully completed the required training modules and demonstrated proficiency in the core skills.
          </p>
          <p className="text-sm">Issued on: {new Date().toLocaleDateString()}</p>
          <Button className="mt-6 w-full" onClick={handleDownload} disabled={!trainee}>
            <Download className="mr-2 h-4 w-4" />
            Download Certificate
          </Button>
        </CardContent>
      </Card>
      <div className="text-center mt-12">
          <Link href="/trainee/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
      </div>
    </div>
  );
}
