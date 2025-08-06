
"use client";

import Link from "next/link";
import { Rocket, LayoutDashboard, LoaderCircle, LogIn } from "lucide-react";
import { Button } from "./ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";
import { UserSettings } from "./user-settings";

export function Header() {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

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
          {loading ? (
             <LoaderCircle className="h-5 w-5 animate-spin" />
          ) : user ? (
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
              <UserSettings />
            </>
          ) : (
            <Link href="/login" passHref>
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
