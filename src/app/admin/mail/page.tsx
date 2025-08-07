
'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Loader2, Mail, Dot, Edit, Send } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Conversation, getConversations, sendMessage } from '@/services/messaging-service';
import { Trainee, getAllTrainees } from '@/services/trainee-service';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';


function NewMessageDialog({ trainees }: { trainees: Trainee[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTrainees, setSelectedTrainees] = useState<string[]>([]);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');

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
          const fullMessage = subject ? `Subject: ${subject}\n\n${message}` : message;
          await sendMessage(trainee.id, trainee.name, 'admin', fullMessage);
        }
      }

      toast({
        title: 'Mail Sent!',
        description: `Your mail has been sent to ${selectedTrainees.length} trainee(s).`,
      });
      setSubject('');
      setMessage('');
      setSelectedTrainees([]);
      setIsOpen(false);

    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to send mail.'
      });
    } finally {
      setLoading(false);
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button><Edit className="mr-2" /> New Mail</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Compose New Mail</DialogTitle>
            <DialogDescription>
              Compose and send mail to one or more trainees.
            </DialogDescription>
          </DialogHeader>

          <div className="grid md:grid-cols-2 gap-6 my-4">
            <div className="space-y-4">
              <Label>Recipients</Label>
              <Input
                placeholder="Search trainees..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              <ScrollArea className="h-60 w-full rounded-md border">
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
                  {filteredTrainees.map(trainee => (
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
            </div>

            <div className="space-y-4">
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
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={loading || selectedTrainees.length === 0}>
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
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export const dynamic = 'force-dynamic';

export default function AdminMailPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [trainees, setTrainees] = useState<Trainee[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [convos, allTrainees] = await Promise.all([
        getConversations(),
        getAllTrainees()
      ]);
      setConversations(convos);
      setTrainees(allTrainees);
      setLoading(false);
    };

    fetchData();
  }, []);

  const handleRowClick = (traineeId: string) => {
    router.push(`/admin/mail/${traineeId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-4">Loading Mail...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="mb-8">
        <h1 className="text-4xl font-headline font-bold">Mail</h1>
        <p className="text-muted-foreground">
          View mail threads and send new mail to trainees.
        </p>
      </header>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>
                <Mail className="mr-2 h-6 w-6" />
                Inbox
              </CardTitle>
              <CardDescription>
                This list shows all mail threads with trainees.
              </CardDescription>
            </div>
            <NewMessageDialog trainees={trainees} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Trainee Name</TableHead>
                  <TableHead>Last Message</TableHead>
                  <TableHead>Received</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {conversations.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center h-24">
                      No mail threads yet.
                    </TableCell>
                  </TableRow>
                )}
                {conversations.map((convo) => (
                  <TableRow
                    key={convo.id}
                    onClick={() => handleRowClick(convo.traineeId)}
                    className="cursor-pointer"
                  >
                    <TableCell className="font-medium flex items-center">
                      {!convo.isReadByAdmin && <Dot className="h-8 w-8 text-primary" />}
                      {convo.traineeName}
                    </TableCell>
                    <TableCell className="text-muted-foreground truncate max-w-sm">
                      {convo.lastMessage}
                    </TableCell>
                    <TableCell>
                      {formatDistanceToNow(new Date(convo.lastMessageAt), {
                        addSuffix: true,
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      {!convo.isReadByAdmin && <Badge>New Mail</Badge>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
