
"use client";

import { useState } from "react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, LogIn, UserPlus } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { useRouter } from "next/navigation";
import { addTrainee } from "@/services/trainee-service";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "./ui/dialog";

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
                title: 'Email Required',
                description: 'Please enter your email address.',
            });
            return;
        }
        setLoading(true);
        try {
            await sendPasswordResetEmail(auth, email);
            toast({
                title: 'Password Reset Email Sent',
                description: 'If an account exists for this email, a reset link has been sent. Please check your inbox (and spam folder).',
            });
            setIsOpen(false);
        } catch (error: any) {
             let description = 'Failed to send password reset email. Please try again later.';
             if (error.code === 'auth/invalid-email') {
                description = 'The email address you entered is not valid.';
             } else if (error.code === 'auth/network-request-failed') {
                description = 'A network error occurred. Please check your connection.';
             }
             toast({
                variant: 'destructive',
                title: 'Error',
                description: description,
            });
        } finally {
            setLoading(false);
        }
    }

    return (
         <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button type="button" variant="link" size="sm" className="p-0 h-auto">
                    Forgot Password?
                </Button>
            </DialogTrigger>
            <DialogContent>
                <form onSubmit={handlePasswordReset}>
                    <DialogHeader>
                        <DialogTitle>Reset Your Password</DialogTitle>
                        <DialogDescription>
                            Enter your email address below, and we'll send you a link to reset your password.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="my-4">
                        <Label htmlFor="reset-email">Email Address</Label>
                        <Input 
                            id="reset-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                        />
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button type="submit" disabled={loading}>
                            {loading ? <Loader2 className="mr-2 animate-spin" /> : null}
                            Send Reset Link
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
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
      // Handle Sign Up
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
      // Handle Login
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const isUserAdmin = user.email?.includes('admin');

        toast({
          title: "Login Successful",
          description: `Welcome back, ${isUserAdmin ? 'Admin' : 'Trainee'}!`,
        });
        
        router.push(isUserAdmin ? "/admin/dashboard" : "/trainee/dashboard");

      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: error.message,
        });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="w-full">
        <CardHeader className="p-0 mb-6">
            <CardTitle className="text-2xl font-headline">{isSignUp ? "Create Account" : "Login"}</CardTitle>
            <CardDescription>
                 {isSignUp ? "Fill in your details to get started." : "Enter your credentials to access your dashboard."}
            </CardDescription>
        </CardHeader>
        <form onSubmit={handleAuthAction}>
            <CardContent className="grid gap-4 p-0">
                 {isSignUp && (
                    <div className="grid gap-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                            id="name"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                 )}
                <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                        id="password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4 p-0 mt-6">
                <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : isSignUp ? (
                       <UserPlus className="mr-2 h-4 w-4" />
                    ) : (
                        <LogIn className="mr-2 h-4 w-4" />
                    )}
                    {isSignUp ? "Sign Up" : "Login"}
                </Button>
                <div className="w-full flex justify-between items-center">
                     <Button type="button" variant="link" onClick={() => setIsSignUp(!isSignUp)} disabled={loading} className="p-0 h-auto">
                        {isSignUp ? "Already have an account? Login" : "Don't have an account? Sign Up"}
                    </Button>
                     {!isSignUp && <PasswordResetDialog />}
                </div>
            </CardFooter>
        </form>
    </div>
  );
}
