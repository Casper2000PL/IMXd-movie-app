import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/profile/$profileId/settings")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/profile/$profileId/settings"!</div>;
}
