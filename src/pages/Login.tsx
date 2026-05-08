import { AuthLayout } from "@/components/auth/AuthLayout";
import { LoginForm } from "@/components/auth/LoginForm";

export default function Login() {
  return (
    <AuthLayout title="Logowanie" subtitle="Zaloguj się do konta.">
      <LoginForm />
    </AuthLayout>
  );
}