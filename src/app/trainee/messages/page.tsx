
'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Message,
  getMessages,
  sendMessage,
  markAsReadByTrainee,
} from '@/services/messaging-service';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Send, Bot, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Trainee, getTraineeByEmail } from '@/services/trainee-service';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

function ChatBubble({ message, traineeName }: { message: Message, traineeName: string }) {
  const isAdmin = message.senderId === 'admin';
  const bubbleAlignment = isAdmin ? 'justify-start' : 'justify-end';
  const bubbleColor = isAdmin
    ? 'bg-muted'
    : 'bg-primary text-primary-foreground';
  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('');

  const messageDate = message.createdAt ? new Date(message.createdAt) : null;

  return (
    <div className={`flex items-start gap-3 ${bubbleAlignment}`}>
      {isAdmin && (
        <Avatar className="border">
          <AvatarFallback>A</AvatarFallback>
        </Avatar>
      )}
      <div className="flex flex-col">
        <div className={`rounded-lg p-3 max-w-xs md:max-w-md ${bubbleColor}`}>
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>
         <p className={`text-xs text-muted-foreground mt-1 ${isAdmin ? 'text-left' : 'text-right'}`}>
          {messageDate ? format(messageDate, 'p') : ''}
        </p>
      </div>
      {!isAdmin && (
        <Avatar className="border">
            <AvatarFallback>{getInitials(traineeName)}</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}

export default function TraineeMessagePage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [trainee, setTrainee] = useState<Trainee | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchTraineeAndMessages = async (email: string) => {
    const traineeData = await getTraineeByEmail(email);
    setTrainee(traineeData);
    if (traineeData) {
      const msgs = await getMessages(traineeData.id);
      setMessages(msgs);
      markAsReadByTrainee(traineeData.id);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user?.email && !authLoading) {
      fetchTraineeAndMessages(user.email);
    }
  }, [user, authLoading]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !trainee) return;
    setSending(true);

    try {
      await sendMessage(trainee.id, trainee.name, trainee.id, newMessage);
      setNewMessage('');
      fetchTraineeAndMessages(trainee.email); // Refetch messages
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to send message.',
      });
    } finally {
      setSending(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  if (!trainee) {
     return (
       <div className="container mx-auto p-4 md:p-8 text-center">
         <p>Could not load your profile. Please contact an administrator.</p>
         <Link href="/trainee/dashboard" className="mt-4 inline-block">
            <Button variant="outline">Back to Dashboard</Button>
         </Link>
       </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8 h-full flex flex-col">
       <header className="mb-4">
        <h1 className="text-3xl font-bold">Messages</h1>
        <p className="text-muted-foreground">Your conversation with the site administrator.</p>
      </header>
      <div className="flex-1 overflow-y-auto p-4 space-y-6 border rounded-lg bg-background">
        {messages.length === 0 && (
            <div className="text-center text-muted-foreground py-12">
                No messages yet. Send a message to start the conversation!
            </div>
        )}
        {messages.map((message) => (
          <ChatBubble key={message.id} message={message} traineeName={trainee.name} />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className="mt-4 flex gap-4">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message to the admin..."
          disabled={sending}
        />
        <Button type="submit" disabled={sending}>
          {sending ? (
            <Loader2 className="animate-spin" />
          ) : (
            <Send />
          )}
        </Button>
      </form>
    </div>
  );
}
