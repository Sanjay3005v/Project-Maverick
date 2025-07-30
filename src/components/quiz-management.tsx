
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, X, LoaderCircle, Edit, Trash2, Wand2, Upload } from 'lucide-react';
import { Quiz, getAllQuizzes, setDailyQuiz, addQuiz, deleteQuiz } from '@/services/quiz-service';
import { EditQuizDialog } from './edit-quiz-dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import * as XLSX from 'xlsx';
import { generateQuiz } from '@/ai/flows/generate-quiz-flow';
import { generateQuizFromDocument } from '@/ai/flows/generate-quiz-from-doc-flow';


// Manual Quiz Form Component
function ManualQuizForm({ onQuizCreated }: { onQuizCreated: () => void }) {
    const [newQuiz, setNewQuiz] = useState<Omit<Quiz, 'id' | 'isDailyQuiz'>>({
        title: '',
        topic: '',
        questions: [{ question: '', options: ['', '', '', ''], answer: '' }],
    });
    const { toast } = useToast();

    const handleAddQuestion = () => {
        setNewQuiz(prev => ({
            ...prev,
            questions: [...prev.questions, { question: '', options: ['', '', '', ''], answer: '' }]
        }));
    };

    const handleRemoveQuestion = (index: number) => {
        const updatedQuestions = [...newQuiz.questions];
        updatedQuestions.splice(index, 1);
        setNewQuiz(prev => ({ ...prev, questions: updatedQuestions }));
    }

    const handleNewQuizChange = (field: 'title' | 'topic', value: string) => {
        setNewQuiz(prev => ({ ...prev, [field]: value }));
    }

    const handleQuestionChange = (qIndex: number, field: 'question' | 'answer', value: string) => {
        const updatedQuestions = [...newQuiz.questions];
        updatedQuestions[qIndex] = { ...updatedQuestions[qIndex], [field]: value };
        setNewQuiz(prev => ({ ...prev, questions: updatedQuestions }));
    }

    const handleOptionChange = (qIndex: number, oIndex: number, value: string) => {
        const updatedQuestions = [...newQuiz.questions];
        const updatedOptions = [...updatedQuestions[qIndex].options];
        updatedOptions[oIndex] = value;
        updatedQuestions[qIndex] = { ...updatedQuestions[qIndex], options: updatedOptions };
        setNewQuiz(prev => ({ ...prev, questions: updatedQuestions }));
    }

    const handleCreateQuiz = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await addQuiz(newQuiz);
            onQuizCreated();
            setNewQuiz({ title: '', topic: '', questions: [{ question: '', options: ['', '', '', ''], answer: '' }] });
            toast({
                title: 'Quiz Created!',
                description: `The quiz "${newQuiz.title}" has been successfully created.`
            })
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: `Failed to create quiz.`,
            })
        }
    }

    return (
        <form onSubmit={handleCreateQuiz}>
            <CardHeader>
                <CardTitle>Create New Quiz</CardTitle>
                <CardDescription>
                    Add a new quiz to the question bank by filling out the fields below.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 max-h-[60vh] overflow-y-auto p-6">
                <div className="space-y-2">
                    <Label htmlFor="quiz-title">Quiz Title</Label>
                    <Input id="quiz-title" value={newQuiz.title} onChange={e => handleNewQuizChange('title', e.target.value)} placeholder="e.g., Advanced JavaScript" required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="quiz-topic">Topic</Label>
                    <Input id="quiz-topic" value={newQuiz.topic} onChange={e => handleNewQuizChange('topic', e.target.value)} placeholder="e.g., Frontend Development" required />
                </div>

                {newQuiz.questions.map((q, qIndex) => (
                    <div key={qIndex} className="space-y-4 p-4 border rounded-md relative">
                        {newQuiz.questions.length > 1 && (
                            <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => handleRemoveQuestion(qIndex)}>
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                        <h4 className="font-semibold">Question {qIndex + 1}</h4>
                        <div className="space-y-2">
                            <Label htmlFor={`q-text-${qIndex}`}>Question Text</Label>
                            <Textarea id={`q-text-${qIndex}`} value={q.question} onChange={e => handleQuestionChange(qIndex, 'question', e.target.value)} placeholder="What is a closure?" required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {q.options.map((opt, oIndex) => (
                                <div key={oIndex} className="space-y-2">
                                    <Label htmlFor={`q-${qIndex}-opt-${oIndex}`}>Option {oIndex + 1}</Label>
                                    <Input id={`q-${qIndex}-opt-${oIndex}`} value={opt} onChange={e => handleOptionChange(qIndex, oIndex, e.target.value)} required />
                                </div>
                            ))}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor={`q-answer-${qIndex}`}>Correct Answer</Label>
                            <Input id={`q-answer-${qIndex}`} value={q.answer} onChange={e => handleQuestionChange(qIndex, 'answer', e.target.value)} placeholder="Enter the exact text of the correct option" required />
                        </div>
                    </div>
                ))}
                <Button type="button" variant="outline" onClick={handleAddQuestion} className="w-full">
                    <PlusCircle className="mr-2" /> Add Another Question
                </Button>

            </CardContent>
            <CardFooter>
                <Button type="submit" className="w-full">Create Quiz</Button>
            </CardFooter>
        </form>
    );
}

