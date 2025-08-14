import { LoginForm } from "@/components/login-form";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/register/sign-in")({
  component: SignInPage,
});

function SignInPage() {
  return <LoginForm />;
}
