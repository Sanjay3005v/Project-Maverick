
'use client';

import { useEffect, useState } from 'react';
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
import { Loader2, MessageSquare, Dot } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Conversation, getConversations } from '@/services/messaging-service';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';

export const dynamic = 'force-dynamic';

export default function AdminMessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchConversations = async () => {
      setLoading(true);
      const convos = await getConversations();
      setConversations(convos);
      setLoading(false);
    };

    fetchConversations();
  }, []);

  const handleRowClick = (traineeId: string) => {
    router.push(`/admin/messages/${traineeId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-4">Loading Conversations...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="mb-8">
        <h1 className="text-4xl font-headline font-bold">Messages</h1>
        <p className="text-muted-foreground">
          View and respond to messages from trainees.
        </p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>
            <MessageSquare className="mr-2 h-6 w-6" />
            Conversation Inbox
          </CardTitle>
          <CardDescription>
            This list shows all conversations with trainees.
          </CardDescription>
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
                      No conversations yet.
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
                       {!convo.isReadByAdmin && <Badge>New Message</Badge>}
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
