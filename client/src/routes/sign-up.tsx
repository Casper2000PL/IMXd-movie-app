/* eslint-disable @typescript-eslint/no-explicit-any */
import { SignUpForm } from "@/components/signup-form";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/sign-up")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex h-svh w-full flex-col items-center justify-center gap-10 bg-black">
      <SignUpForm />
    </div>
  );
}
