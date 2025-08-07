
'use client';

import { useEffect } from 'react';
import { Rocket, Loader2 } from 'lucide-react';
import { LoginForm } from '@/components/login-form';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      const isUserAdmin = user.email?.includes('admin');
      router.replace(isUserAdmin ? '/admin/dashboard' : '/trainee/dashboard');
    }
  }, [user, loading, router]);

  if (loading || (!loading && user)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="text-muted-foreground mt-4">Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      <div className="flex flex-col items-center justify-center p-8 bg-muted/30">
        <Card className="max-w-md w-full shadow-2xl rounded-2xl border-none">
            <div className="p-8 md:p-12 flex flex-col justify-center">
                <header className="text-center md:text-left mb-8">
                    <div className="inline-flex items-center justify-center w-full gap-4 mb-4">
                        <Rocket className="w-12 h-12 text-primary" />
                        <h1 className="text-4xl md:text-5xl font-headline font-bold text-foreground">
                            Maverick Mindset
                        </h1>
                    </div>
                    <p className="text-lg text-center text-muted-foreground">
                    Revolutionizing onboarding with personalized, AI-driven training.
                    </p>
                </header>
                
                <main className="w-full">
                    <LoginForm />
                </main>
            </div>
        </Card>
      </div>

       <div className="relative hidden md:block">
            <Image
                src="https://placehold.co/1080x1920.png"
                alt="Onboarding"
                layout="fill"
                objectFit="cover"
                data-ai-hint="professional office"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      </div>

      <footer className="absolute bottom-4 left-4 text-center text-muted-foreground/80 text-sm">
        <p>&copy; {new Date().getFullYear()} Maverick Mindset. All Rights Reserved.</p>
      </footer>
    </div>
  );
}
