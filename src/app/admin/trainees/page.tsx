
'use client';

import { Suspense } from 'react';
import { ManageTraineeForm } from "@/components/manage-trainee-form";
import { getTraineeById } from "@/services/trainee-service";
import { useEffect, useState, useCallback } from "react";
import type { Trainee } from "@/services/trainee-service";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

export const dynamic = 'force-dynamic';

function ManageTraineesContent() {
  const searchParams = useSearchParams();
  const traineeId = searchParams.get('id');

  const [trainee, setTrainee] = useState<Trainee | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTrainee = useCallback(async () => {
    if (traineeId) {
      setLoading(true);
      const fetchedTrainee = await getTraineeById(traineeId);
      setTrainee(fetchedTrainee);
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [traineeId]);

  useEffect(() => {
    fetchTrainee();
  }, [fetchTrainee]);

  const pageTitle = trainee ? `Edit Trainee: ${trainee.name}` : "Add New Trainee";
  const pageDescription = trainee
    ? "Update the personal details for the selected trainee."
    : "Fill out the form below to add a new trainee to the system.";

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-4">Loading Trainee Data...</p>
      </div>
    );
  }

  return (
    <>
      <header>
        <h1 className="text-4xl font-headline font-bold">{pageTitle}</h1>
        <p className="text-muted-foreground">{pageDescription}</p>
      </header>
      <section className="max-w-2xl mx-auto">
        <ManageTraineeForm trainee={trainee} onTraineeUpdate={fetchTrainee} />
      </section>
    </>
  );
}

export default function ManageTraineesPage() {
  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8">
      <Suspense fallback={
        <div className="flex justify-center items-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="ml-4">Loading Page...</p>
        </div>
      }>
        <ManageTraineesContent />
      </Suspense>
    </div>
  );
}
