
'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { LoginForm } from '@/components/login-form';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';

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
    <main 
        className="flex flex-col items-center justify-center min-h-screen p-4"
        style={{
            backgroundImage: "url('https://placehold.co/1920x1080/a0d2eb/4a5759.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
        }}
        data-ai-hint="abstract background"
    >
      <LoginForm />
    </main>
  );
}
