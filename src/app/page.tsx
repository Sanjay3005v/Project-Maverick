
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!loading) {
      if (user) {
        // The AuthProvider will handle redirection, this is a fallback.
        const isUserAdmin = user.email?.includes('admin');
        router.replace(isUserAdmin ? '/admin/dashboard' : '/trainee/dashboard');
      } else {
        router.replace('/login');
      }
    }
  }, [user, loading, router]);

  if (!isClient) {
    return null;
  }

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin" />
      <p className="ml-4">Loading...</p>
    </div>
  );
}
