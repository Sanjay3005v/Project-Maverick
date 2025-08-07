
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from './ui/sheet';
import { MessageSquare, Send, LoaderCircle, X, Bot, User } from 'lucide-react';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { chat } from '@/ai/flows/chatbot-flow';
import type { ChatMessage } from '@/lib/chatbot-schema';
import { useAuth } from '@/hooks/use-auth';
import { usePathname } from 'next/navigation';
import { getTraineeByEmail, Trainee } from '@/services/trainee-service';

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const pathname = usePathname();
  const [trainee, setTrainee] = useState<Trainee | null>(null);

  useEffect(() => {
    if (user?.email) {
      getTraineeByEmail(user.email).then(setTrainee);
    }
  }, [user]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
        const response = await chat([...messages, userMessage], input, pathname);
        const botMessage: ChatMessage = { role: 'model', content: response };
        setMessages(prev => [...prev, botMessage]);
    } catch (error) {
        const errorMessage: ChatMessage = { role: 'model', content: "Sorry, I'm having trouble connecting. Please try again later." };
        setMessages(prev => [...prev, errorMessage]);
    } finally {
        setLoading(false);
    }
  };
  
  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('') || 'U';
  }


  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-lg"
        size="icon"
      >
        <MessageSquare className="h-8 w-8" />
      </Button>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="flex flex-col">
          <SheetHeader>
            <SheetTitle>Maverick AI Assistant</SheetTitle>
          </SheetHeader>
          <ScrollArea className="flex-1 my-4 pr-4" ref={scrollAreaRef}>
            <div className="space-y-6">
                <div className="flex items-start gap-4">
                     <Avatar className="border">
                        <AvatarFallback><Bot /></AvatarFallback>
                    </Avatar>
                     <div className="rounded-lg p-3 bg-muted">
                        <p className="text-sm">Hello! How can I help you navigate the Maverick Mindset application today?</p>
                    </div>
                </div>
              {messages.map((message, index) => (
                <div key={index} className={`flex items-start gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {message.role === 'model' && (
                    <Avatar className="border">
                        <AvatarFallback><Bot /></AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`rounded-lg p-3 max-w-[80%] ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                   {message.role === 'user' && user && (
                     <Avatar className="border">
                        <AvatarImage src={trainee?.avatarUrl} />
                        <AvatarFallback>{getInitials(trainee?.name || user?.displayName || '')}</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {loading && (
                 <div className="flex items-start gap-4">
                     <Avatar className="border">
                        <AvatarFallback><Bot /></AvatarFallback>
                    </Avatar>
                     <div className="rounded-lg p-3 bg-muted">
                        <LoaderCircle className="h-5 w-5 animate-spin" />
                    </div>
                </div>
              )}
            </div>
          </ScrollArea>
          <SheetFooter>
            <form onSubmit={handleSubmit} className="flex w-full items-center space-x-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about features or navigation..."
                disabled={loading}
              />
              <Button type="submit" size="icon" disabled={loading}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
