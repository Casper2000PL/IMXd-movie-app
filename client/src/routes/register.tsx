import "@/assets/logo_icon.svg";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/register")({
  component: RegisterLayout,
});

function RegisterLayout() {
  return (
    <div className="max-xs:flex-col max-xs:px-4 container mx-auto flex max-w-7xl items-start justify-center gap-10 py-10">
      <Outlet />
    </div>
  );
}
