import "@/assets/logo_icon.svg";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/register")({
  component: RegisterLayout,
});

function RegisterLayout() {
  return (
    <div className="max-xs:flex-col max-xs:px-4 flex h-full w-full max-w-7xl items-start justify-center gap-10 py-10 max-xl:px-10 max-sm:px-4">
      <Outlet />
    </div>
  );
}
