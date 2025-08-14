import { SignUpForm } from "@/components/signup-form";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/register/sign-up")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <SignUpForm />
    </div>
  );
}
