import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Download } from "lucide-react";
import Link from "next/link";

export default function CertificationsPage() {
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
          <Button className="mt-6 w-full">
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