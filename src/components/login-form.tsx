"use client";

import { useState } from "react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, UserPlus, LogIn, Mail, Rocket } from "lucide-react";
import { useRouter } from "next/navigation";
import { addTrainee } from "@/services/trainee-service";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Label } from "./ui/label";


function PasswordResetDialog() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        variant: 'destructive',
        title: 'Email required',
        description: 'Please enter your email address.',
      });
      return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      toast({
        title: 'Password Reset Email Sent',
        description: 'If an account exists for this email, you will receive a reset link. Check your spam folder.',
      });
      setIsOpen(false);
    } catch (error: any) {
      let description = 'An unexpected error occurred. Please try again.';
      if (error.code === 'auth/invalid-email') {
        description = 'The email address you entered is not valid.';
      }
      toast({
        variant: 'destructive',
        title: 'Error',
        description,
      });
    } finally {
      setLoading(false);
    }
  };
  
   return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="link" className="px-0">Forgot your password?</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handlePasswordReset}>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Enter your email address and we will send you a link to reset your password.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="reset-email" className="sr-only">Email</Label>
            <Input 
              id="reset-email" 
              type="email" 
              placeholder="you@example.com" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required
            />
          </div>
          <DialogFooter>
             <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="animate-spin mr-2" />}
              Send Reset Link
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


export function LoginForm() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isSignUp) {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        await addTrainee({
            name: name,
            email: user.email!,
            department: 'Design',
            progress: 0,
            status: 'On Track',
            dob: new Date().toISOString().split('T')[0],
        });

        toast({
          title: "Account Created!",
          description: `Welcome, ${name}! Your trainee profile has been created.`,
        });
        
        router.push("/trainee/dashboard");

      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Sign Up Failed",
          description: error.message,
        });
      } finally {
        setLoading(false);
      }
    } else {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const isUserAdmin = user.email?.includes('admin');

        toast({
          title: "Login Successful",
          description: `Welcome back!`,
        });
        
        router.push(isUserAdmin ? "/admin/dashboard" : "/trainee/dashboard");

      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: "Invalid email or password. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className={cn(
        "bg-card rounded-2xl shadow-2xl relative overflow-hidden w-full max-w-3xl min-h-[520px]",
        isSignUp ? "right-panel-active" : ""
    )}
     id="container" 
    >
        {/* Sign Up Form */}
        <div className="absolute top-0 h-full transition-all duration-700 ease-in-out left-0 w-1/2 opacity-0 z-10 sign-up-container">
            <form onSubmit={handleAuthAction} className="bg-card h-full flex flex-col justify-center items-center px-12">
                <h1 className="text-3xl font-bold font-headline mb-4">Create Account</h1>
                <span className="text-muted-foreground mb-4 text-sm">or use your email for registration</span>
                <Input 
                    type="text" 
                    placeholder="Name" 
                    value={name} 
                    onChange={e => setName(e.target.value)}
                    required
                    className="my-2" 
                />
                <Input 
                    type="email" 
                    placeholder="Email" 
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="my-2"
                />
                <Input 
                    type="password" 
                    placeholder="Password" 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    className="my-2"
                />
                <Button type="submit" className="rounded-full mt-4 px-12" disabled={loading}>
                    {loading ? <Loader2 className="animate-spin" /> : <UserPlus />}
                    Sign Up
                </Button>
            </form>
        </div>

        {/* Sign In Form */}
        <div className="absolute top-0 h-full transition-all duration-700 ease-in-out left-0 w-1/2 z-20 sign-in-container">
            <form onSubmit={handleAuthAction} className="bg-card h-full flex flex-col justify-center items-center px-12">
                <h1 className="text-3xl font-bold font-headline mb-4">Sign In</h1>
                 <span className="text-muted-foreground mb-4 text-sm">Use your account to sign in</span>
                 <Input 
                    type="email" 
                    placeholder="Email" 
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="my-2"
                />
                <Input 
                    type="password" 
                    placeholder="Password" 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    className="my-2"
                />
                <PasswordResetDialog />
                 <Button type="submit" className="rounded-full mt-4 px-12" disabled={loading}>
                    {loading ? <Loader2 className="animate-spin" /> : <LogIn />}
                    Sign In
                </Button>
            </form>
        </div>
        
        {/* Overlay */}
        <div className="absolute top-0 left-1/2 w-1/2 h-full overflow-hidden transition-transform duration-700 ease-in-out z-50 overlay-container">
            <div className="bg-primary relative -left-full h-full w-[200%] transition-transform duration-700 ease-in-out overlay">
                <div className="absolute top-0 h-full w-1/2 flex flex-col items-center justify-center text-center px-10 text-primary-foreground transition-transform duration-700 ease-in-out overlay-panel overlay-left">
                    <h1 className="text-3xl font-bold font-headline">Your Journey Continues!</h1>
                    <p className="text-sm my-4">Log in to keep developing your skills and pushing boundaries.</p>
                    <Button variant="outline" className="rounded-full px-12 bg-transparent border-primary-foreground hover:bg-primary-foreground/10" id="signIn" onClick={() => setIsSignUp(false)}>Sign In</Button>
                </div>

                <div className="absolute top-0 right-0 h-full w-1/2 flex flex-col items-center justify-center text-center px-10 text-primary-foreground transition-transform duration-700 ease-in-out overlay-panel overlay-right">
                    <h1 className="text-3xl font-bold font-headline">Forge Your Path!</h1>
                    <p className="text-sm my-4">Unleash your potential. Sign up to begin your personalized onboarding experience.</p>
                     <Button variant="outline" className="rounded-full px-12 bg-transparent border-primary-foreground hover:bg-primary-foreground/10" id="signUp" onClick={() => setIsSignUp(true)}>Sign Up</Button>
                </div>
            </div>
        </div>
        <style jsx>{`
            .sign-up-container {
                opacity: 0;
                z-index: 1;
            }
            .sign-in-container {
                z-index: 2;
            }
            .right-panel-active .sign-in-container {
                transform: translateX(100%);
            }
            .right-panel-active .sign-up-container {
                transform: translateX(100%);
                opacity: 1;
                z-index: 5;
                animation: show 0.6s;
            }
            @keyframes show {
                0%, 49.99% {
                    opacity: 0;
                    z-index: 1;
                }
                50%, 100% {
                    opacity: 1;
                    z-index: 5;
                }
            }
            .overlay-container {
                position: absolute;
                top: 0;
                left: 50%;
                width: 50%;
                height: 100%;
                overflow: hidden;
                transition: transform 0.6s ease-in-out;
                z-index: 100;
            }
            .right-panel-active .overlay-container{
                transform: translateX(-100%);
            }
            .overlay {
                position: relative;
                left: -100%;
                height: 100%;
                width: 200%;
                transform: translateX(0);
                transition: transform 0.6s ease-in-out;
            }
            .right-panel-active .overlay {
                transform: translateX(50%);
            }
            .overlay-panel {
                position: absolute;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-direction: column;
                padding: 0 40px;
                text-align: center;
                top: 0;
                height: 100%;
                width: 50%;
                transform: translateX(0);
                transition: transform 0.6s ease-in-out;
            }
            .overlay-left {
                transform: translateX(-20%);
            }
            .right-panel-active .overlay-left {
                transform: translateX(0);
            }
            .overlay-right {
                right: 0;
                transform: translateX(0);
            }
            .right-panel-active .overlay-right {
                transform: translateX(20%);
            }
        `}</style>
    </div>
  );
}
