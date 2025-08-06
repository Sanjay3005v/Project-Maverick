
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useAuth } from '@/hooks/use-auth';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Settings, LogOut, Trash2, LoaderCircle } from 'lucide-react';
import { getTraineeByEmail, deleteTraineeAccount, Trainee } from '@/services/trainee-service';
import { AvatarUploader } from './avatar-uploader';
import { Input } from './ui/input';
import { Label } from './ui/label';

function DeleteAccountDialog({ trainee, onDeleted, isGoogleSignIn }: { trainee: Trainee; onDeleted: () => void; isGoogleSignIn: boolean; }) {
    const [loading, setLoading] = useState(false);
    const [password, setPassword] = useState('');
    const { toast } = useToast();

    const handleDelete = async () => {
        if (!isGoogleSignIn && !password) {
            toast({
                variant: 'destructive',
                title: 'Password Required',
                description: 'Please enter your password to confirm account deletion.',
            });
            return;
        }

        setLoading(true);
        try {
            await deleteTraineeAccount(trainee.id, trainee.email, isGoogleSignIn ? undefined : password);
            toast({
                title: 'Account Deleted',
                description: 'Your account has been permanently deleted.',
            });
            onDeleted();
        } catch (error: any) {
            let description = 'An unexpected error occurred.';
            if (error.code === 'auth/wrong-password') {
                description = 'The password you entered is incorrect. Please try again.';
            } else if (error.code === 'auth/requires-recent-login') {
                description = 'This operation is sensitive and requires recent authentication. Please sign out and sign back in to delete your account.'
            }
             else if (error.code === 'auth/reauthenticate-timeout') {
                description = 'Re-authentication timed out. Please try again.';
            }
            toast({
                variant: 'destructive',
                title: 'Deletion Failed',
                description: description,
            });
        } finally {
            setLoading(false);
            setPassword('');
        }
    };

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <DropdownMenuItem
                    onSelect={(e) => e.preventDefault()}
                    className="text-red-500 focus:text-red-500 focus:bg-red-500/10"
                >
                    <Trash2 className="mr-2" /> Delete Account
                </DropdownMenuItem>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action is permanent and cannot be undone. 
                        {isGoogleSignIn 
                            ? " This is a sensitive operation and may require you to sign in again to confirm."
                            : " To confirm, please enter your password."
                        }
                    </AlertDialogDescription>
                </AlertDialogHeader>
                {!isGoogleSignIn && (
                    <div className="space-y-2">
                        <Label htmlFor="password-confirm" className="sr-only">Password</Label>
                        <Input 
                            id="password-confirm"
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                )}
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} disabled={loading} className="bg-destructive hover:bg-destructive/90">
                        {loading ? <LoaderCircle className="animate-spin mr-2"/> : null}
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}


export function UserSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [trainee, setTrainee] = useState<Trainee | null>(null);

  const fetchTrainee = async () => {
    if (user?.email) {
      const traineeData = await getTraineeByEmail(user.email);
      setTrainee(traineeData);
    }
  };

  useEffect(() => {
    fetchTrainee();
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast({
        title: 'Signed Out',
        description: 'You have been successfully signed out.',
      });
      router.push('/login');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error Signing Out',
        description: 'There was a problem signing out. Please try again.',
      });
    }
  };

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('') || '';
  };

  const isUserAdmin = user?.email?.includes('admin');
  const isGoogleSignIn = user?.providerData.some(provider => provider.providerId === 'google.com');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex items-center gap-3">
            <div className="relative group">
                <Avatar>
                    <AvatarImage src={trainee?.avatarUrl} />
                    <AvatarFallback>{getInitials(trainee?.name || user?.displayName || 'U')}</AvatarFallback>
                </Avatar>
                {trainee && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                        <AvatarUploader trainee={trainee} onUploadComplete={fetchTrainee} />
                    </div>
                )}
            </div>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{trainee?.name || user?.displayName}</p>
              <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2" />
          <span>Sign Out</span>
        </DropdownMenuItem>
        {!isUserAdmin && trainee && (
            <>
                <DropdownMenuSeparator />
                <DeleteAccountDialog trainee={trainee} onDeleted={handleSignOut} isGoogleSignIn={!!isGoogleSignIn} />
            </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
