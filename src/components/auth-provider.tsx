
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
      return; // Wait until user status is resolved
    }
    
    // Do not interfere with the login page's own logic, especially the redirect flow.
    if (pathname === '/login') {
      return;
    }

    const isHomePage = pathname === '/';
    const isAdminRoute = pathname.startsWith('/admin');
    const isTraineeRoute = pathname.startsWith('/trainee');

    if (user) {
      const isUserAdmin = user.email?.includes('admin');
      
      // If user is on a page that doesn't match their role, redirect them.
      if (isAdminRoute && !isUserAdmin) {
        router.replace('/trainee/dashboard');
        return;
      }
      
      if (isTraineeRoute && isUserAdmin) {
        router.replace('/admin/dashboard');
        return;
      }

      // If user is on the home page, redirect them to their dashboard.
      if (isHomePage) {
        router.replace(isUserAdmin ? '/admin/dashboard' : '/trainee/dashboard');
        return;
      }
    } else {
      // If no user is logged in, redirect any protected route access to the login page.
      if (isAdminRoute || isTraineeRoute) {
        router.replace('/login');
        return;
      }
    }
  }, [user, loading, pathname, router]);

  const value = { user, loading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
