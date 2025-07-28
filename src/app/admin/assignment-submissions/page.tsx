
'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Inbox, File, Download } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Submission, getAllSubmissions } from '@/services/submission-service';
import { formatDistanceToNow } from 'date-fns';


export default function AssignmentSubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubmissions = async () => {
      setLoading(true);
      const fetchedSubmissions = await getAllSubmissions();
      setSubmissions(fetchedSubmissions);
      setLoading(false);
    };

    fetchSubmissions();
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-4">Loading Submissions...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="mb-8">
        <h1 className="text-4xl font-headline font-bold">Assignment Submissions</h1>
        <p className="text-muted-foreground">Review and track all assignment submissions from trainees.</p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>
            <Inbox className="mr-2 h-6 w-6" />
            Submission Inbox
          </CardTitle>
          <CardDescription>
            This list shows all files submitted by trainees, sorted by the most recent.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Trainee Name</TableHead>
                  <TableHead>Assignment</TableHead>
                  <TableHead>File Name</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                 {submissions.length === 0 && !loading && (
                    <TableRow>
                        <TableCell colSpan={5} className="text-center h-24">No submissions yet.</TableCell>
                    </TableRow>
                )}
                {submissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell className="font-medium">{submission.traineeName}</TableCell>
                    <TableCell>{submission.assignmentTitle}</TableCell>
                    <TableCell>
                        <div className="flex items-center gap-2">
                           <File className="h-4 w-4 text-muted-foreground" />
                           <div>
                                <p>{submission.fileName}</p>
                                <p className="text-xs text-muted-foreground">{formatFileSize(submission.fileSize)}</p>
                           </div>
                        </div>
                    </TableCell>
                    <TableCell>
                      {formatDistanceToNow(new Date(submission.submittedAt), { addSuffix: true })}
                    </TableCell>
                    <TableCell className="text-right">
                        <Button variant="outline" size="sm" disabled>
                            <Download className="mr-2" /> Download
                        </Button>
                        <Badge variant="secondary" className="ml-2">Not Reviewed</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      <div className="text-center mt-12">
        <Link href="/admin/dashboard">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
