import Navbar from "@/components/navbar";
import { Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { Toaster } from "sonner";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <>
      <div className="text-foreground bg-custom-white flex min-h-screen w-full flex-col">
        <Navbar />
        <main className="flex w-full justify-center">
          {/* This is where the nested routes will be rendered */}
          <Outlet />
          <Toaster />
        </main>
      </div>

      {/* Tanstack router stuff */}
      {/* Devtools for debugging the router */}
      <TanStackRouterDevtools position="bottom-left" />
    </>
  );
}
