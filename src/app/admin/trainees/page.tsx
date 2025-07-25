import { ManageTraineeForm } from "@/components/manage-trainee-form";

const freshers = [
  { id: 1, name: "Alice Johnson", department: "Engineering", dob: "1998-07-15" },
  { id: 2, name: "Bob Williams", department: "Engineering", dob: "1999-02-20" },
  { id: 3, name: "Charlie Brown", department: "Product", dob: "1997-11-30" },
  { id: 4, name: "Diana Miller", department: "Design", dob: "2000-05-25" },
  { id: 5, name: "Ethan Davis", department: "Engineering", dob: "1999-09-01" },
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
    ? "Update the personal details for the selected trainee."
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
