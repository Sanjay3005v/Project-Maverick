
'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Upload, FileText, Loader2, CheckCircle, X } from "lucide-react";
import Link from "next/link";
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { getTraineeByEmail, Trainee } from '@/services/trainee-service';
import { addSubmission } from '@/services/submission-service';
import { storage } from '@/lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { Progress } from '@/components/ui/progress';

export default function AssignmentsPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [trainee, setTrainee] = useState<Trainee | null>(null);

  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  
  useEffect(() => {
    if (!authLoading && user?.email) {
      const fetchTrainee = async () => {
        const traineeData = await getTraineeByEmail(user.email);
        setTrainee(traineeData);
      }
      fetchTrainee();
    }
  }, [user, authLoading]);


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
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      toast({
        variant: 'destructive',
        title: 'No File Selected',
        description: 'Please select a file to submit.',
      });
      return;
    }

    if (!trainee) {
       toast({
        variant: 'destructive',
        title: 'User not found',
        description: 'Could not submit assignment, user data is missing.',
      });
      return;
    }

    setIsUploading(true);
    setUploadSuccess(false);
    setUploadProgress(0);

    const storageRef = ref(storage, `submissions/${trainee.id}/${Date.now()}-${selectedFile.name}`);
    const uploadTask = uploadBytesResumable(storageRef, selectedFile);

    uploadTask.on('state_changed', 
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        console.error("Upload failed:", error);
        setIsUploading(false);
        toast({
          variant: 'destructive',
          title: 'Upload Failed',
          description: 'There was an error uploading your file. Please try again.',
        });
      },
      async () => {
        try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
    
            await addSubmission({
                assignmentTitle: "Build a Personal Portfolio",
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
            toast({
                title: 'Upload Successful!',
                description: `Your file "${selectedFile.name}" has been submitted for review.`,
            });
        } catch (error) {
            setIsUploading(false);
            toast({
                variant: 'destructive',
                title: 'Submission Failed',
                description: 'There was an error saving your assignment details. Please try again.',
            });
        }
      }
    );
  };

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
          <p className="mb-6">
            Create a personal portfolio website using React and Tailwind CSS. The portfolio should showcase your skills, projects, and include a contact form. Deploy the final version to a hosting service of your choice and submit a link or the source code.
          </p>
          {!selectedFile ? (
            <div className="flex items-center justify-center w-full">
              <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted/80 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-10 h-10 mb-3 text-muted-foreground" />
                      <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                      <p className="text-xs text-muted-foreground">ZIP, RAR, or PDF (MAX. 10MB)</p>
                  </div>
                  <input id="dropzone-file" type="file" className="hidden" onChange={handleFileChange} />
              </label>
            </div>
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

          {uploadSuccess && selectedFile && (
              <div className="mt-4 p-3 rounded-md bg-green-500/10 text-green-700 dark:text-green-400 flex items-center gap-3">
                <CheckCircle className="h-5 w-5" />
                <p>Successfully submitted: {selectedFile.name}</p>
              </div>
          )}

        </CardContent>
        <CardFooter>
            <Button onClick={handleSubmit} disabled={isUploading || !selectedFile} className="w-full sm:w-auto">
                {isUploading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                    </>
                ) : (
                    'Submit Assignment'
                )}
            </Button>
        </CardFooter>
      </Card>
      <div className="text-center mt-12">
          <Link href="/trainee/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
      </div>
    </div>
  );
}
