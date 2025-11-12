import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { ChevronDownIcon, CircleUserRoundIcon, Loader } from "lucide-react";
import { useState } from "react";
import { User } from "shared/src/types";
import NavButton from "./nav-button";
import AutoCompleteSearchbar from "./auto-complete-searchbar";

const Navbar = () => {
  const { data: session, isPending: authLoading } = authClient.useSession();
  const isLoggedIn = !!session && !authLoading;
  const [open, setOpen] = useState(false);

  const user = session?.user as User;

  return (
    <div className="flex h-14 w-full items-center justify-between bg-gray-900 px-4">
      <div className="container mx-auto flex max-w-7xl items-center justify-between">
        <Link to="/">
          <div className="bg-custom-yellow-100 flex h-8 w-16 items-center justify-center rounded-sm">
            <p
              className="font-impact text-lg font-normal tracking-wide text-black"
              style={{
                transform: "scaleY(1.25) scaleX(1.25)",
                alignContent: "center",
              }}
            >
              IMXd
            </p>
          </div>
        </Link>
        <AutoCompleteSearchbar />
        {authLoading ? (
          <Loader className="size-5 animate-spin text-white" />
        ) : isLoggedIn ? (
          <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
              <NavButton>
                {user.image ? (
                  <img
                    src={encodeURI(user.image)}
                    alt={user.name.charAt(0)}
                    className="size-6 rounded-full object-cover object-top"
                  />
                ) : (
                  <CircleUserRoundIcon className="size-6" />
                )}
                {user.name}
                <ChevronDownIcon
                  className={cn(
                    "size-4 transition-all duration-200",
                    open && "rotate-180",
                  )}
                />
              </NavButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="font-roboto h-full w-45 rounded-xs border-0 bg-gray-800 p-0 py-2 font-normal text-white!"
              align="end"
            >
              <DropdownMenuItem className="p-0 text-base">
                <div className="flex w-full bg-gray-800">
                  <Link
                    to="/profile/$profileId"
                    params={{ profileId: user.id }}
                    className="w-full bg-gray-800 py-2.5 pl-4 hover:bg-white/10! hover:text-white!"
                  >
                    Your Profile
                  </Link>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem className="p-0 text-base">
                <div className="flex w-full bg-gray-800">
                  <Link
                    to="/profile/$profileId"
                    params={{ profileId: user.id }}
                    className="w-full bg-gray-800 py-2.5 pl-4 hover:bg-white/10! hover:text-white!"
                  >
                    Your Watchlist
                  </Link>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem className="p-0 text-base">
                <div className="flex w-full bg-gray-800">
                  <Link
                    to="/profile/$profileId"
                    params={{ profileId: user.id }}
                    className="w-full bg-gray-800 py-2.5 pl-4 hover:bg-white/10! hover:text-white!"
                  >
                    Your Ratings
                  </Link>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem className="p-0 text-base">
                <div className="flex w-full bg-gray-800">
                  <Link
                    to="/profile/$profileId"
                    params={{ profileId: user.id }}
                    className="w-full bg-gray-800 py-2.5 pl-4 hover:bg-white/10! hover:text-white!"
                  >
                    Your Lists
                  </Link>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem className="p-0 text-base">
                <div className="flex w-full bg-gray-800">
                  <Link
                    to="/profile/$profileId"
                    params={{ profileId: user.id }}
                    className="w-full bg-gray-800 py-2.5 pl-4 hover:bg-white/10! hover:text-white!"
                  >
                    Your Watch History
                  </Link>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem className="p-0 text-base">
                <div className="flex w-full bg-gray-800">
                  <Link
                    to="/profile/$profileId/settings"
                    params={{ profileId: user.id }}
                    className="w-full bg-gray-800 py-2.5 pl-4 hover:bg-white/10! hover:text-white!"
                  >
                    Account Settings
                  </Link>
                </div>
              </DropdownMenuItem>
              {user.role === "ADMIN" && (
                <DropdownMenuItem className="p-0 text-base">
                  <div className="flex w-full bg-gray-800">
                    <Link
                      to="/add-content"
                      className="w-full bg-red-500/25 py-2.5 pl-4 hover:bg-red-500/50! hover:text-white!"
                    >
                      Add Content
                    </Link>
                  </div>
                </DropdownMenuItem>
              )}
              {user.role === "ADMIN" && (
                <DropdownMenuItem className="p-0 text-base">
                  <div className="flex w-full bg-gray-800">
                    <Link
                      to="/add-people"
                      className="w-full bg-red-500/25 py-2.5 pl-4 hover:bg-red-500/50! hover:text-white!"
                    >
                      Add People
                    </Link>
                  </div>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem asChild>
                <button
                  onClick={() => authClient.signOut()}
                  className="w-full py-2.5 pl-4 text-base! hover:bg-white/15! hover:text-white!"
                >
                  Sign out
                </button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link to="/register">
            <NavButton>Sign in</NavButton>
          </Link>
        )}
      </div>
    </div>
  );
};

export default Navbar;
