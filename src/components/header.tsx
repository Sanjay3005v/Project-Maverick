
"use client";

import Link from "next/link";
import { Rocket, LayoutDashboard, LogOut, LogIn } from "lucide-react";
import { Button } from "./ui/button";
import { useAuth } from "@/hooks/use-auth";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";

export function Header() {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      });
      router.push('/');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error Signing Out",
        description: "There was a problem signing out. Please try again.",
      });
    }
  };

  const isUserAdmin = user?.email?.includes('admin');

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/80 backdrop-blur-sm">
      <div className="container flex h-16 items-center">
        <Link href="/" className="flex items-center gap-2">
          <Rocket className="h-6 w-6 text-primary" />
          <span className="font-headline text-xl font-bold">Maverick Mindset</span>
        </Link>
        <nav className="ml-auto flex items-center gap-4">
           <ThemeToggle />
          {!loading && user && (
            <>
              {isUserAdmin ? (
                  <Link href="/admin/dashboard" passHref>
                    <Button variant="ghost">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Admin
                    </Button>
                  </Link>
              ) : (
                  <Link href="/trainee/dashboard" passHref>
                    <Button variant="ghost">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Trainee
                    </Button>
                  </Link>
              )}
              <Button onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </>
          )}
           {!loading && !user && (
            <Link href="/" passHref>
              <Button>
                <LogIn className="mr-2 h-4 w-4" />
                Get Started
              </Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
