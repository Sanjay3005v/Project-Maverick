
"use client";

import { useState } from "react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, LogIn, UserPlus } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { useRouter } from "next/navigation";
import { addTrainee } from "@/services/trainee-service";

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
    <Card className="w-full max-w-sm">
        <CardHeader>
            <CardTitle className="text-2xl font-headline">{isSignUp ? "Create Account" : "Login"}</CardTitle>
            <CardDescription>
                 {isSignUp ? "Fill in your details to get started." : "Please enter your credentials to access your dashboard."}
            </CardDescription>
        </CardHeader>
        <form onSubmit={handleAuthAction}>
            <CardContent className="grid gap-4">
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
            <CardFooter className="flex flex-col gap-4">
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
                <Button type="button" variant="link" onClick={() => setIsSignUp(!isSignUp)} disabled={loading}>
                    {isSignUp ? "Already have an account? Login" : "Don't have an account? Sign Up"}
                </Button>
            </CardFooter>
        </form>
    </Card>
  );
}
