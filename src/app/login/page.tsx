
'use client';

import { useEffect, useState } from 'react';
import { Rocket, Loader2 } from 'lucide-react';
import { LoginForm } from '@/components/login-form';
import { useToast } from '@/hooks/use-toast';
import { getRedirectResult, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { addTrainee, getTraineeByEmail } from '@/services/trainee-service';

export const dynamic = 'force-dynamic';

export default function LoginPage() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    setYear(new Date().getFullYear());

    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          const user = result.user;
          toast({
            title: 'Login Successful',
            description: `Welcome back, ${user.displayName || 'User'}!`,
          });
          
          let trainee = await getTraineeByEmail(user.email!);
          if (!trainee && !user.email?.includes('admin')) {
              await addTrainee({
                  name: user.displayName || 'New Trainee',
                  email: user.email!,
                  department: 'Design', 
                  progress: 0,
                  status: 'On Track',
                  dob: new Date().toISOString().split('T')[0],
              });
          }

          const isUserAdmin = user.email?.includes('admin');
          router.push(isUserAdmin ? '/admin/dashboard' : '/trainee/dashboard');
        } else {
            setLoading(false);
        }
      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Login Failed',
          description: 'Could not sign in with Google. Please try again.',
        });
        setLoading(false);
      }
    };

    handleRedirectResult();
  }, [router, toast]);


  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="text-muted-foreground mt-4">Completing login...</p>
      </div>
    )
  }

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
      
      <main className="w-full max-w-sm">
        <LoginForm />
      </main>

      <footer className="mt-12 text-center text-muted-foreground text-sm">
        <p>&copy; {year} Maverick Mindset. All Rights Reserved.</p>
      </footer>
    </div>
  );
}
