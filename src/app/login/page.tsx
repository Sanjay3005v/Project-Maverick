
'use client';

import { useEffect } from 'react';
import { Loader2, Rocket } from 'lucide-react';
import { LoginForm } from '@/components/login-form';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { getAllTrainees } from '@/services/trainee-service';

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
  
  useEffect(() => {
    // Firebase Connection Test
    const testConnection = async () => {
        try {
            console.log("Attempting to connect to Firebase...");
            const trainees = await getAllTrainees();
            console.log(`✅ Firebase connection successful! Fetched ${trainees.length} trainee records.`);
        } catch (error: any) {
            console.error("🔥 Firebase connection failed:", error.message);
            if (error.message.includes("API key not valid")) {
                 console.error("Hint: This is likely due to an incorrect or missing NEXT_PUBLIC_FIREBASE_API_KEY in your .env file.");
            }
        }
    }
    testConnection();
  }, []);

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
        className="flex flex-col items-center justify-center min-h-screen p-4 bg-background"
        style={{
             background: `
                radial-gradient(circle at 10% 20%, hsl(var(--secondary)) 0%, hsl(var(--background)) 90.1%)
             `
        }}
    >
      <div className='text-center mb-8'>
         <div className="flex items-center justify-center gap-3 mb-2">
            <Rocket className="h-10 w-10 text-primary" />
            <h1 className="text-5xl font-headline font-bold">Maverick Mindset</h1>
        </div>
        <p className="text-muted-foreground">Personalized Onboarding for the Next Generation of Talent</p>
      </div>
      <LoginForm />
    </main>
  );
}
