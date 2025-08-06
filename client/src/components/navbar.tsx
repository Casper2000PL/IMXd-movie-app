import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import NavButton from "./nav-button";
import { ChevronDownIcon, CircleUserRoundIcon } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";

const Navbar = async () => {
  const { data: session } = await authClient.useSession();
  const isLoggedIn = !!session;
  console.log("isLoggedIn: ", isLoggedIn);

  return (
    <div className="flex h-14 w-full items-center justify-between bg-gray-900 px-4">
      <div className="container mx-auto flex max-w-7xl items-center justify-between">
        <Link to="/">
          {" "}
          <div className="flex h-8 w-16 items-center justify-center rounded-sm bg-amber-300">
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

        {isLoggedIn ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <NavButton>
                <CircleUserRoundIcon className="size-6" />
                {session.user.name}
                <ChevronDownIcon className="size-4" />
              </NavButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="font-roboto h-full w-45 rounded-xs border-0 bg-gray-800 p-0 py-2 font-normal text-white!"
              align="end"
            >
              <DropdownMenuItem className="rounded-x py-3 pl-4 text-base hover:bg-white/10! hover:text-white!">
                Your Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="py-2.5 pl-4 text-base hover:bg-white/15! hover:text-white!">
                Your Watchlist
              </DropdownMenuItem>
              <DropdownMenuItem className="py-2.5 pl-4 text-base hover:bg-white/15! hover:text-white!">
                Your Ratings
              </DropdownMenuItem>
              <DropdownMenuItem className="py-2.5 pl-4 text-base hover:bg-white/15! hover:text-white!">
                Your Lists
              </DropdownMenuItem>
              <DropdownMenuItem className="py-2.5 pl-4 text-base hover:bg-white/15! hover:text-white!">
                Your Watch History
              </DropdownMenuItem>
              <DropdownMenuItem className="py-2.5 pl-4 text-base hover:bg-white/15! hover:text-white!">
                Account Settings
              </DropdownMenuItem>
              <DropdownMenuItem
                className="py-2.5 pl-4 text-base hover:bg-white/15! hover:text-white!"
                asChild
              >
                <button onClick={() => authClient.signOut()} className="w-full">
                  Sign out
                </button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex items-center gap-2">
            <Link to="/sign-in">
              <NavButton>Sign In</NavButton>
            </Link>
            <Link to="/sign-up">
              <NavButton>Sign Up</NavButton>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
