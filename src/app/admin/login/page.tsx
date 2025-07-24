import { LoginForm } from "@/components/login-form";

export default function AdminLoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <LoginForm userType="Admin" />
    </div>
  );
}
