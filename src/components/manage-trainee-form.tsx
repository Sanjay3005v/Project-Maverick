
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, UserPlus, Calendar as CalendarIcon, Mail, Pencil, Trash2, CheckCircle, LinkIcon as LinkIconLucid, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { Calendar } from "./ui/calendar";
import { addTrainee, updateTrainee, deleteTrainee, Trainee } from "@/services/trainee-service";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { EditOnboardingPlanDialog } from "./edit-onboarding-plan-dialog";
import { Heatmap } from "./heatmap";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog";
import { Badge } from "./ui/badge";


interface ManageTraineeFormProps {
  trainee: Trainee | null;
  onTraineeUpdate: () => void;
}

export function ManageTraineeForm({ trainee, onTraineeUpdate }: ManageTraineeFormProps) {
  const [name, setName] = useState(trainee?.name || "");
  const [email, setEmail] = useState(trainee?.email || "");
  const [department, setDepartment] = useState(trainee?.department || "Engineering");
  const [dob, setDob] = useState<Date | undefined>(trainee?.dob ? (typeof trainee.dob === 'string' ? parseISO(trainee.dob) : trainee.dob) : undefined);
  const [batch, setBatch] = useState(trainee?.batch || "");
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
                batch,
                dob: format(dob, 'yyyy-MM-dd'),
            });
        } else {
            await addTrainee({
                name,
                email,
                department,
                batch,
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

  const handleDelete = async () => {
    if (!trainee) return;
    setLoading(true);
    try {
      await deleteTrainee(trainee.id);
      toast({
        title: "Trainee Deleted",
        description: `The trainee "${trainee.name}" has been removed.`,
      });
      router.push('/admin/trainee-management');
      router.refresh();
    } catch(error) {
       toast({
        variant: "destructive",
        title: "Deletion Failed",
        description: "An error occurred while deleting the trainee.",
      });
      setLoading(false);
    }
  }

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
                    <div className="grid md:grid-cols-2 gap-6">
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
                            <Label htmlFor="batch">Batch</Label>
                            <Input
                                id="batch"
                                placeholder="e.g., A1, B2, etc."
                                value={batch}
                                onChange={(e) => setBatch(e.target.value)}
                            />
                        </div>
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
                    <div className="flex gap-2">
                        <Link href="/admin/trainee-management">
                            <Button variant="outline" type="button">Cancel</Button>
                        </Link>
                         {isEditing && (
                             <AlertDialog>
                                <AlertDialogTrigger asChild>
                                     <Button variant="destructive" type="button">
                                        <Trash2 className="mr-2 h-4 w-4" /> Delete Trainee
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action is permanent and cannot be undone. This will delete the trainee's record and may impact their ability to log in.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleDelete} disabled={loading} className="bg-destructive hover:bg-destructive/90">
                                            {loading ? <Loader2 className="animate-spin mr-2"/> : null}
                                            Confirm Deletion
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )}
                    </div>
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
                                    <TableHead>Week/Topic</TableHead>
                                    <TableHead>Task</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {trainee.onboardingPlan.map((item, weekIndex) => (
                                    <React.Fragment key={weekIndex}>
                                        <TableRow className="bg-muted/50">
                                            <TableCell colSpan={3} className="font-bold">{item.week}: {item.topic}</TableCell>
                                        </TableRow>
                                        {item.tasks.map((task, taskIndex) => (
                                            <TableRow key={`${weekIndex}-${taskIndex}`}>
                                                <TableCell></TableCell>
                                                <TableCell>
                                                    <p>{task.description}</p>
                                                    {task.type === 'link' && task.submittedLink && (
                                                        <a href={task.submittedLink} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1 mt-1">
                                                            <LinkIconLucid className="h-3 w-3" />
                                                            View Submission
                                                        </a>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                     {task.status === 'Completed' ? (
                                                        <Badge variant="default" className="gap-1.5 bg-green-500 text-white hover:bg-green-600">
                                                        <CheckCircle className="h-3.5 w-3.5" />
                                                        Completed
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="secondary" className="gap-1.5">
                                                        <Clock className="h-3.5 w-3.5" />
                                                        Pending
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </React.Fragment>
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