// AI-powered Upload Component
function UploadQuizForm({ onQuizCreated }: { onQuizCreated: () => void }) {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            toast({ variant: 'destructive', title: 'No file selected' });
            return;
        }
        setLoading(true);

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = e.target?.result;
                let documentContent = '';

                if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
                    const workbook = XLSX.read(data, { type: 'array' });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    const json: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                    documentContent = json.map(row => row.join(' ')).join('\n');
                } else if (file.type === 'text/plain') {
                    documentContent = data as string;
                } else {
                    throw new Error("Unsupported file type. Please upload an Excel (.xlsx) or Text (.txt) file.");
                }

                if (!documentContent.trim()) {
                    throw new Error("The uploaded file is empty or contains no readable text.");
                }
                
                const topic = file.name.replace(/\.[^/.]+$/, "");
                const result = await generateQuizFromDocument({ topic, documentContent, numQuestions: 10 });

                await addQuiz(result);
                toast({ title: 'Success!', description: `AI has generated a quiz from "${file.name}".` });
                onQuizCreated();
                setFile(null);
                 // Reset file input
                const fileInput = document.getElementById('doc-upload') as HTMLInputElement;
                if(fileInput) fileInput.value = '';

            } catch (error: any) {
                toast({ variant: 'destructive', title: 'Generation Failed', description: error.message || 'Could not process the file.' });
            } finally {
                setLoading(false);
            }
        };

        if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
            reader.readAsArrayBuffer(file);
        } else {
            reader.readAsText(file);
        }
    };

    return (
        <CardContent className="space-y-6">
            <p className="text-sm text-muted-foreground">
                Upload a document (.xlsx, .txt) with content, and the AI will generate a quiz based on it.
            </p>
            <div className="space-y-2">
                <Label htmlFor="doc-upload">Document File</Label>
                <Input id="doc-upload" type="file" accept=".xlsx,.txt" onChange={handleFileChange} />
            </div>
            <Button onClick={handleUpload} disabled={!file || loading} className="w-full">
                {loading ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                Upload and Generate with AI
            </Button>
        </CardContent>
    );
}

