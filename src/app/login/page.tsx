
'use client';

import { useEffect, useState } from 'react';
import { Rocket, Loader2 } from 'lucide-react';
import { LoginForm } from '@/components/login-form';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <Card className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 shadow-2xl">
            <div className="p-8 md:p-12 flex flex-col justify-center">
                <header className="text-center md:text-left mb-8">
                    <div className="inline-flex items-center gap-4 mb-4">
                        <Rocket className="w-12 h-12 text-primary" />
                        <h1 className="text-4xl md:text-5xl font-headline font-bold text-foreground">
                            Maverick Mindset
                        </h1>
                    </div>
                    <p className="text-lg text-muted-foreground">
                    Revolutionizing onboarding with personalized, AI-driven training.
                    </p>
                </header>
                
                <main className="w-full">
                    <LoginForm />
                </main>
            </div>
             <div className="hidden md:block relative">
                <Image 
                    src="https://placehold.co/600x800.png"
                    alt="Onboarding illustration"
                    fill
                    style={{ objectFit: 'cover' }}
                    className="rounded-r-lg"
                    data-ai-hint="corporate training"
                />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-r-lg" />
            </div>
        </Card>

      <footer className="mt-8 text-center text-muted-foreground text-sm">
        <p>&copy; {new Date().getFullYear()} Maverick Mindset. All Rights Reserved.</p>
      </footer>
    </div>
  );
}
