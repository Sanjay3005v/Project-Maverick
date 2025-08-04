import { BroadcastForm } from "@/components/broadcast-form";

export const dynamic = 'force-dynamic';

export default function NotificationsPage() {
  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8">
      <header>
        <h1 className="text-4xl font-headline font-bold">Admin Notifications</h1>
        <p className="text-muted-foreground">
          Send announcements and broadcast messages to trainees.
        </p>
      </header>
      <section className="max-w-2xl mx-auto">
        <BroadcastForm />
      </section>
    </div>
  );
}
