
import { QuizManagement } from "@/components/quiz-management";

export default function AdminQuizzesPage() {
  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8">
      <header>
        <h1 className="text-4xl font-headline font-bold">Quiz Management</h1>
        <p className="text-muted-foreground">
          Create, view, and assign quizzes for your trainees.
        </p>
      </header>
      <section>
        <QuizManagement />
      </section>
    </div>
  );
}
