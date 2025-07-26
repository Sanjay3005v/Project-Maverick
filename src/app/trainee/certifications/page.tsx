
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Download } from "lucide-react";
import Link from "next/link";
import jsPDF from 'jspdf';
import { useAuth } from "@/hooks/use-auth";

export default function CertificationsPage() {
  const { user } = useAuth();
  
  const handleDownload = () => {
    const doc = new jsPDF();

    // Add border
    doc.rect(5, 5, doc.internal.pageSize.width - 10, doc.internal.pageSize.height - 10);

    // Add title
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("Certificate of Completion", doc.internal.pageSize.width / 2, 30, { align: "center" });

    // Add icon (simple placeholder)
    doc.setFontSize(40);
    doc.text("🏆", doc.internal.pageSize.width / 2, 60, { align: "center" });

    // Add "This certifies that"
    doc.setFontSize(16);
    doc.setFont("helvetica", "normal");
    doc.text("This certifies that", doc.internal.pageSize.width / 2, 80, { align: "center" });

    // Add trainee name
    doc.setFontSize(26);
    doc.setFont("helvetica", "bold");
    doc.text(user?.displayName || "Trainee User", doc.internal.pageSize.width / 2, 100, { align: "center" });

    // Add completion text
    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    const completionText = `has successfully completed the "React Basics" course and has demonstrated\nproficiency in fundamental concepts of React development.`;
    doc.text(completionText, doc.internal.pageSize.width / 2, 120, { align: "center" });

    // Add issue date
    const issueDate = new Date().toLocaleDateString();
    doc.setFontSize(12);
    doc.text(`Issued on: ${issueDate}`, doc.internal.pageSize.width / 2, 150, { align: "center" });

    // Add signature lines
    doc.line(40, 180, 100, 180);
    doc.text("Program Coordinator", 70, 185, { align: "center" });

    doc.line(doc.internal.pageSize.width - 100, 180, doc.internal.pageSize.width - 40, 180);
    doc.text("Maverick Mindset Inc.", doc.internal.pageSize.width - 70, 185, { align: "center" });

    doc.save("react-basics-certificate.pdf");
  };

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
          <Button className="mt-6 w-full" onClick={handleDownload}>
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
