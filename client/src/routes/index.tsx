import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex h-svh w-full bg-black">
      <p className="text-2xl text-white">Hello "/"! Index (main route)!</p>
    </div>
  );
}
