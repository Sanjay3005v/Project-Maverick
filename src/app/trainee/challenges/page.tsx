import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { challenges } from "@/lib/challenges-data";
import { Code2 } from "lucide-react";
import Link from "next/link";

export default function CodingChallengesPage() {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="mb-8">
        <h1 className="text-4xl font-headline font-bold">Coding Challenges</h1>
        <p className="text-muted-foreground">Sharpen your skills with these hands-on challenges.</p>
      </header>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {challenges.map((challenge, index) => (
          <Card key={index} className="flex flex-col">
            <CardHeader>
              <div className="flex justify-between items-start">
                  <CardTitle>{challenge.title}</CardTitle>
                  <span className="text-xs font-semibold px-2 py-1 rounded-full bg-secondary text-secondary-foreground">{challenge.difficulty}</span>
              </div>
              <CardDescription>{challenge.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
                <div className="flex flex-wrap gap-2">
                    {challenge.tags.map(tag => <span key={tag} className="text-xs px-2 py-0.5 rounded-md bg-primary/10 text-primary">{tag}</span>)}
                </div>
            </CardContent>
            <CardFooter>
              <Link href={`/trainee/challenges/${challenge.id}`} className="w-full">
                <Button className="w-full">
                  <Code2 className="mr-2 h-4 w-4" /> Start Challenge
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
      <div className="text-center mt-12">
          <Link href="/trainee/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
      </div>
    </div>
  );
}
