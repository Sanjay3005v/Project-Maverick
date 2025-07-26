
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
      
      const isLoginPage = pathname === '/login';
      const isHomePage = pathname === '/';
      const isAdminRoute = pathname.startsWith('/admin');
      const isTraineeRoute = pathname.startsWith('/trainee');
      
      if (user) {
        const isUserAdmin = user.email?.includes('admin');
        
        // Redirect on login
        if (isLoginPage || isHomePage) {
          router.push(isUserAdmin ? '/admin/dashboard' : '/trainee/dashboard');
        }

        // Enforce route access
        if (isAdminRoute && !isUserAdmin) {
          router.push('/trainee/dashboard');
        } else if (isTraineeRoute && isUserAdmin) {
          router.push('/admin/dashboard');
        }
        
      } else {
        // If not logged in, and trying to access a protected route, redirect to the login page.
        if (isAdminRoute || isTraineeRoute) {
            router.push('/login');
        }
      }
    });

    return () => unsubscribe();
  }, [pathname, router]);

  const value = { user, loading };

  // Render children only when loading is false to avoid flashes of unauthenticated content
  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
}
