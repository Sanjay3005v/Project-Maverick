
import { ChallengeManagement } from "@/components/challenge-management";

export default function AdminChallengesPage() {
  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8">
      <header>
        <h1 className="text-4xl font-headline font-bold">Challenge Management</h1>
        <p className="text-muted-foreground">
          Create, view, and manage coding challenges for your trainees using AI.
        </p>
      </header>
      <section>
        <ChallengeManagement />
      </section>
    </div>
  );
}
