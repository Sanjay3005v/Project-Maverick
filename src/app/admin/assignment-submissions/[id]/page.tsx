
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Loader2, ArrowLeft, User, Calendar, File, Download, MessageSquare, Star, Send } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Submission, getSubmissionById, addReviewToSubmission } from '@/services/submission-service';
import { format } from 'date-fns';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';

export const dynamic = 'force-dynamic';

function ReviewForm({ submissionId, onReviewAdded }: { submissionId: string; onReviewAdded: () => void }) {
  const [score, setScore] = useState(85);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) {
      toast({ variant: 'destructive', title: 'Feedback is required' });
      return;
    }
    setLoading(true);
    try {
      await addReviewToSubmission(submissionId, { score, feedback });
      toast({ title: 'Review Submitted!', description: 'The trainee will be notified.' });
      onReviewAdded();
      setFeedback('');
    } catch (error) {
      toast({ variant: 'destructive', title: 'Submission Failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <Label htmlFor="score">Score: {score}/100</Label>
        <Slider
          id="score"
          min={0}
          max={100}
          step={1}
          value={[score]}
          onValueChange={(value) => setScore(value[0])}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="feedback">Feedback</Label>
        <Textarea
          id="feedback"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Provide constructive feedback for the trainee..."
          rows={5}
        />
      </div>
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? <Loader2 className="animate-spin mr-2" /> : <Send className="mr-2" />}
        Submit Review
      </Button>
    </form>
  );
}


export default function SubmissionReviewPage() {
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : '';

  const fetchSubmission = async () => {
    if (id) {
        setLoading(true);
        const fetchedSubmission = await getSubmissionById(id);
        setSubmission(fetchedSubmission);
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmission();
  }, [id]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDownload = () => {
    if (!submission?.fileUrl) return;
    window.open(submission.fileUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-4">Loading Submission Details...</p>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="container mx-auto p-4 md:p-8 text-center">
        <h1 className="text-2xl font-bold">Submission Not Found</h1>
        <p className="text-muted-foreground">The requested submission could not be found.</p>
        <Link href="/admin/assignment-submissions" className="mt-4 inline-block">
          <Button variant="outline">
            <ArrowLeft className="mr-2" /> Back to Submissions
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="mb-8">
         <Link href="/admin/assignment-submissions" className="flex items-center text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to All Submissions
        </Link>
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-headline font-bold">Review Submission</h1>
          <Badge variant={submission.review ? 'default' : 'secondary'} className={submission.review ? 'bg-green-500' : ''}>
              {submission.review ? 'Reviewed' : 'Not Reviewed'}
          </Badge>
        </div>
        <p className="text-muted-foreground">Details for the assignment submitted by {submission.traineeName}.</p>
      </header>

      <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Submission Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="flex items-center gap-3">
                        <User className="h-5 w-5 text-muted-foreground" />
                        <div>
                            <p className="text-sm text-muted-foreground">Trainee Name</p>
                            <p className="font-medium">{submission.traineeName}</p>
                        </div>
                    </div>
                     <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                        <div>
                            <p className="text-sm text-muted-foreground">Submitted On</p>
                            <p className="font-medium">{format(new Date(submission.submittedAt.toString()), "PPP p")}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <File className="h-5 w-5 text-muted-foreground" />
                        <div>
                            <p className="text-sm text-muted-foreground">File</p>
                            <p className="font-medium">{submission.fileName} ({formatFileSize(submission.fileSize)})</p>
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleDownload} disabled={!submission.fileUrl}>
                        <Download className="mr-2" /> Download Submitted File
                    </Button>
                </CardFooter>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Feedback & Grading</CardTitle>
                     <CardDescription>Provide your review for this submission.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ReviewForm submissionId={id} onReviewAdded={fetchSubmission} />
                </CardContent>
            </Card>

          </div>
          <div className="space-y-6">
                {submission.review && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Existing Review</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <div className="flex items-center gap-3">
                                <Star className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Score</p>
                                    <p className="font-bold text-lg text-primary">{submission.review.score}/100</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <MessageSquare className="h-5 w-5 text-muted-foreground mt-1" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Feedback</p>
                                    <p className="font-medium whitespace-pre-wrap">{submission.review.feedback}</p>
                                </div>
                            </div>
                             <div className="flex items-center gap-3">
                                <Calendar className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Reviewed On</p>
                                    <p className="font-medium">{format(new Date(submission.review.reviewedAt.toString()), "PPP p")}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
          </div>
      </div>
    </div>
  );
}
