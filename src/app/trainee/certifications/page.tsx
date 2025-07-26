
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

    // Border
    doc.rect(5, 5, pageWidth - 10, doc.internal.pageSize.getHeight() - 10);

    // Hexaware Company Name (Top Left)
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Hexaware", 15, 20);
    
    // Maverick Mindset Logo Placeholder (Top Right)
    doc.setFillColor(224, 224, 224); // Light grey box as placeholder
    doc.rect(pageWidth - 45, 15, 30, 10, 'F');
    doc.setFontSize(8);
    doc.text("Logo", pageWidth - 30, 21, {align: 'center'});


    // Main Header
    doc.setFontSize(30);
    doc.setFont("helvetica", "bold");
    doc.text("React Basics Certification", pageWidth / 2, 60, { align: "center" });

    // Body Text
    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.text("This certifies that", pageWidth / 2, 90, { align: "center" });

    // Trainee Name
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(63, 131, 248); // Primary color
    doc.text(trainee.name, pageWidth / 2, 110, { align: "center" });
    doc.setTextColor(0, 0, 0);

    // Trainee Department
    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.text(`(${trainee.department} Department)`, pageWidth / 2, 120, { align: "center" });

    // Completion Text
    const completionText = `has successfully completed the "React Basics" course and demonstrated\nproficiency in fundamental concepts.`;
    doc.setFontSize(12);
    doc.text(completionText, pageWidth / 2, 140, { align: "center" });

    // Footer
    const issueDate = "7/26/2025";
    const footerY = doc.internal.pageSize.getHeight() - 30;

    // Issue Date
    doc.setFontSize(10);
    doc.text(`Issued on: ${issueDate}`, 15, footerY);

    // Maverick Mindset Name
    doc.setFont("helvetica", "bold");
    doc.text("Maverick Mindset", pageWidth - 15, footerY, { align: 'right' });


    doc.save(`${trainee.name}-react-basics-certificate.pdf`);
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
          <CardTitle>React Basics Certification</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground mb-4">
            This certifies that you have successfully completed the React Basics course and demonstrated proficiency in fundamental concepts.
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
