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
      
      const isAdminRoute = pathname.startsWith('/admin');
      const isTraineeRoute = pathname.startsWith('/trainee');
      const isLoginPage = pathname.endsWith('/login');

      if (user) {
        if (isLoginPage) {
            router.push(isAdminRoute ? '/admin/dashboard' : '/trainee/dashboard');
        }
      } else {
        if ((isAdminRoute || isTraineeRoute) && !isLoginPage) {
            router.push(isAdminRoute ? '/admin/login' : '/trainee/login');
        }
      }
    });

    return () => unsubscribe();
  }, [pathname, router]);

  const value = { user, loading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
