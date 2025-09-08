import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/profile/$profileId/edit-profile")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/profile/$profileId/edit-profile"!</div>;
}
