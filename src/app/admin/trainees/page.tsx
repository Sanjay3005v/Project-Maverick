import { ManageTraineeForm } from "@/components/manage-trainee-form";

const freshers = [
  { id: 1, name: "Alice Johnson", department: "Engineering", progress: 75, status: "On Track" },
  { id: 2, name: "Bob Williams", department: "Engineering", progress: 45, status: "Needs Attention" },
  { id: 3, name: "Charlie Brown", department: "Product", progress: 90, status: "Exceeding" },
  { id: 4, name: "Diana Miller", department: "Design", progress: 60, status: "On Track" },
  { id: 5, name: "Ethan Davis", department: "Engineering", progress: 20, status: "At Risk" },
];

export default function ManageTraineesPage({
  searchParams,
}: {
  searchParams: { id?: string };
}) {
  const traineeId = searchParams.id ? parseInt(searchParams.id) : null;
  const trainee = traineeId ? freshers.find(f => f.id === traineeId) : null;
  const pageTitle = trainee ? `Edit Trainee: ${trainee.name}` : "Add New Trainee";
  const pageDescription = trainee
    ? "Update the details for the selected trainee."
    : "Fill out the form below to add a new trainee to the system.";
  
  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8">
      <header>
        <h1 className="text-4xl font-headline font-bold">{pageTitle}</h1>
        <p className="text-muted-foreground">{pageDescription}</p>
      </header>
      <section className="max-w-2xl mx-auto">
        <ManageTraineeForm trainee={trainee} />
      </section>
    </div>
  );
}
