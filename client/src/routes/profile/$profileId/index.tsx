import { getUserById } from "@/api/user";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";

import {
  BadgeCheckIcon,
  CalendarDaysIcon,
  ScanSearchIcon,
  SettingsIcon,
  Share2Icon,
  User2Icon,
} from "lucide-react";

export const Route = createFileRoute("/profile/$profileId/")({
  component: RouteComponent,
  beforeLoad: ({ params }) => {
    if (!params.profileId) {
      throw redirect({
        to: "/",
      });
    }
  },
  loader: async ({ params }) => {
    const profileInfo = await getUserById(params.profileId);
    return { profileInfo };
  },
});

function RouteComponent() {
  const { profileInfo } = Route.useLoaderData();
  const { profileId } = Route.useParams();

  const session = authClient.useSession();

  const isOwner = session.data?.user?.id === profileId;

  console.log("Profile Info: ", profileInfo.image);

  return (
    <div className="w-full bg-gray-800">
      <div className="mx-auto w-full max-w-7xl px-4 pt-4 pb-8 xl:px-2">
        <div className="flex w-full items-center justify-end">
          {isOwner && (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="cursor-pointer rounded-full p-3 transition-all duration-200 hover:bg-white/10"
                    disabled={!isOwner}
                  >
                    <SettingsIcon className="size-6 text-white" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="font-roboto h-full w-45 rounded-xs border-0 bg-gray-800 p-0 py-2 font-normal text-white!"
                  align="end"
                >
                  <DropdownMenuItem className="rounded-x py-3 pl-4 text-base hover:bg-white/10! hover:text-white!">
                    <Link
                      to="/profile/$profileId/settings"
                      params={{ profileId }}
                    >
                      Account Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="rounded-x py-3 pl-4 text-base hover:bg-white/10! hover:text-white!">
                    <Link
                      to="/profile/$profileId/edit-profile"
                      params={{ profileId }}
                    >
                      Edit Profile
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <div className="h-8 w-[1.5px] rounded-full bg-stone-600" />
            </>
          )}

          <button className="cursor-pointer rounded-full p-3 transition-all duration-200 hover:bg-white/10">
            <Share2Icon className="size-6 text-white" />
          </button>
        </div>
        <div className="flex w-full flex-col items-start justify-between gap-8 lg:flex-row lg:justify-between">
          <div className="flex gap-6">
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="size-20 lg:size-35">
                {profileInfo.image ? (
                  <img
                    src={encodeURI(profileInfo.image)}
                    alt="Profile Picture"
                    className="h-full w-full rounded-full object-cover object-top"
                  />
                ) : (
                  <div className="rounded-full bg-white/5 p-6">
                    <User2Icon className="size-23 text-stone-500" />
                  </div>
                )}
              </div>

              {profileInfo.role === "ADMIN" ? (
                <Badge
                  variant="destructive"
                  className="rounded-full font-medium"
                >
                  <BadgeCheckIcon />
                  Admin
                </Badge>
              ) : (
                <Badge className="rounded-full bg-blue-500 font-medium">
                  <User2Icon />
                  User
                </Badge>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <h1 className="font-sans text-2xl font-semibold text-white lg:text-5xl">
                {profileInfo.name}
              </h1>
              <div className="flex items-center gap-1 lg:gap-2">
                <CalendarDaysIcon
                  className="size-3.5 text-stone-400 lg:size-5"
                  strokeWidth={2.5}
                />
                <p className="font-sans text-xs font-semibold text-stone-400 lg:text-base">
                  {`Joined ${new Date(profileInfo.createdAt).toLocaleDateString(
                    "en-US",
                    {
                      month: "short",
                      year: "numeric",
                    },
                  )}`}
                </p>
              </div>
              {isOwner && (
                <Link
                  to="/profile/$profileId/edit-profile"
                  params={{ profileId }}
                  className="mt-3 w-fit cursor-pointer rounded-full bg-white/10 px-4 py-2 font-sans text-sm font-semibold text-blue-400 transition-all duration-200 hover:bg-blue-300/20"
                >
                  Edit profile
                </Link>
              )}
            </div>
          </div>
          <div className="flex w-full items-center justify-center gap-2 lg:grid lg:w-fit lg:grid-cols-2">
            <button
              className={cn(
                "flex h-20 w-40 flex-1 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-sm bg-white/10 transition-all duration-100 hover:bg-white/15",
                !isOwner && "cursor-default hover:bg-white/10",
              )}
              disabled={!isOwner}
            >
              <p className="font-sans text-sm font-semibold text-stone-400">
                Ratings
              </p>
              <p className="font-sans text-lg font-semibold text-stone-400">
                0
              </p>
            </button>
            <button
              className={cn(
                "flex h-20 w-40 flex-1 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-sm bg-white/10 transition-all duration-100 hover:bg-white/15",
                !isOwner && "cursor-default hover:bg-white/10",
              )}
              disabled={!isOwner}
            >
              <p className="font-sans text-sm font-semibold text-stone-400">
                Watchlist
              </p>
              <p className="font-sans text-lg font-semibold text-stone-400">
                0
              </p>
            </button>
            <button
              className={cn(
                "flex h-20 w-40 flex-1 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-sm bg-white/10 transition-all duration-100 hover:bg-white/15",
                !isOwner && "cursor-default hover:bg-white/10",
              )}
              disabled={!isOwner}
            >
              <p className="font-sans text-sm font-semibold text-stone-400">
                Lists
              </p>
              <p className="font-sans text-lg font-semibold text-stone-400">
                0
              </p>
            </button>
            <button
              className={cn(
                "flex h-20 w-40 flex-1 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-sm bg-white/10 transition-all duration-100 hover:bg-white/15",
                !isOwner && "cursor-default hover:bg-white/10",
              )}
              disabled={!isOwner}
            >
              <p className="font-sans text-sm font-semibold text-stone-400">
                More
              </p>
              <ScanSearchIcon
                className="size-6 text-stone-400"
                strokeWidth={1.8}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
