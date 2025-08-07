
'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import {
  Message,
  getMessages,
  sendMessage,
  markAsReadByAdmin,
  getConversationForTrainee,
  Conversation,
} from '@/services/messaging-service';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Send, ArrowLeft, Bot, User } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

function ChatBubble({ message }: { message: Message }) {
  const isAdmin = message.senderId === 'admin';
  const bubbleAlignment = isAdmin ? 'justify-end' : 'justify-start';
  const bubbleColor = isAdmin
    ? 'bg-primary text-primary-foreground'
    : 'bg-muted';
  const avatarText = isAdmin ? 'A' : 'T';

  const getMessageDate = (timestamp: any) => {
    if (timestamp && typeof timestamp.toDate === 'function') {
      return timestamp.toDate();
    }
    return new Date(timestamp);
  }

  return (
    <div className={`flex items-start gap-3 ${bubbleAlignment}`}>
      {!isAdmin && (
        <Avatar className="border">
          <AvatarFallback>{avatarText}</AvatarFallback>
        </Avatar>
      )}
      <div className="flex flex-col">
        <div className={`rounded-lg p-3 max-w-xs md:max-w-md ${bubbleColor}`}>
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>
        <p className={`text-xs text-muted-foreground mt-1 ${isAdmin ? 'text-right' : 'text-left'}`}>
          {format(getMessageDate(message.createdAt), 'p')}
        </p>
      </div>
      {isAdmin && (
        <Avatar className="border">
          <AvatarFallback>{avatarText}</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}

export default function AdminMessagePage() {
  const params = useParams();
  const traineeId = params.id as string;
  const { user } = useAuth();
  const { toast } = useToast();

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    if (!traineeId) return;
    const [conv, msgs] = await Promise.all([
      getConversationForTrainee(traineeId),
      getMessages(traineeId),
    ]);
    setConversation(conv);
    setMessages(msgs);
    markAsReadByAdmin(traineeId);
    setLoading(false);
  };

  useEffect(() => {
    fetchMessages();
  }, [traineeId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !conversation) return;
    setSending(true);

    try {
      await sendMessage(
        traineeId,
        conversation.traineeName,
        'admin',
        newMessage
      );
      setNewMessage('');
      fetchMessages(); // Refetch messages to show the new one
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8 h-full flex flex-col">
       <header className="mb-4">
         <Link href="/admin/messages" className="flex items-center text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to All Messages
        </Link>
        <h1 className="text-3xl font-bold">Conversation with {conversation?.traineeName}</h1>
      </header>
      <div className="flex-1 overflow-y-auto p-4 space-y-6 border rounded-lg bg-background">
        {messages.map((message) => (
          <ChatBubble key={message.id} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className="mt-4 flex gap-4">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
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
