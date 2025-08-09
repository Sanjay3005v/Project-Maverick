
import { AssignmentProgressTable } from "@/components/assignment-progress-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default function AssignmentProgressPage() {
    return (
        <div className="container mx-auto p-4 md:p-8 space-y-8">
            <header>
                <h1 className="text-4xl font-headline font-bold">Assignment Progress</h1>
                <p className="text-muted-foreground">
                    Track the completion status of assignments across all trainees and their onboarding plans.
                </p>
            </header>
            <section>
                <AssignmentProgressTable />
            </section>
            <div className="text-center mt-12">
                <Link href="/admin/dashboard">
                    <Button variant="outline">Back to Dashboard</Button>
                </Link>
            </div>
        </div>
    );
}
