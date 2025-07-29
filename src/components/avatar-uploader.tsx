
'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { storage } from '@/lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { updateUserAvatar } from '@/services/trainee-service';
import { Loader2, Upload } from 'lucide-react';
import type { Trainee } from '@/services/trainee-service';

interface AvatarUploaderProps {
    trainee: Trainee;
    onUploadComplete: () => void;
}

export function AvatarUploader({ trainee, onUploadComplete }: AvatarUploaderProps) {
    const [isUploading, setIsUploading] = useState(false);
    const { toast } = useToast();

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            const validTypes = ['image/jpeg', 'image/png', 'image/gif'];

            if (!validTypes.includes(file.type)) {
                toast({ variant: 'destructive', title: 'Invalid File Type', description: 'Please select a JPG, PNG, or GIF image.' });
                return;
            }
            if (file.size > 2 * 1024 * 1024) { // 2MB limit
                toast({ variant: 'destructive', title: 'File Too Large', description: 'Please select an image smaller than 2MB.' });
                return;
            }

            setIsUploading(true);

            const storageRef = ref(storage, `avatars/${trainee.id}/${file.name}`);
            const uploadTask = uploadBytesResumable(storageRef, file);

            uploadTask.on('state_changed',
                null, // We can add progress updates here if needed
                (error) => {
                    setIsUploading(false);
                    toast({ variant: 'destructive', title: 'Upload Failed', description: 'An error occurred during upload.' });
                },
                () => {
                    getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
                        try {
                            await updateUserAvatar(trainee.id, downloadURL);
                            toast({ title: 'Avatar Updated!', description: 'Your new avatar has been saved.' });
                            onUploadComplete();
                        } catch (error) {
                            toast({ variant: 'destructive', title: 'Update Failed', description: 'Could not save your new avatar.' });
                        } finally {
                            setIsUploading(false);
                        }
                    });
                }
            );
        }
    };

    return (
        <>
            <input
                type="file"
                id="avatar-upload"
                className="hidden"
                onChange={handleFileChange}
                accept="image/png, image/jpeg, image/gif"
                disabled={isUploading}
            />
            <Button
                variant="ghost"
                size="icon"
                onClick={() => document.getElementById('avatar-upload')?.click()}
                disabled={isUploading}
                className="h-12 w-12 rounded-full text-white bg-transparent hover:bg-black/20"
            >
                {isUploading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                    <Upload className="h-6 w-6" />
                )}
            </Button>
        </>
    );
}
