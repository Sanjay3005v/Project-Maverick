
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { LoaderCircle, Edit, Trash2, Wand2, PlusCircle, X } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Challenge, getAllChallenges, addChallenge, updateChallenge, deleteChallenge } from '@/services/challenge-service';
import { generateChallenge } from '@/ai/flows/generate-challenge-flow';
import { Badge } from './ui/badge';


function EditChallengeDialog({ challenge, onChallengeUpdated, children }: { challenge?: Challenge, onChallengeUpdated: () => void, children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editedChallenge, setEditedChallenge] = useState<Partial<Challenge>>(
    challenge ? { ...challenge, tags: [...challenge.tags], testCases: [...challenge.testCases] } : { title: '', description: '', difficulty: 'Easy', tags: [], testCases: [] }
  );
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setEditedChallenge(
        challenge ? { ...challenge, tags: [...challenge.tags], testCases: [...challenge.testCases] } : { title: '', description: '', difficulty: 'Easy', tags: [], testCases: [] }
      );
    }
  }, [isOpen, challenge]);

  const handleFieldChange = (field: keyof Omit<Challenge, 'id' | 'tags' | 'testCases'>, value: string) => {
    setEditedChallenge(prev => ({ ...prev, [field]: value }));
  };

  const handleListChange = (field: 'tags' | 'testCases', value: string) => {
    setEditedChallenge(prev => ({ ...prev, [field]: value.split(',').map(s => s.trim()) }));
  };

  const handleSaveChanges = async () => {
    if (!editedChallenge.title || !editedChallenge.description) {
      toast({ variant: 'destructive', title: 'Missing Fields', description: 'Title and description are required.' });
      return;
    }
    setLoading(true);
    try {
      if (challenge?.id) {
        await updateChallenge(challenge.id, editedChallenge);
        toast({ title: 'Challenge Updated', description: `The challenge "${editedChallenge.title}" has been updated.` });
      } else {
        await addChallenge(editedChallenge as Omit<Challenge, 'id'>);
        toast({ title: 'Challenge Created', description: `The challenge "${editedChallenge.title}" has been created.` });
      }
      onChallengeUpdated();
      setIsOpen(false);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not save the challenge.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{challenge ? 'Edit' : 'Create'} Challenge</DialogTitle>
          <DialogDescription>
            {challenge ? 'Make changes to the challenge.' : 'Fill out the details for the new challenge.'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto p-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={editedChallenge.title} onChange={e => handleFieldChange('title', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={editedChallenge.description} onChange={e => handleFieldChange('description', e.target.value)} rows={4} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="difficulty">Difficulty</Label>
            <Select value={editedChallenge.difficulty} onValueChange={value => handleFieldChange('difficulty', value)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Easy">Easy</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input id="tags" value={editedChallenge.tags?.join(', ')} onChange={e => handleListChange('tags', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="testCases">Test Cases (comma-separated)</Label>
            <Textarea id="testCases" value={editedChallenge.testCases?.join(', ')} onChange={e => handleListChange('testCases', e.target.value)} rows={3} />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
          <Button onClick={handleSaveChanges} disabled={loading}>
            {loading && <LoaderCircle className="animate-spin mr-2" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ChallengeManagement() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [aiDifficulty, setAiDifficulty] = useState('Medium');
  const { toast } = useToast();

  const fetchChallenges = async () => {
    setLoading(true);
    const allChallenges = await getAllChallenges();
    setChallenges(allChallenges);
    setLoading(false);
  };

  useEffect(() => {
    fetchChallenges();
  }, []);

  const handleGenerateWithAI = async () => {
    if (!aiTopic.trim()) {
      toast({ variant: 'destructive', title: 'Topic is required.' });
      return;
    }
    setAiLoading(true);
    try {
      const result = await generateChallenge({ topic: aiTopic, difficulty: aiDifficulty });
      await addChallenge(result);
      fetchChallenges();
      toast({ title: 'Challenge Generated!', description: `AI has created a new challenge on "${result.title}".` });
      setAiTopic('');
    } catch (error) {
      toast({ variant: 'destructive', title: 'Generation Failed', description: 'The AI could not generate the challenge.' });
    } finally {
      setAiLoading(false);
    }
  };

  const handleDeleteChallenge = async (challengeId: string, challengeTitle: string) => {
    try {
      await deleteChallenge(challengeId);
      fetchChallenges();
      toast({ title: "Challenge Deleted", description: `The challenge "${challengeTitle}" has been deleted.` });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to delete challenge." });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoaderCircle className="h-8 w-8 animate-spin" />
        <p className="ml-4">Loading Challenges...</p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-8 items-start">
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Existing Challenges</CardTitle>
            <CardDescription>Manage all available coding challenges.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 max-h-[60vh] overflow-y-auto">
            {challenges.map(challenge => (
              <div key={challenge.id} className="p-4 border rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex-grow">
                  <h4 className="font-bold">{challenge.title}</h4>
                  <p className="text-sm text-muted-foreground">{challenge.description.substring(0, 100)}...</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="secondary">{challenge.difficulty}</Badge>
                    {challenge.tags.map(tag => <Badge key={tag} variant="outline">{tag}</Badge>)}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0 flex-wrap">
                  <EditChallengeDialog challenge={challenge} onChallengeUpdated={fetchChallenges}>
                    <Button variant="outline" size="icon"><Edit /></Button>
                  </EditChallengeDialog>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="icon"><Trash2 /></Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action will permanently delete the challenge "{challenge.title}".
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteChallenge(challenge.id, challenge.title)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
            {challenges.length === 0 && (
              <p className="text-center text-muted-foreground p-8">No challenges found.</p>
            )}
          </CardContent>
           <CardFooter>
                <EditChallengeDialog onChallengeUpdated={fetchChallenges}>
                    <Button variant="outline" className="w-full">
                        <PlusCircle className="mr-2"/>
                        Create New Challenge Manually
                    </Button>
                </EditChallengeDialog>
           </CardFooter>
        </Card>
      </div>

      <Card className="sticky top-24">
        <CardHeader>
          <CardTitle>Generate with AI</CardTitle>
          <CardDescription>Create a new coding challenge using AI by providing a topic and difficulty.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ai-topic">Challenge Topic</Label>
            <Input id="ai-topic" placeholder="e.g., 'Array manipulation in JavaScript', 'SQL subqueries'..." value={aiTopic} onChange={e => setAiTopic(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ai-difficulty">Difficulty</Label>
            <Select value={aiDifficulty} onValueChange={setAiDifficulty}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Easy">Easy</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleGenerateWithAI} disabled={aiLoading} className="w-full">
            {aiLoading ? <LoaderCircle className="animate-spin mr-2" /> : <Wand2 className="mr-2" />}
            Generate Challenge
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
