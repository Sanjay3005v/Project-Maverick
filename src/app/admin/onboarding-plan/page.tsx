import { OnboardingPlanForm } from "@/components/onboarding-plan-form";

export const dynamic = 'force-dynamic';

export default function OnboardingPlanPage() {
  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8">
      <header>
        <h1 className="text-4xl font-headline font-bold">AI Onboarding Planner</h1>
        <p className="text-muted-foreground">
          Provide trainee details and a schedule to generate a personalized onboarding plan.
        </p>
      </header>
      <section>
        <OnboardingPlanForm />
      </section>
    </div>
  );
}
