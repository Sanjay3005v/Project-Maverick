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
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      
      const isAdminLogin = pathname === '/admin/login';
      const isTraineeLogin = pathname === '/trainee/login';
      const isAdminRoute = pathname.startsWith('/admin');
      const isTraineeRoute = pathname.startsWith('/trainee');

      if (user) {
        // If the user is logged in and on a login page, redirect them to the correct dashboard.
        if (isAdminLogin) {
            router.push('/admin/dashboard');
        } else if (isTraineeLogin) {
            router.push('/trainee/dashboard');
        }
      } else {
        // If the user is not logged in and trying to access a protected route, redirect to the appropriate login page.
        if ((isAdminRoute && !isAdminLogin) || (isTraineeRoute && !isTraineeLogin)) {
          router.push(isAdminRoute ? '/admin/login' : '/trainee/login');
        }
      }
    });

    return () => unsubscribe();
  }, [pathname, router]);

  const value = { user, loading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
