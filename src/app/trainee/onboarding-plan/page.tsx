import { TraineeOnboardingPlan } from "@/components/trainee-onboarding-plan";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function TraineeOnboardingPlanPage() {
  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8">
      <header>
        <h1 className="text-4xl font-headline font-bold">My Onboarding Plan</h1>
        <p className="text-muted-foreground">
          Describe your goals and preferences to generate a personalized, AI-driven onboarding plan.
        </p>
      </header>
      <section>
        <TraineeOnboardingPlan />
      </section>
       <div className="text-center mt-12">
          <Link href="/trainee/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
      </div>
    </div>
  );
}
