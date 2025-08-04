
'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Upload, FileText, Loader2, CheckCircle, X, ChevronsUpDown } from "lucide-react";
import Link from "next/link";
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { getTraineeByEmail, Trainee } from '@/services/trainee-service';
import { addSubmission, getAllSubmissions } from '@/services/submission-service';
import type { Submission } from '@/services/submission-service';
import { storage } from '@/lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export const dynamic = 'force-dynamic';

function FileUploader({ assignmentTitle, trainee, onUploadSuccess }: { assignmentTitle: string, trainee: Trainee, onUploadSuccess: (title: string) => void }) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          variant: 'destructive',
          title: 'File Too Large',
          description: 'Please select a file smaller than 10MB.',
        });
        return;
      }
      setSelectedFile(file);
      setUploadSuccess(false);
      setUploadProgress(0);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setUploadSuccess(false);
    setUploadProgress(0);
    const fileInput = document.getElementById(`dropzone-file-${assignmentTitle}`) as HTMLInputElement;
    if (fileInput) {
        fileInput.value = '';
    }
  };

  const handleSubmit = () => {
    if (!selectedFile) {
      toast({ variant: 'destructive', title: 'No File Selected' });
      return;
    }
    setIsUploading(true);
    setUploadSuccess(false);
    setUploadProgress(0);

    const storageRef = ref(storage, `submissions/${trainee.id}/${Date.now()}-${selectedFile.name}`);
    const uploadTask = uploadBytesResumable(storageRef, selectedFile);

    uploadTask.on('state_changed', 
      (snapshot) => {
        setUploadProgress((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
      },
      (error) => {
        setIsUploading(false);
        toast({ variant: 'destructive', title: 'Upload Failed' });
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
          try {
              await addSubmission({
                  assignmentTitle,
                  traineeId: trainee.id,
                  traineeName: trainee.name,
                  fileName: selectedFile.name,
                  fileType: selectedFile.type,
                  fileSize: selectedFile.size,
                  fileUrl: downloadURL,
                  submittedAt: new Date(),
              });
      
              setIsUploading(false);
              setUploadSuccess(true);
              onUploadSuccess(assignmentTitle);
              toast({ title: 'Upload Successful!', description: `"${selectedFile.name}" has been submitted.` });
          } catch (error) {
              setIsUploading(false);
              toast({ variant: 'destructive', title: 'Submission Failed' });
          }
        });
      }
    );
  };

  return (
    <div className='space-y-4'>
        {!selectedFile ? (
            <label htmlFor={`dropzone-file-${assignmentTitle}`} className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted/80">
                <Upload className="w-8 h-8 mb-3 text-muted-foreground" />
                <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                <p className="text-xs text-muted-foreground">ZIP, RAR, or PDF (MAX. 10MB)</p>
                <input id={`dropzone-file-${assignmentTitle}`} type="file" className="hidden" onChange={handleFileChange} />
            </label>
        ) : (
            <div className="p-4 border rounded-lg bg-muted/50 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <FileText className="h-6 w-6 text-primary" />
                        <div>
                            <p className="font-medium">{selectedFile.name}</p>
                            <p className="text-sm text-muted-foreground">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={handleRemoveFile} disabled={isUploading}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>
                {isUploading && (
                  <div className="space-y-2">
                    <Progress value={uploadProgress} className="w-full" />
                    <p className="text-sm text-muted-foreground text-center">Uploading... {Math.round(uploadProgress)}%</p>
                  </div>
                )}
            </div>
        )}

        {uploadSuccess && (
            <div className="p-3 rounded-md bg-green-500/10 text-green-700 dark:text-green-400 flex items-center gap-3">
              <CheckCircle className="h-5 w-5" />
              <p>Successfully submitted. You can re-submit by selecting a new file.</p>
            </div>
        )}
        
        <Button onClick={handleSubmit} disabled={isUploading || !selectedFile} className="w-full sm:w-auto">
            {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Submit Assignment
        </Button>
    </div>
  );
}

export default function AssignmentsPage() {
  const [trainee, setTrainee] = useState<Trainee | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const { user, loading: authLoading } = useAuth();
  
  const fetchTraineeData = async (email: string) => {
      const traineeData = await getTraineeByEmail(email);
      setTrainee(traineeData);
      const submissionData = await getAllSubmissions();
      setSubmissions(submissionData);
  }

  useEffect(() => {
    if (!authLoading && user?.email) {
      fetchTraineeData(user.email);
    }
  }, [user, authLoading]);
  
  const handleUploadSuccess = (assignmentTitle: string) => {
    // A simple way to show the new submission without a full refetch
     setSubmissions(prev => [...prev, { assignmentTitle } as Submission]);
  }

  const getSubmittedAssignments = () => {
      if (!trainee) return new Set();
      return new Set(submissions.filter(s => s.traineeId === trainee.id).map(s => s.assignmentTitle));
  }
  const submittedAssignments = getSubmittedAssignments();


  if (authLoading || !trainee) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-4">Loading Your Assignments...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="mb-8">
        <h1 className="text-4xl font-headline font-bold">Your Assignments</h1>
        <p className="text-muted-foreground">Submit your work based on your personalized onboarding plan.</p>
      </header>
      
      {trainee.onboardingPlan && trainee.onboardingPlan.length > 0 ? (
        <div className="space-y-6">
          {trainee.onboardingPlan.map((planItem, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle>{planItem.week}: {planItem.topic}</CardTitle>
                <CardDescription>Complete the tasks below to make progress.</CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {planItem.tasks.map((task, taskIndex) => (
                    <AccordionItem value={`item-${index}-${taskIndex}`} key={taskIndex}>
                      <AccordionTrigger>
                        <div className='flex items-center gap-4'>
                           {submittedAssignments.has(task) ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <ChevronsUpDown className="h-5 w-5 text-muted-foreground" />
                          )}
                           <span>{task}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="p-4">
                        <FileUploader assignmentTitle={task} trainee={trainee} onUploadSuccess={handleUploadSuccess} />
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center p-8">
          <CardContent>
            <p className="mb-4">You don't have a personalized onboarding plan yet.</p>
            <Link href="/trainee/onboarding-plan">
              <Button>Generate Your Plan</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      <div className="text-center mt-12">
        <Link href="/trainee/dashboard">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
