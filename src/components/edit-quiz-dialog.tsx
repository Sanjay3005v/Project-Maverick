
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Edit, PlusCircle, Save, X } from 'lucide-react';
import type { Quiz } from '@/services/quiz-service';
import { updateQuiz } from '@/services/quiz-service';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';


interface EditQuizDialogProps {
  quiz: Quiz;
  onQuizUpdated: () => void;
}

export function EditQuizDialog({ quiz, onQuizUpdated }: EditQuizDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [editedQuiz, setEditedQuiz] = useState<Omit<Quiz, 'id' | 'isDailyQuiz'>>({
      title: quiz.title,
      topic: quiz.topic,
      questions: JSON.parse(JSON.stringify(quiz.questions)) // Deep copy
  });

  const handleFieldChange = (field: 'title' | 'topic', value: string) => {
      setEditedQuiz(prev => ({...prev, [field]: value}));
  }

  const handleQuestionChange = (qIndex: number, field: 'question' | 'answer', value: string) => {
    const updatedQuestions = [...editedQuiz.questions];
    updatedQuestions[qIndex] = {...updatedQuestions[qIndex], [field]: value};
    setEditedQuiz(prev => ({...prev, questions: updatedQuestions}));
  }

  const handleOptionChange = (qIndex: number, oIndex: number, value: string) => {
    const updatedQuestions = [...editedQuiz.questions];
    const updatedOptions = [...updatedQuestions[qIndex].options];
    updatedOptions[oIndex] = value;
    updatedQuestions[qIndex] = {...updatedQuestions[qIndex], options: updatedOptions};
    setEditedQuiz(prev => ({...prev, questions: updatedQuestions}));
  }

  const handleAddQuestion = () => {
    setEditedQuiz(prev => ({
        ...prev,
        questions: [...prev.questions, { question: '', options: ['', '', '', ''], answer: '' }]
    }));
  };

  const handleRemoveQuestion = (index: number) => {
    const updatedQuestions = [...editedQuiz.questions];
    updatedQuestions.splice(index, 1);
    setEditedQuiz(prev => ({...prev, questions: updatedQuestions}));
  }


  const handleSaveChanges = async () => {
    setLoading(true);
    try {
      await updateQuiz(quiz.id, editedQuiz);
      toast({
        title: 'Quiz Updated',
        description: `The quiz "${editedQuiz.title}" has been successfully updated.`,
      });
      onQuizUpdated();
      setIsOpen(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'An unexpected error occurred while saving the quiz.',
      });
    } finally {
      setLoading(false);
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon"><Edit /></Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">Edit Quiz</DialogTitle>
          <DialogDescription>
            Make changes to the quiz "{quiz.title}". Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 max-h-[60vh] overflow-y-auto p-4">
            <div className="space-y-2">
                <Label htmlFor="quiz-title-edit">Quiz Title</Label>
                <Input id="quiz-title-edit" value={editedQuiz.title} onChange={e => handleFieldChange('title', e.target.value)} required />
            </div>
            <div className="space-y-2">
                <Label htmlFor="quiz-topic-edit">Topic</Label>
                <Input id="quiz-topic-edit" value={editedQuiz.topic} onChange={e => handleFieldChange('topic', e.target.value)} required />
            </div>

            {editedQuiz.questions.map((q, qIndex) => (
                <div key={qIndex} className="space-y-4 p-4 border rounded-md relative">
                      {editedQuiz.questions.length > 1 && (
                        <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => handleRemoveQuestion(qIndex)}>
                            <X className="h-4 w-4" />
                        </Button>
                      )}
                    <h4 className="font-semibold">Question {qIndex + 1}</h4>
                    <div className="space-y-2">
                        <Label htmlFor={`q-text-edit-${qIndex}`}>Question Text</Label>
                        <Textarea id={`q-text-edit-${qIndex}`} value={q.question} onChange={e => handleQuestionChange(qIndex, 'question', e.target.value)} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {q.options.map((opt, oIndex) => (
                              <div key={oIndex} className="space-y-2">
                                <Label htmlFor={`q-edit-${qIndex}-opt-${oIndex}`}>Option {oIndex + 1}</Label>
                                <Input id={`q-edit-${qIndex}-opt-${oIndex}`} value={opt} onChange={e => handleOptionChange(qIndex, oIndex, e.target.value)} required />
                              </div>
                        ))}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor={`q-answer-edit-${qIndex}`}>Correct Answer</Label>
                        <Input id={`q-answer-edit-${qIndex}`} value={q.answer} onChange={e => handleQuestionChange(qIndex, 'answer', e.target.value)} placeholder="Enter exact text of correct option" required />
                    </div>
                </div>
            ))}
              <Button type="button" variant="outline" onClick={handleAddQuestion} className="w-full">
                <PlusCircle className="mr-2" /> Add Another Question
              </Button>
        </div>
        <DialogFooter>
            <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSaveChanges} disabled={loading}>
                {loading ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                </>
                ) : (
                <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                </>
                )}
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
