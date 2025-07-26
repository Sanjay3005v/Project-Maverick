
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Send } from 'lucide-react';

export function BroadcastForm() {
  const [target, setTarget] = useState('all');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate sending a notification
    await new Promise(resolve => setTimeout(resolve, 1500));

    setLoading(false);
    toast({
      title: 'Notification Sent!',
      description: `Your message "${subject}" has been broadcast to ${target === 'all' ? 'all trainees' : `the ${target} department`}.`,
    });
    setSubject('');
    setMessage('');
  };

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Send a New Announcement</CardTitle>
          <CardDescription>
            Compose your message below. It will be sent as an in-app notification to the selected audience.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="target">Target Audience</Label>
            <Select value={target} onValueChange={setTarget}>
              <SelectTrigger id="target">
                <SelectValue placeholder="Select an audience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Trainees</SelectItem>
                <SelectItem value="Engineering">Engineering Department</SelectItem>
                <SelectItem value="Product">Product Department</SelectItem>
                <SelectItem value="Design">Design Department</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              placeholder="e.g., Upcoming Deadline for React Certification"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Write your full announcement here..."
              rows={6}
              value={message}
              onChange={e => setMessage(e.target.value)}
              required
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Broadcast Notification
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
