
import { AssignmentProgressTable } from "@/components/assignment-progress-table";
import { TraineeProgressTable } from "@/components/trainee-progress-table";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default function AssignmentProgressPage() {
    return (
        <div className="container mx-auto p-4 md:p-8 space-y-8">
            <header>
                <h1 className="text-4xl font-headline font-bold">Assignment Progress</h1>
                <p className="text-muted-foreground">
                    Track the completion status of assignments. View progress grouped by assignment or by trainee.
                </p>
            </header>
            
            <Tabs defaultValue="by-assignment">
                <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
                    <TabsTrigger value="by-assignment">By Assignment</TabsTrigger>
                    <TabsTrigger value="by-trainee">By Trainee</TabsTrigger>
                </TabsList>
                <TabsContent value="by-assignment">
                    <AssignmentProgressTable />
                </TabsContent>
                <TabsContent value="by-trainee">
                    <TraineeProgressTable />
                </TabsContent>
            </Tabs>

            <div className="text-center mt-12">
                <Link href="/admin/dashboard">
                    <Button variant="outline">Back to Dashboard</Button>
                </Link>
            </div>
        </div>
    );
}
