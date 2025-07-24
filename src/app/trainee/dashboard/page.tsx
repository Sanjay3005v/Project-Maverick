import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, BookOpenCheck, Code2, FileText, Award } from "lucide-react";

const progressItems = [
  { text: "Update Profile", completed: true },
  { text: "Daily Quiz", completed: true },
  { text: "Coding Challenge #1", completed: true },
  { text: "Submit Assignment", completed: false },
  { text: "Complete Certification", completed: false },
];

const overallProgress = (progressItems.filter(item => item.completed).length / progressItems.length) * 100;

export default function TraineeDashboard() {
  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8">
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center gap-4 space-y-0">
            <Avatar className="h-16 w-16">
              <AvatarImage src="https://placehold.co/128x128.png" data-ai-hint="person portrait" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="font-headline text-2xl">Welcome, Jane Doe!</CardTitle>
              <CardDescription>Trainee, Engineering Department</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Your personalized journey at Maverick Mindset starts now. Stay on top of your tasks and make the most of your onboarding.
            </p>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-headline">Your Onboarding Progress</CardTitle>
            <CardDescription>Complete all items to finish your onboarding.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <Progress value={overallProgress} className="h-3" />
              <span className="font-bold text-lg text-primary">{Math.round(overallProgress)}%</span>
            </div>
            <ul className="space-y-3">
              {progressItems.map((item, index) => (
                <li key={index} className="flex items-center gap-3 text-sm">
                  {item.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground" />
                  )}
                  <span className={item.completed ? "line-through text-muted-foreground" : ""}>
                    {item.text}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:border-primary transition-colors">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-headline">Daily Quiz</CardTitle>
              <BookOpenCheck className="h-6 w-6 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">Completed</p>
            <p className="text-sm text-muted-foreground">Score: 95%</p>
          </CardContent>
        </Card>
        <Card className="hover:border-primary transition-colors">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-headline">Coding Challenges</CardTitle>
              <Code2 className="h-6 w-6 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">3 / 5</p>
            <p className="text-sm text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
        <Card className="hover:border-primary transition-colors">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-headline">Assignments</CardTitle>
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">2 Submitted</p>
            <p className="text-sm text-muted-foreground">1 Pending Feedback</p>
          </CardContent>
        </Card>
        <Card className="hover:border-primary transition-colors">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-headline">Certifications</CardTitle>
              <Award className="h-6 w-6 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">1 / 2</p>
            <p className="text-sm text-muted-foreground">In Progress</p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
