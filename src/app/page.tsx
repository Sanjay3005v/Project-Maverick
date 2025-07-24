import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Rocket, Users, User, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <header className="text-center mb-12">
        <div className="inline-flex items-center gap-4 mb-4">
          <Rocket className="w-16 h-16 text-primary" />
          <h1 className="text-5xl md:text-6xl font-headline font-bold text-foreground">
            Maverick Mindset
          </h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Revolutionizing the onboarding experience with personalized, AI-driven training plans for the next generation of talent.
        </p>
      </header>
      
      <main className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        <Card className="hover:shadow-xl hover:scale-105 transition-all duration-300">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div>
                <CardTitle className="font-headline text-2xl">For Trainees</CardTitle>
                <CardDescription>Your personal journey starts here.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="mb-6 text-muted-foreground">
              Access your personalized onboarding plan, track your progress through quizzes, coding challenges, and more.
            </p>
            <Link href="/trainee/dashboard" passHref>
              <Button className="w-full" variant="outline">
                Go to Trainee Dashboard <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-xl hover:scale-105 transition-all duration-300">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <div>
                <CardTitle className="font-headline text-2xl">For Admins</CardTitle>
                <CardDescription>Oversee and manage your talent pool.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="mb-6 text-muted-foreground">
              Monitor trainee progress, generate reports, and create AI-powered onboarding plans for your new hires.
            </p>
            <Link href="/admin/dashboard" passHref>
              <Button className="w-full">
                Go to Admin Console <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </main>

      <footer className="mt-12 text-center text-muted-foreground text-sm">
        <p>&copy; {new Date().getFullYear()} Maverick Mindset. All Rights Reserved.</p>
      </footer>
    </div>
  );
}
