import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText } from "lucide-react";
import Link from "next/link";

export default function AssignmentsPage() {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="mb-8">
        <h1 className="text-4xl font-headline font-bold">Assignments</h1>
        <p className="text-muted-foreground">Submit your work and track your feedback.</p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>Assignment: Build a Personal Portfolio</CardTitle>
          <CardDescription>Due: 2 weeks from start</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Create a personal portfolio website using React and Tailwind CSS. The portfolio should showcase your skills, projects, and include a contact form. Deploy the final version to a hosting service of your choice.
          </p>
          <div className="flex items-center justify-center w-full">
            <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted/80 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-10 h-10 mb-3 text-muted-foreground" />
                    <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                    <p className="text-xs text-muted-foreground">ZIP, RAR, or PDF (MAX. 10MB)</p>
                </div>
                <input id="dropzone-file" type="file" className="hidden" />
            </label>
        </div>
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