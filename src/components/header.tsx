import Link from "next/link";
import { Rocket, LayoutDashboard } from "lucide-react";
import { Button } from "./ui/button";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/80 backdrop-blur-sm">
      <div className="container flex h-16 items-center">
        <Link href="/" className="flex items-center gap-2 mr-auto">
          <Rocket className="h-6 w-6 text-primary" />
          <span className="font-headline text-xl font-bold">Maverick Mindset</span>
        </Link>
        <nav className="flex items-center gap-4">
          <Link href="/trainee/dashboard" passHref>
            <Button variant="ghost" className="hidden sm:inline-flex">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Trainee
            </Button>
          </Link>
          <Link href="/admin/dashboard" passHref>
            <Button variant="ghost" className="hidden sm:inline-flex">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Admin
            </Button>
          </Link>
          <Button>Get Started</Button>
        </nav>
      </div>
    </header>
  );
}
