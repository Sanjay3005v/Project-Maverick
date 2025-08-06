
'use client';

import { useEffect, useState } from 'react';
import { Rocket } from 'lucide-react';
import { LoginForm } from '@/components/login-form';

export const dynamic = 'force-dynamic';

export default function LoginPage() {
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

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