// AI Topic Generation Component
function AIGeneratedQuizForm({ onQuizCreated }: { onQuizCreated: () => void }) {
    const [topic, setTopic] = useState('');
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const handleGenerate = async () => {
        if (!topic.trim()) {
            toast({ variant: 'destructive', title: 'Topic is required' });
            return;
        }
        setLoading(true);

        try {
            const result = await generateQuiz({ topic, numQuestions: 10 });
            await addQuiz(result);
            toast({ title: 'Success!', description: `AI has generated and saved a quiz on "${topic}".` });
            onQuizCreated();
            setTopic('');
        } catch (error) {
            toast({ variant: 'destructive', title: 'Generation Failed', description: 'The AI could not generate the quiz. Please try a different topic.' });
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <CardContent className="space-y-6">
             <p className="text-sm text-muted-foreground">
                Enter a topic, and the AI will generate a 10-question quiz for you.
            </p>
            <div className="space-y-2">
                <Label htmlFor="ai-topic">Quiz Topic</Label>
                <Input id="ai-topic" placeholder="e.g., React Hooks, SQL Joins, Python Fundamentals" value={topic} onChange={(e) => setTopic(e.target.value)} />
            </div>
             <Button onClick={handleGenerate} disabled={loading} className="w-full">
                {loading ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                Generate with AI
            </Button>
        </CardContent>
    );
}


// Main Component
export function QuizManagement() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  const fetchQuizzes = async () => {
    setLoading(true);
    const allQuizzes = await getAllQuizzes();
    setQuizzes(allQuizzes);
    setLoading(false);
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const handleSetDailyQuiz = async (quizId: string) => {
    try {
      await setDailyQuiz(quizId);
      fetchQuizzes(); // Refetch to update UI state
      toast({
          title: 'Daily Quiz Updated',
          description: `The daily quiz has been successfully updated.`,
      })
    } catch(error) {
       toast({
          variant: 'destructive',
          title: 'Error',
          description: `Failed to set daily quiz.`,
      })
    }
  };

  const handleDeleteQuiz = async (quizId: string, quizTitle: string) => {
    try {
        await deleteQuiz(quizId);
        fetchQuizzes(); // Refetch
        toast({
            title: "Quiz Deleted",
            description: `The quiz "${quizTitle}" has been deleted.`,
        });
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to delete quiz.",
        });
    }
  }

  if (loading) {
      return (
          <div className="flex justify-center items-center h-64">
              <LoaderCircle className="h-8 w-8 animate-spin" />
              <p className="ml-4">Loading Quizzes...</p>
          </div>
      )
  }

  return (
    <div className="grid md:grid-cols-2 gap-8 items-start">
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Existing Quizzes</CardTitle>
            <CardDescription>
              Manage all available quizzes and set the daily quiz.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {quizzes.map(quiz => (
              <div key={quiz.id} className="p-4 border rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h4 className="font-bold">{quiz.title}</h4>
                  <p className="text-sm text-muted-foreground">{quiz.topic} - {quiz.questions.length} questions</p>
                </div>
                <div className="flex gap-2 shrink-0">
                    <EditQuizDialog quiz={quiz} onQuizUpdated={fetchQuizzes} />
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="icon"><Trash2 /></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the quiz "{quiz.title}".
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteQuiz(quiz.id, quiz.title)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    <Button 
                        onClick={() => handleSetDailyQuiz(quiz.id)}
                        disabled={quiz.isDailyQuiz}
                        variant={quiz.isDailyQuiz ? "secondary" : "default"}
                    >
                      {quiz.isDailyQuiz ? 'Active Daily' : 'Set as Daily'}
                    </Button>
                </div>
              </div>
            ))}
             {quizzes.length === 0 && (
                <div className="text-center text-muted-foreground p-8">
                    No quizzes found. Create one using the methods on the right.
                </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Card className="sticky top-24">
        <Tabs defaultValue="manual">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="manual">Manual</TabsTrigger>
                <TabsTrigger value="upload">Upload</TabsTrigger>
                <TabsTrigger value="ai">AI Topic</TabsTrigger>
            </TabsList>
            <TabsContent value="manual">
                <ManualQuizForm onQuizCreated={fetchQuizzes} />
            </TabsContent>
            <TabsContent value="upload">
                <UploadQuizForm onQuizCreated={fetchQuizzes} />
            </TabsContent>
            <TabsContent value="ai">
                <AIGeneratedQuizForm onQuizCreated={fetchQuizzes} />
            </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
