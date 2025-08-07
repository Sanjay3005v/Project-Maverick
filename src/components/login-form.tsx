
"use client";

import { useState } from "react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { addTrainee } from "@/services/trainee-service";
import { cn } from "@/lib/utils";

export function LoginForm() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleAuthAction = async (e: React.FormEvent, isSignUpAction: boolean) => {
    e.preventDefault();
    setLoading(true);

    if (isSignUpAction) {
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
          description: `Welcome back!`,
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
    <div className={cn(
        "bg-white rounded-xl shadow-2xl relative overflow-hidden w-full max-w-4xl min-h-[520px]",
        "transition-all duration-700 ease-in-out",
        isSignUp && "right-panel-active"
    )}>
        {/* Sign Up Form */}
        <div className={cn(
            "absolute top-0 h-full transition-all duration-700 ease-in-out left-0 w-1/2 opacity-0 z-10",
            isSignUp && "transform translate-x-full opacity-100 z-20"
        )}>
            <form onSubmit={(e) => handleAuthAction(e, true)} className="bg-white h-full flex flex-col justify-center items-center px-12">
                <h1 className="text-3xl font-bold mb-4">Create Account</h1>
                <span>or use your email for registration</span>
                <Input 
                    type="text" 
                    placeholder="Name" 
                    value={name} 
                    onChange={e => setName(e.target.value)}
                    required
                    className="bg-gray-100 border-none my-2" 
                />
                <Input 
                    type="email" 
                    placeholder="Email" 
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="bg-gray-100 border-none my-2" 
                />
                <Input 
                    type="password" 
                    placeholder="Password" 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    className="bg-gray-100 border-none my-2" 
                />
                <Button type="submit" className="rounded-full mt-4 px-12" disabled={loading}>
                    {loading && <Loader2 className="animate-spin mr-2" />}
                    Sign Up
                </Button>
            </form>
        </div>

        {/* Sign In Form */}
        <div className={cn(
            "absolute top-0 h-full transition-all duration-700 ease-in-out left-0 w-1/2 z-20",
            isSignUp && "transform -translate-x-full opacity-0"
        )}>
            <form onSubmit={(e) => handleAuthAction(e, false)} className="bg-white h-full flex flex-col justify-center items-center px-12">
                <h1 className="text-3xl font-bold mb-4">Sign in</h1>
                <span>or use your account</span>
                 <Input 
                    type="email" 
                    placeholder="Email" 
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="bg-gray-100 border-none my-2" 
                />
                <Input 
                    type="password" 
                    placeholder="Password" 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    className="bg-gray-100 border-none my-2" 
                />
                 <Button type="submit" className="rounded-full mt-4 px-12" disabled={loading}>
                    {loading && <Loader2 className="animate-spin mr-2" />}
                    Sign In
                </Button>
            </form>
        </div>
        
        {/* Overlay */}
        <div className={cn(
            "absolute top-0 left-1/2 w-1/2 h-full overflow-hidden transition-transform duration-700 ease-in-out z-50",
            isSignUp && "-translate-x-full"
        )}>
            <div className={cn(
                "bg-primary relative -left-full h-full w-[200%] transition-transform duration-700 ease-in-out",
                 isSignUp && "translate-x-1/2"
            )}>
                 {/* Overlay Left */}
                <div className={cn(
                    "absolute top-0 h-full w-1/2 flex flex-col items-center justify-center text-center px-10 text-white transition-transform duration-700 ease-in-out",
                    "transform -translate-x-1/5",
                    isSignUp && "transform translate-x-0"
                )}>
                    <h1 className="text-3xl font-bold">Welcome Back!</h1>
                    <p className="text-sm my-4">To keep connected with us please login with your personal info</p>
                    <Button variant="outline" className="rounded-full px-12 bg-transparent border-white text-white" onClick={() => setIsSignUp(false)}>Sign In</Button>
                </div>

                {/* Overlay Right */}
                <div className={cn(
                    "absolute top-0 right-0 h-full w-1/2 flex flex-col items-center justify-center text-center px-10 text-white transition-transform duration-700 ease-in-out",
                    isSignUp && "transform translate-x-1/5"
                )}>
                    <h1 className="text-3xl font-bold">Hello, Friend!</h1>
                    <p className="text-sm my-4">Enter your personal details and start your journey with us</p>
                     <Button variant="outline" className="rounded-full px-12 bg-transparent border-white text-white" onClick={() => setIsSignUp(true)}>Sign Up</Button>
                </div>
            </div>
        </div>
    </div>
  );
}
