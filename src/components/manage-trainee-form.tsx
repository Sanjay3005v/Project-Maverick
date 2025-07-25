
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, UserPlus, Calendar as CalendarIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { Calendar } from "./ui/calendar";
import { addTrainee, updateTrainee, Trainee } from "@/services/trainee-service";

interface ManageTraineeFormProps {
  trainee: Trainee | null;
}

export function ManageTraineeForm({ trainee }: ManageTraineeFormProps) {
  const [name, setName] = useState(trainee?.name || "");
  const [department, setDepartment] = useState(trainee?.department || "Engineering");
  const [dob, setDob] = useState<Date | undefined>(trainee?.dob ? (typeof trainee.dob === 'string' ? parseISO(trainee.dob) : trainee.dob) : undefined);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const isEditing = trainee !== null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dob) {
        toast({
            variant: "destructive",
            title: "Missing Information",
            description: "Please select a date of birth.",
        });
        return;
    }
    setLoading(true);

    try {
        if(isEditing && trainee.id) {
            await updateTrainee(trainee.id, { 
                name, 
                department, 
                dob: format(dob, 'yyyy-MM-dd')
            });
        } else {
            await addTrainee({
                name,
                department,
                dob: format(dob, 'yyyy-MM-dd'),
                progress: 0,
                status: 'On Track',
            });
        }
        toast({
            title: isEditing ? "Trainee Updated" : "Trainee Added",
            description: `The details for ${name} have been successfully saved.`,
        });
        router.push('/admin/dashboard');
        router.refresh(); // To show the updated data on the dashboard
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "An unexpected error occurred while saving the trainee.",
        })
    } finally {
        setLoading(false);
    }
  };

  return (
    <Card className="w-full">
        <CardHeader>
            <CardTitle className="text-2xl font-headline">{isEditing ? "Edit Trainee" : "Add New Trainee"}</CardTitle>
            <CardDescription>
                {isEditing ? `You are editing personal details for ${trainee.name}. Progress and status are updated automatically based on trainee activity.` : "Enter the personal details for the new trainee."}
            </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
            <CardContent className="grid gap-6">
                <div className="grid gap-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                        id="name"
                        placeholder="e.g., Jane Doe"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="department">Department</Label>
                        <Select onValueChange={setDepartment} value={department}>
                            <SelectTrigger id="department">
                                <SelectValue placeholder="Select a department" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Engineering">Engineering</SelectItem>
                                <SelectItem value="Product">Product</SelectItem>
                                <SelectItem value="Design">Design</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                       <Label htmlFor="dob">Date of Birth</Label>
                       <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !dob && "text-muted-foreground"
                                )}
                                >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {dob ? format(dob, "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                mode="single"
                                selected={dob}
                                onSelect={setDob}
                                initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex justify-between">
                <Link href="/admin/dashboard">
                    <Button variant="outline">Cancel</Button>
                </Link>
                <Button type="submit" disabled={loading}>
                    {loading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : isEditing ? (
                        <Save className="mr-2 h-4 w-4" />
                    ) : (
                        <UserPlus className="mr-2 h-4 w-4" />
                    )}
                    {isEditing ? "Save Changes" : "Add Trainee"}
                </Button>
            </CardFooter>
        </form>
    </Card>
  );
}

    