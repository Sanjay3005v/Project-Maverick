import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Code2 } from "lucide-react";
import Link from "next/link";

const challenges = [
  {
    id: "python-list-comprehension",
    title: "Python List Comprehension",
    description: "Write a Python function to transform a list of numbers into a list of their squares using list comprehension.",
    difficulty: "Easy",
    tags: ["Python", "Data Structures"],
  },
  {
    id: "java-inheritance",
    title: "Java Class Inheritance",
    description: "Create a 'Dog' class that inherits from an 'Animal' class, overriding a method to make a specific sound.",
    difficulty: "Medium",
    tags: ["Java", "OOP"],
  },
  {
    id: "sql-join-query",
    title: "SQL Join Query",
    description: "Write a SQL query to join 'Orders' and 'Customers' tables, returning the order ID and customer name.",
    difficulty: "Medium",
    tags: ["SQL", "Database"],
  }
];

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
