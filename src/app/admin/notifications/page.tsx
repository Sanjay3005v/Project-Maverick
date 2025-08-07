
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Send } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Trainee, getAllTrainees } from '@/services/trainee-service';
import { sendMessage } from '@/services/messaging-service';
import { useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function NotificationsPage() {
  const [trainees, setTrainees] = useState<Trainee[]>([]);
  const [loadingTrainees, setLoadingTrainees] = useState(true);
  const [selectedTrainees, setSelectedTrainees] = useState<string[]>([]);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchTrainees() {
      setLoadingTrainees(true);
      const allTrainees = await getAllTrainees();
      setTrainees(allTrainees);
      setLoadingTrainees(false);
    }
    fetchTrainees();
  }, []);
  
  const filteredTrainees = useMemo(() => {
    return trainees.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [trainees, searchTerm]);

  const handleSelectTrainee = (traineeId: string) => {
    setSelectedTrainees((prev) =>
      prev.includes(traineeId)
        ? prev.filter((id) => id !== traineeId)
        : [...prev, traineeId]
    );
  };
  
  const handleSelectAll = (checked: boolean | 'indeterminate') => {
        if (checked) {
            setSelectedTrainees(filteredTrainees.map(t => t.id));
        } else {
            setSelectedTrainees([]);
        }
    }
    
  const isAllFilteredSelected = filteredTrainees.length > 0 && selectedTrainees.length === filteredTrainees.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTrainees.length === 0 || !message.trim()) {
        toast({
            variant: 'destructive',
            title: 'Missing Information',
            description: 'Please select at least one trainee and write a message.'
        });
        return;
    }
    setLoading(true);

    try {
      for (const traineeId of selectedTrainees) {
          const trainee = trainees.find(t => t.id === traineeId);
          if (trainee) {
              const fullMessage = subject ? `${subject}\n\n${message}` : message;
              await sendMessage(trainee.id, trainee.name, 'admin', fullMessage);
          }
      }

      toast({
        title: 'Messages Sent!',
        description: `Your message has been sent to ${selectedTrainees.length} trainee(s).`,
      });
      setSubject('');
      setMessage('');
      setSelectedTrainees([]);

    } catch(error) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Failed to send messages.'
        });
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8">
      <header>
        <h1 className="text-4xl font-headline font-bold">Admin Notifications</h1>
        <p className="text-muted-foreground">
          Send messages to specific trainees.
        </p>
      </header>
      <section className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit}>
          <div className="grid md:grid-cols-2 gap-8">
             <Card>
                <CardHeader>
                    <CardTitle>Select Recipients</CardTitle>
                    <CardDescription>Choose which trainees will receive the message.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Input 
                        placeholder="Search trainees..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                    <ScrollArea className="h-72 w-full rounded-md border">
                        <div className="p-4 space-y-2">
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
                            {loadingTrainees ? <Loader2 className="animate-spin"/> : filteredTrainees.map(trainee => (
                                <div key={trainee.id} className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50">
                                    <Checkbox
                                        id={trainee.id}
                                        checked={selectedTrainees.includes(trainee.id)}
                                        onCheckedChange={() => handleSelectTrainee(trainee.id)}
                                    />
                                    <Label htmlFor={trainee.id} className="flex-1 cursor-pointer">{trainee.name}</Label>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </CardContent>
             </Card>

             <Card>
                <CardHeader>
                  <CardTitle>Compose Message</CardTitle>
                  <CardDescription>
                    This will be sent as a direct message to the selected trainees.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject (Optional)</Label>
                    <Input
                      id="subject"
                      placeholder="e.g., Upcoming Deadline"
                      value={subject}
                      onChange={e => setSubject(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Write your full message here..."
                      rows={9}
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={loading || selectedTrainees.length === 0} className="w-full">
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send to {selectedTrainees.length} Trainee(s)
                      </>
                    )}
                  </Button>
                </CardFooter>
             </Card>
          </div>
        </form>
      </section>
    </div>
  );
}
