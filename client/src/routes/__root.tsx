import Navbar from "@/components/navbar";
import { Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "sonner";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <>
      <div className="text-foreground bg-custom-white flex min-h-screen w-full flex-col">
        <Navbar />
        <main className="flex h-full w-full justify-center">
          {/* This is where the nested routes will be rendered */}
          <Outlet />
          <Toaster
            richColors
            closeButton
            containerAriaLabel="Notifications"
            position="bottom-right"
            duration={3000}
          />
        </main>
      </div>

      {/* Tanstack router stuff */}
      {/* Devtools for debugging the router */}
      <TanStackRouterDevtools position="bottom-left" />
      <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
    </>
  );
}
