import { Chatbot } from "@/components/chatbot";
import { Header } from "@/components/header";

export default function TraineeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Chatbot />
    </div>
  );
}
