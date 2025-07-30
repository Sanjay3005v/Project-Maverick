
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, UserPlus, Calendar as CalendarIcon, Mail, Pencil } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { Calendar } from "./ui/calendar";
import { addTrainee, updateTrainee, Trainee } from "@/services/trainee-service";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { EditOnboardingPlanDialog } from "./edit-onboarding-plan-dialog";
import { Heatmap } from "./heatmap";

interface ManageTraineeFormProps {
  trainee: Trainee | null;
  onTraineeUpdate: () => void;
}

export function ManageTraineeForm({ trainee, onTraineeUpdate }: ManageTraineeFormProps) {
  const [name, setName] = useState(trainee?.name || "");
  const [email, setEmail] = useState(trainee?.email || "");
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
                email,
                department, 
                dob: format(dob, 'yyyy-MM-dd'),
            });
        } else {
            await addTrainee({
                name,
                email,
                department,
                dob: format(dob, 'yyyy-MM-dd'),
                progress: 0, // Progress starts at 0 for new trainees
                status: '', // Status will be set by the service
            });
        }
        toast({
            title: isEditing ? "Trainee Updated" : "Trainee Added",
            description: `The details for ${name} have been successfully saved.`,
        });
        router.push('/admin/trainee-management');
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
    <div className="space-y-8">
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="text-2xl font-headline">{isEditing ? "Edit Trainee" : "Add New Trainee"}</CardTitle>
                <CardDescription>
                    {isEditing ? `You are editing personal details for ${trainee.name}. The progress and status are updated automatically based on performance.` : "Enter the personal details for the new trainee."}
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
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email Address</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="email"
                                type="email"
                                placeholder="trainee@example.com"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="pl-10"
                            />
                        </div>
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
                                        captionLayout="dropdown-buttons"
                                        fromYear={new Date().getFullYear() - 100}
                                        toYear={new Date().getFullYear()}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                    <Link href="/admin/trainee-management">
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

        {isEditing && trainee.onboardingPlan && trainee.onboardingPlan.length > 0 && (
             <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Assigned Onboarding Plan</CardTitle>
                            <CardDescription>This is the personalized plan assigned to {trainee.name}.</CardDescription>
                        </div>
                        <EditOnboardingPlanDialog trainee={trainee} onPlanUpdated={onTraineeUpdate}>
                            <Button variant="outline">
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit Plan
                            </Button>
                        </EditOnboardingPlanDialog>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Week</TableHead>
                                    <TableHead>Topic</TableHead>
                                    <TableHead>Tasks</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {trainee.onboardingPlan.map((item, index) => (
                                    <TableRow key={index}>
                                        <TableCell className="font-medium">{item.week}</TableCell>
                                        <TableCell>{item.topic}</TableCell>
                                        <TableCell>
                                            <ul className="list-disc pl-4 space-y-1 text-sm">
                                                {item.tasks.map((task, i) => <li key={i}>{task}</li>)}
                                            </ul>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        )}

        {isEditing && (
            <Card>
                <CardHeader>
                    <CardTitle>Daily Quiz Activity</CardTitle>
                    <CardDescription>A heatmap of {trainee.name}'s daily quiz scores over the past year.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Heatmap quizCompletions={trainee.quizCompletions || []} />
                </CardContent>
            </Card>
        )}
    </div>
  );
}
