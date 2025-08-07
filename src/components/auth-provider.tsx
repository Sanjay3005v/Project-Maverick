
'use client';

import { createContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { usePathname, useRouter } from 'next/navigation';

export interface AuthContextType {
  user: User | null;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (loading) {
      return; 
    }
    
    if (pathname === '/login') {
      return;
    }

    const isHomePage = pathname === '/';
    const isAdminRoute = pathname.startsWith('/admin');
    const isTraineeRoute = pathname.startsWith('/trainee');

    if (user) {
      const isUserAdmin = user.email?.includes('admin');
      
      if (isAdminRoute && !isUserAdmin) {
        router.replace('/trainee/dashboard');
        return;
      }
      
      if (isTraineeRoute && isUserAdmin) {
        router.replace('/admin/dashboard');
        return;
      }

      if (isHomePage) {
        router.replace(isUserAdmin ? '/admin/dashboard' : '/trainee/dashboard');
        return;
      }
    } else {
      if (isAdminRoute || isTraineeRoute) {
        router.replace('/login');
        return;
      }
    }
  }, [user, loading, pathname, router]);

  const value = { user, loading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
