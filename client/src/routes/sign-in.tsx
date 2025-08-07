import { LoginForm } from "@/components/login-form";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/sign-in")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex h-svh w-full flex-col items-center justify-center gap-10 bg-white">
      <LoginForm />
    </div>
  );
}
