
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { LoaderCircle, Edit, Trash2, Wand2, PlusCircle, X, Send, Search } from 'lucide-react';
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
import { Badge } from './ui/badge';
import { Trainee, getAllTrainees, assignChallengeToTrainees } from '@/services/trainee-service';
import { Checkbox } from './ui/checkbox';


function AssignChallengeDialog({ challenge, trainees, children }: { challenge: Challenge; trainees: Trainee[]; children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedTrainees, setSelectedTrainees] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState('all');

    const filteredTrainees = useMemo(() => {
        return trainees
            .filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()))
            .filter(t => departmentFilter === 'all' || t.department === departmentFilter);
    }, [trainees, searchTerm, departmentFilter]);

    useEffect(() => {
        if(isOpen) {
            const preselected = trainees
                .filter(t => t.assignedChallengeIds?.includes(challenge.id))
                .map(t => t.id);
            setSelectedTrainees(preselected);
            setSearchTerm('');
            setDepartmentFilter('all');
        }
    }, [isOpen, challenge.id, trainees]);
    
    const handleSelectTrainee = (traineeId: string) => {
        setSelectedTrainees(prev =>
            prev.includes(traineeId)
                ? prev.filter(id => id !== traineeId)
                : [...prev, traineeId]
        );
    };

    const handleSelectAll = (checked: boolean | 'indeterminate') => {
        if (checked) {
            const allFilteredIds = filteredTrainees.map(t => t.id);
            setSelectedTrainees(prev => [...new Set([...prev, ...allFilteredIds])]);
        } else {
            const allFilteredIdsSet = new Set(filteredTrainees.map(t => t.id));
            setSelectedTrainees(prev => prev.filter(id => !allFilteredIdsSet.has(id)));
        }
    }
    
    const isAllFilteredSelected = filteredTrainees.length > 0 && filteredTrainees.every(t => selectedTrainees.includes(t.id));

    const handleAssign = async () => {
        setLoading(true);
        try {
            await assignChallengeToTrainees(challenge.id, selectedTrainees);
            toast({
                title: "Challenge Assigned!",
                description: `"${challenge.title}" has been assigned to ${selectedTrainees.length} trainee(s).`
            });
            setIsOpen(false);
        } catch (error) {
             toast({ variant: 'destructive', title: 'Assignment Failed' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Assign Challenge: {challenge.title}</DialogTitle>
                    <DialogDescription>Select the trainees who should be assigned this challenge.</DialogDescription>
                </DialogHeader>
                <div className="flex flex-col sm:flex-row gap-4 my-4">
                    <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search by name..." 
                            className="pl-10"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                        <SelectTrigger className="w-full sm:w-[200px]">
                            <SelectValue placeholder="Filter Department" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Departments</SelectItem>
                            <SelectItem value="Engineering">Engineering</SelectItem>
                            <SelectItem value="Product">Product</SelectItem>
                            <SelectItem value="Design">Design</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto my-4 border-t border-b py-2">
                     <div className="flex items-center space-x-3 p-2 rounded-md bg-muted/50">
                        <Checkbox
                            id="select-all"
                            checked={isAllFilteredSelected}
                            onCheckedChange={handleSelectAll}
                        />
                        <Label htmlFor="select-all" className="flex-1 cursor-pointer font-semibold">
                            Select All ({filteredTrainees.length})
                        </Label>
                    </div>
                    {filteredTrainees.map(trainee => (
                        <div key={trainee.id} className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50">
                            <Checkbox
                                id={`trainee-${trainee.id}`}
                                checked={selectedTrainees.includes(trainee.id)}
                                onCheckedChange={() => handleSelectTrainee(trainee.id)}
                            />
                            <Label htmlFor={`trainee-${trainee.id}`} className="flex-1 cursor-pointer">
                                <p className="font-medium">{trainee.name}</p>
                                <p className="text-xs text-muted-foreground">{trainee.department}</p>
                            </Label>
                        </div>
                    ))}
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                    <Button onClick={handleAssign} disabled={loading || selectedTrainees.length === 0}>
                        {loading ? <LoaderCircle className="animate-spin mr-2"/> : <Send className="mr-2"/>}
                        Assign to {selectedTrainees.length} Trainee(s)
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}


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
  const [trainees, setTrainees] = useState<Trainee[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [aiDifficulty, setAiDifficulty] = useState('Medium');
  const { toast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    const [allChallenges, allTrainees] = await Promise.all([
      getAllChallenges(),
      getAllTrainees()
    ]);
    setChallenges(allChallenges);
    setTrainees(allTrainees);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
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
      fetchData();
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
      fetchData();
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
            <CardDescription>Manage and assign all available coding challenges.</CardDescription>
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
                  <EditChallengeDialog challenge={challenge} onChallengeUpdated={fetchData}>
                    <Button variant="outline" size="icon"><Edit /></Button>
                  </EditChallengeDialog>
                  <AssignChallengeDialog challenge={challenge} trainees={trainees}>
                     <Button variant="outline"><Send className="mr-2"/> Assign</Button>
                  </AssignChallengeDialog>
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
                <EditChallengeDialog onChallengeUpdated={fetchData}>
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
